import * as aws from "@pulumi/aws";
import * as variables from "../variables";
import * as fs from "fs";
import { IContainerServiceRepository } from "./IContainerServiceRepository";
import { Cluster } from "../domain/container-service/cluster";
import { Container } from "../domain/container-service/Container";

export class AwsContainerServiceRepository implements IContainerServiceRepository {
    private CreateRoles() {
        const traefikRole = new aws.iam.Role("traefikRole", {
            name: "traefikRole",
            assumeRolePolicy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [{
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Sid: "",
                    Principal: {
                        Service: "ecs-tasks.amazonaws.com",
                    },
                }],
            }),
            tags: variables.GetTagWithResourceName("traefikRole")
        });
    
        const traefikPolicyDocument = aws.iam.getPolicyDocumentOutput({
            statements: [{
                sid: "main",
                actions: [
                    "ecs:ListClusters",
                    "ecs:DescribeClusters",
                    "ecs:ListTasks",
                    "ecs:DescribeTasks",
                    "ecs:DescribeContainerInstances",
                    "ecs:DescribeTaskDefinition",
                    "ec2:DescribeInstances"
                ],
                resources: ["*"],
            }],
        });
    
        const traefikPolicy = new aws.iam.RolePolicy("traefikPolicy", {
            name: "traefikPolicy",
            role: traefikRole.id,
            policy: traefikPolicyDocument.apply(traefikPolicyDocument => traefikPolicyDocument.json)
        });
    
        const ecsRole = new aws.iam.Role("ecsRole", {
            name: "ecsRole",
            assumeRolePolicy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [{
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Sid: "",
                    Principal: {
                        Service: "ecs-tasks.amazonaws.com",
                    },
                }],
            }),
            tags: variables.GetTagWithResourceName("ecsRole")
        });
    
        const ecsPolicy = new aws.iam.RolePolicyAttachment("ecsPolicy", {
            role: ecsRole.name,
            policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
        });
    
        const ecsPolicySecrets = new aws.iam.RolePolicyAttachment("ecsPolicySecrets", {
            role: ecsRole.name,
            policyArn: "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
        });

        return {traefikRole, ecsRole};
    }

    private CreateLogGroup() {
        const logGroup = new aws.cloudwatch.LogGroup("ecs/WorkAdventure", {
            name: "/ecs/WorkAdventure",
            retentionInDays: 1,
            tags: variables.GetTagWithResourceName("logGroup - ecs/WorkAdventure")
        });
    }

    private CreateTaskDefinition(nom: string, containerDefinitions: string, ecsRole: any, cpu: string = "256", memory: string = "512", networkMode: string = "awsvpc") {
        const taskDefinition = new aws.ecs.TaskDefinition(nom, {
            family: nom,
            cpu: cpu,
            memory: memory,
            containerDefinitions: containerDefinitions,
            networkMode: networkMode,
            requiresCompatibilities: ["FARGATE"],
            executionRoleArn: ecsRole.arn,
            tags: variables.GetTagWithResourceName(nom)
        });

        return taskDefinition;
    }

    private createService(nom: string, serviceDiscovery: boolean, deployedCluster: any, taskDefinition: any, desiredCount: number, subnetIds: any[], securityGroupIds: any[], listeners: any[], serviceConnect?: any) {
        var deployedService;
        switch (serviceDiscovery) {
            case true:
                const serviceDiscovery = new aws.servicediscovery.Service(nom, {
                    name: nom,
                    namespaceId: serviceConnect.id,
                    dnsConfig: {
                        namespaceId: serviceConnect.id,
                        dnsRecords: [{
                            ttl: 60,
                            type: "A",
                        }],
                        routingPolicy: "MULTIVALUE",
                    },
                    healthCheckCustomConfig: {
                        failureThreshold: 1,
                    },
                });
                deployedService = new aws.ecs.Service(nom, {
                    name: nom,
                    launchType: "FARGATE",
                    cluster: deployedCluster.id,
                    taskDefinition: taskDefinition.arn,
                    desiredCount: desiredCount,
                    enableEcsManagedTags: true,
                    propagateTags: "SERVICE",
                    serviceRegistries: {
                        registryArn: serviceDiscovery.arn,
                    },
                    networkConfiguration: {
                        subnets: subnetIds,
                        securityGroups: securityGroupIds
                    },
                    tags: variables.defaultTags
                }, {
                    dependsOn: listeners,
                });
                break;
        
            default:
                deployedService = new aws.ecs.Service(nom, {
                    name: nom,
                    launchType: "FARGATE",
                    cluster: deployedCluster.id,
                    taskDefinition: taskDefinition.arn,
                    desiredCount: desiredCount,
                    enableEcsManagedTags: true,
                    propagateTags: "SERVICE",
                    
                    networkConfiguration: {
                        subnets: subnetIds,
                        securityGroups: securityGroupIds
                    },
                    tags: variables.defaultTags
                }, {
                    dependsOn: listeners,
                });
                break;
        }

        return deployedService;
    }

    public deploy({
        cluster, 
        container, 
        targetGroups: [targetGroupTraefik, targetGroupTraefikAPI],
        listeners: [traefikListener, traefikAPIListener, httpsListener], 
        subnets: [subnetPrivateA, subnetPrivateB], 
        securityGroup,
        serviceConnect,
        deployedEfs
    }: {
        cluster: Cluster, 
        container: Container, 
        targetGroups: any[], 
        listeners: any[], 
        subnets: any[], 
        securityGroup: any,
        serviceConnect: any,
        deployedEfs: any
    }): void {
        const subnets = [subnetPrivateA, subnetPrivateB];
        
        const {traefikRole, ecsRole} = this.CreateRoles();
        this.CreateLogGroup();


        /** Creation des TaskDefinitions a partir des fichiers JSON */
        const traefikTemplate = fs.readFileSync('traefik.json').toString();
        
        // Services WorkAdventure
        const backContainerDefinition = fs.readFileSync("wa-back.json").toString();
        const chatContainerDefinition = fs.readFileSync("wa-chat.json").toString();
        const ejabberdContainerDefinition = fs.readFileSync("wa-ejabberd.json").toString();
        const iconContainerDefinition = fs.readFileSync("wa-icon.json").toString();
        const mapStorageContainerDefinition = fs.readFileSync("wa-map-storage.json").toString();
        const playContainerDefinition = fs.readFileSync("wa-play.json").toString();
        const redisContainerDefinition = fs.readFileSync("wa-redis.json").toString();
        const uploaderContainerDefinition = fs.readFileSync("wa-uploader.json").toString();

        const ejabberdTaskDefinition = new aws.ecs.TaskDefinition(container.getName() + "-ejabberd", {
            family: container.getName() + "-ejabberd",
            cpu: "1024",
            memory: "2048",
            containerDefinitions: ejabberdContainerDefinition,
            networkMode: "awsvpc",
            requiresCompatibilities: ["FARGATE"],
            executionRoleArn: ecsRole.arn,
            volumes: [
                {
                    name: "efs-workadventure",
                    efsVolumeConfiguration: {
                        fileSystemId: deployedEfs.id,
                        transitEncryption: "ENABLED"
                    }
                }
            ],
            tags: variables.GetTagWithResourceName(container.getName() + "-ejabberd")
        });

        const backTaskDefinition = this.CreateTaskDefinition(container.getName() + "-back", backContainerDefinition, ecsRole, "2048", "4096");
        const playTaskDefinition = this.CreateTaskDefinition(container.getName() + "-play", playContainerDefinition, ecsRole, "2048", "4096");

        const uploaderTaskDefinition = this.CreateTaskDefinition(container.getName() + "-uploader", uploaderContainerDefinition, ecsRole, "1024", "2048");
        const mapStorageTaskDefinition = this.CreateTaskDefinition(container.getName() + "-map-storage", mapStorageContainerDefinition, ecsRole, "1024", "2048");

        const redisTaskDefinition = this.CreateTaskDefinition(container.getName() + "-redis", redisContainerDefinition, ecsRole, "256", "512");
        const chatTaskDefinition = this.CreateTaskDefinition(container.getName() + "-chat", chatContainerDefinition, ecsRole, "256", "512");
        const iconTaskDefinition = this.CreateTaskDefinition(container.getName() + "-icon", iconContainerDefinition, ecsRole, "256", "512");
        
        // const whoTaskDefinition = this.CreateTaskDefinition(container.getName() + "-who", whoContainerDefinition, ecsRole);

        /** Creation du cluster et les services */
        const deployedCluster = new aws.ecs.Cluster(cluster.getName(), {
            name: cluster.getName(),
            settings: [{
                name: "containerInsights",
                value: "enabled",
            }],
            tags: variables.defaultTags
        });
     
        deployedCluster.name.apply(name => {
            const traefikContainerDefinition = traefikTemplate.replace("${ecs_cluster_name}", name);
            const traefikTaskDefinition = new aws.ecs.TaskDefinition(container.getName() + "-traefik", {
                family: container.getName() + "-traefik",
                cpu: "512",
                memory: "1024",
                containerDefinitions: traefikContainerDefinition,
                networkMode: container.getNetworkMode(),
                requiresCompatibilities: ["FARGATE"],
                executionRoleArn: ecsRole.arn,
                taskRoleArn: traefikRole.arn,
                tags: variables.defaultTags,
            });

            const traefikServiceDiscovery = new aws.servicediscovery.Service("traefik", {
                name: "traefik",
                namespaceId: serviceConnect.id,
                dnsConfig: {
                    namespaceId: serviceConnect.id,
                    dnsRecords: [{
                        ttl: 60,
                        type: "A",
                    }],
                    routingPolicy: "MULTIVALUE",
                },
                healthCheckCustomConfig: {
                    failureThreshold: 1,
                },
            });

            const traefikService = new aws.ecs.Service("traefik", {
                name: "traefik",
                launchType: "FARGATE",
                cluster: deployedCluster.id,
                taskDefinition: traefikTaskDefinition.arn,
                desiredCount: 1,
                enableEcsManagedTags: true,
                propagateTags: "SERVICE",
                serviceRegistries: {
                    registryArn: traefikServiceDiscovery.arn,
                },
                loadBalancers: [{
                    targetGroupArn: targetGroupTraefik.arn,
                    containerName: "traefik",
                    containerPort: 80,
                }, {
                    targetGroupArn: targetGroupTraefikAPI.arn,
                    containerName: "traefik",
                    containerPort: 8080,
                }],
                networkConfiguration: {
                    subnets: [
                        subnetPrivateA.id,
                        subnetPrivateB.id,
                    ],
                    securityGroups: [ securityGroup.id ]
                },
                tags: variables.defaultTags
            }, {
                dependsOn: [traefikListener, traefikAPIListener, httpsListener, ecsRole],
            });

            const ejabberdService = this.createService("ejabberd", true, deployedCluster, ejabberdTaskDefinition, 1, subnets, [securityGroup], [traefikListener, traefikAPIListener, httpsListener, ecsRole], serviceConnect);
            
            const playService = this.createService("play", true, deployedCluster, playTaskDefinition, 1, subnets, [securityGroup], [traefikListener, traefikAPIListener, httpsListener, ecsRole], serviceConnect);
            const backService = this.createService("back", true, deployedCluster, backTaskDefinition, 1, subnets, [securityGroup], [traefikListener, traefikAPIListener, httpsListener, ecsRole], serviceConnect);

            
            const chatService = this.createService("chat", true, deployedCluster, chatTaskDefinition, 1, subnets, [securityGroup], [traefikListener, traefikAPIListener, httpsListener, ecsRole], serviceConnect);
            const iconService = this.createService("icon", true, deployedCluster, iconTaskDefinition, 1, subnets, [securityGroup], [traefikListener, traefikAPIListener, httpsListener, ecsRole], serviceConnect);
            const mapStorageService = this.createService("map-storage", true, deployedCluster, mapStorageTaskDefinition, 1, subnets, [securityGroup], [traefikListener, traefikAPIListener, httpsListener, ecsRole], serviceConnect);
            const redisService = this.createService("redis", true, deployedCluster, redisTaskDefinition, 1, subnets, [securityGroup], [traefikListener, traefikAPIListener, httpsListener, ecsRole], serviceConnect);
            const uploaderService = this.createService("uploader", true, deployedCluster, uploaderTaskDefinition, 1, subnets, [securityGroup], [traefikListener, traefikAPIListener, httpsListener, ecsRole], serviceConnect);

            // const whoService = this.createService("whoService", deployedCluster, whoTaskDefinition, 1, subnets, [securityGroup], listeners);
            
               
        })
        
    }
}
