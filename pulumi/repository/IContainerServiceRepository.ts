import { Cluster } from "../domain/container-service/cluster";
import { Container } from "../domain/container-service/Container";

export interface IContainerServiceRepository {
    deploy({
        cluster, 
        container, 
        targetGroups, 
        listeners, 
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
    }): void;
}
