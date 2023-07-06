import { Cluster } from "../domain/container-service/cluster";
import { Container } from "../domain/container-service/Container";
import { IContainerServiceRepository } from "../repository/IContainerServiceRepository";
import { ILoadBalancerRepository } from "../repository/ILoadBalancerRepository";
import { IVpcRepository } from "../repository/IVpcRepository";

export function DeployerWorkAdventure(loadBalancerRepository: ILoadBalancerRepository, vpcRepository: IVpcRepository, awsContainerServiceRepository: IContainerServiceRepository) {
    const cluster = new Cluster("cluster-workadventure");
    const container = new Container("workadventure", "256", "512", "awsvpc");

    const traefikTargetGroup = loadBalancerRepository.GetDeployedResource("traefik-target-group");
    const traefikAPITargetGroup = loadBalancerRepository.GetDeployedResource("traefikAPI-target-group");
    const traefikListener = loadBalancerRepository.GetDeployedResource("traefik-listener");
    const traefikAPIListener = loadBalancerRepository.GetDeployedResource("traefikAPI-listener");
    const httpsListener = loadBalancerRepository.GetDeployedResource("https-listener");
    const subnetPrivateA = vpcRepository.GetDeployedResource("private-a");
    const subnetPrivateB = vpcRepository.GetDeployedResource("private-b");
    const securityGroup = vpcRepository.GetDeployedResource("default-sg");

    /** Test service discovery */
    const serviceConnect = vpcRepository.GetDeployedResource("service-workadventure");

    /** Test EFS */
    const deployedEfs = vpcRepository.GetDeployedResource("efs-workadventure");
    
    /** Pour tester si l'app marhce bien sans traefik */
    // const waTargetGroup = loadBalancerRepository.GetDeployedResource("wa-target-group");
    // const waListener = loadBalancerRepository.GetDeployedResource("wa-listener");

    awsContainerServiceRepository.deploy({
        cluster, 
        container, 
        targetGroups: [traefikTargetGroup, traefikAPITargetGroup], 
        listeners: [traefikListener, traefikAPIListener, httpsListener], 
        subnets: [subnetPrivateA, subnetPrivateB], 
        securityGroup,
        serviceConnect,
        deployedEfs
    });
}