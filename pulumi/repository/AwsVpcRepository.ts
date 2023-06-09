import * as aws from "@pulumi/aws";
import { Vpc } from "../domain/vpc/vpc";
import { VpcRepository } from "./VpcRepository";
import * as variables from "../variables";
import { Association, Route, RouteTable, TargetType } from "../domain/vpc/RouteTable";
import { Eip } from "../domain/vpc/Eip";
import { Subnet } from "../domain/vpc/subnet";
import { NatGateway } from "../domain/vpc/NatGateway";
import { SecurityGroup } from "../domain/vpc/SecurityGroup";

export class AwsVpcRepository implements VpcRepository{
    private resourceMap: Map<string, any>;

    constructor() {
        this.resourceMap = new Map<string, any>();
    }

    private AddResource(resourceName: string, resourceType: any): void {
        this.resourceMap.set(resourceName, resourceType);
    }

    private GetDeployedResource(resourceName: string): any {
        // gerer les exceptions, par exemple, s'il n'existe pas une resource avec ce nom (resourceMap.has())
        return this.resourceMap.get(resourceName);
    }

    private CreateVpc(vpc: Vpc): void {
        let vpcDeployed = new aws.ec2.Vpc(vpc.getName(), {
            cidrBlock: vpc.getCidrBlock(),
            tags: variables.defaultTags
        });
        this.AddResource(vpc.getName(), vpcDeployed);
    }

    private CreateInternetGateway(vpc: Vpc): void {
        let vpcDeployed = this.GetDeployedResource(vpc.getName());
        let internetGatewayDeployed = new aws.ec2.InternetGateway(vpc.getInternetGateway()!.getName(), {
            vpcId: vpcDeployed.id,
            tags: variables.defaultTags
        });
        this.AddResource(vpc.getInternetGateway()!.getName(), internetGatewayDeployed);
    }

    private CreateEip(eip: Eip): void {
        let eipDeployed = new aws.ec2.Eip(eip.getName(), {
            vpc: eip.IsInVpc(),
            tags: variables.defaultTags
        });
        this.AddResource(eip.getName(), eipDeployed);
    }

    private CreateNatGateway(nat: NatGateway, subnet: Subnet) {
        let subnetDeployed = this.GetDeployedResource(subnet.getName());
        if (nat.IsPublic()) {
            let eipDeployed = this.GetDeployedResource(nat.getEip()!.getName());
            
            // Si le Eip lié n'a pas été déployé dans l'use case
            if (eipDeployed == null) {
                this.CreateEip(nat.getEip()!)
                eipDeployed = this.GetDeployedResource(nat.getEip()!.getName());
            }

            let natDeployed = new aws.ec2.NatGateway(nat.getName(), {
                subnetId: subnetDeployed.id,
                connectivityType: "public",
                allocationId: eipDeployed.id,
                tags: variables.defaultTags
            });
            this.AddResource(nat.getName(), natDeployed);
        }
        else {
            let natDeployed = new aws.ec2.NatGateway(nat.getName(), {
                subnetId: subnetDeployed.id,
                connectivityType: "private",
                tags: variables.defaultTags
            });
            this.AddResource(nat.getName(), natDeployed);
        }
    }

    private CreateSubnet(vpc: Vpc, subnet: Subnet) {
        let vpcDeployed = this.GetDeployedResource(vpc.getName());
        let subnetDeployed = new aws.ec2.Subnet(subnet.getName(), {
            vpcId: vpcDeployed.id,
            cidrBlock: subnet.getCidrBlock(),
            availabilityZone: subnet.getAvailabilityZone(),
            tags: variables.defaultTags
        });
        this.AddResource(subnet.getName(), subnetDeployed);

        // S'il y a des NAT à l'interieur de cette subnet, on les deploie
        if (subnet.getNatGateways() != null) {
            for (let natIndex in subnet.getNatGateways()) {
                this.CreateNatGateway(subnet.getNatGateways()[natIndex], subnet)                
            }
        }
    }

    // Faire deux fonctions differentes : une pour chaque type de target
    // ex. CreateRouteIG() & CreateRouteNat()
    private CreateRoute(route: Route, routeTableDeployed: aws.ec2.RouteTable) {
        switch (route.targetType) {
            case TargetType.InternetGateway:
                let internetGatewayDeployed = this.GetDeployedResource(route.target.targetInternetGateway!.getName());
                let routeDeployedIGW = new aws.ec2.Route("route-" + TargetType[TargetType.InternetGateway], {
                    routeTableId: routeTableDeployed.id,
                    destinationCidrBlock: route.destinationCidr,
                    gatewayId: internetGatewayDeployed.id,
                });
                this.AddResource("route-" + TargetType[TargetType.InternetGateway], routeDeployedIGW);
                break;

            case TargetType.NatGateway:
                let natDeployed = this.GetDeployedResource(route.target.targetNatGateway!.getName());
                let routeDeployedNAT = new aws.ec2.Route("route-" + TargetType[TargetType.NatGateway], {
                    routeTableId: routeTableDeployed.id,
                    destinationCidrBlock: route.destinationCidr,
                    natGatewayId: natDeployed.id
                });
                this.AddResource("route-" + TargetType[TargetType.NatGateway], routeDeployedNAT);
                break;
        
            default:
                break;
        }
    }

    private CreateRouteTableAssociation(asso: Association, routeTableDeployed: aws.ec2.RouteTable) {
        let subnetDeployed = this.GetDeployedResource(asso.target.getName());
        let association = new aws.ec2.RouteTableAssociation("association-" + asso.target.getName(), {
            subnetId: subnetDeployed.id,
            routeTableId: routeTableDeployed.id
        });
        this.AddResource("association-" + asso.target.getName(), association);
    }

    private CreateRouteTable(vpc: Vpc, routeTable: RouteTable) {
        let vpcDeployed = this.GetDeployedResource(vpc.getName());
        let routeTableDeployed = new aws.ec2.RouteTable(routeTable.getName(), {
            vpcId: vpcDeployed.id,
        });
        this.AddResource(routeTable.getName(), routeTableDeployed);

        // On ajoute toutes les routes existantes dans la Route Table
        if (routeTable.getRoutes() != null) {
            for (let route of routeTable.getRoutes()) {
                this.CreateRoute(route, routeTableDeployed);
            }  
        }

        // On crée toutes les associations
        if (routeTable.getAssociations() != null) {
            for (let asso of routeTable.getAssociations()) {
                this.CreateRouteTableAssociation(asso, routeTableDeployed);
            }  
        }
    }

    private CreateSecurityGroup(vpc: Vpc, sg: SecurityGroup) {
        let vpcDeployed = this.GetDeployedResource(vpc.getName());
        let securityGroupDeployed = new aws.ec2.SecurityGroup(sg.getName(), {
            vpcId: vpcDeployed.id,
            ingress: sg.getInboundRules(),
            egress: sg.getOutboundRules(),
        })
        this.AddResource(sg.getName(), securityGroupDeployed);
    }

    public deploy(vpc: Vpc): void {
        // Deploiement du VPC
        this.CreateVpc(vpc);

        // Deploiement de l'internet gateway (s'il en existe un)
        if (vpc.getInternetGateway() != null) {
            this.CreateInternetGateway(vpc);
        }
        
        // Deploiement des EIP s'il y en a
        if (vpc.getEips() != null) {
            for (let eip of vpc.getEips()) {
                this.CreateEip(eip);
            }
        }

        // Deploiement des subnets
        if (vpc.getSubnets() != null) {
            for (let subnet of vpc.getSubnets()) {
                this.CreateSubnet(vpc, subnet);
            }
        }

        // Deploiment des route tables (s'ils existent)
        if (vpc.getRouteTables() != null) {
            for (let routeTable of vpc.getRouteTables()) {
                this.CreateRouteTable(vpc, routeTable);
            }
        }

        // Deploiment des security groups (s'ils existent)
        if (vpc.getSecurityGroups() != null) {
            for (let sg of vpc.getSecurityGroups()) {
                this.CreateSecurityGroup(vpc, sg);
            }
        }

        // for (let [key, value] of this.resourceMap) {
        //     console.log(key);
        // }
    }
}