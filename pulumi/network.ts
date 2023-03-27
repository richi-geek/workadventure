import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const anyoneCIDR: string = "0.0.0.0/0";

// typer les resources: bonne pratique ?

export interface Network {
    securityGroup: aws.ec2.SecurityGroup;
    subnet: aws.ec2.Subnet;
}

export function CreateNetwork(
    vpcName: string,
    vpcCIDR: pulumi.Input<string>, 
    subnetCIDR: pulumi.Input<string>, 
    sgProtocol: pulumi.Input<string>, 
    sgPort: number,
): Network {
    const vpc = new aws.ec2.Vpc(vpcName, {
        cidrBlock: vpcCIDR,
        tags: {
            Name: vpcName
        }
    });
    
    const gateway = new aws.ec2.InternetGateway(vpcName + "gateway", {
        vpcId: vpc.id,
    });
    
    const subnet = new aws.ec2.Subnet(vpcName + "subnet", {
        vpcId: vpc.id,
        cidrBlock: subnetCIDR,
        mapPublicIpOnLaunch: true,
    });
    
    const route = new aws.ec2.Route(vpcName + "igw_route", {
        routeTableId: vpc.defaultRouteTableId,
        gatewayId: gateway.id,
        destinationCidrBlock: anyoneCIDR
    });
    
    const securityGroup = new aws.ec2.SecurityGroup(vpcName + "security-group", {
        vpcId: vpc.id,
        ingress: [
            {
                cidrBlocks: [ anyoneCIDR ],
                protocol: sgProtocol,
                fromPort: sgPort,
                toPort: sgPort,
            },
        ],
        egress: [
            {
                cidrBlocks: [ anyoneCIDR ],
                fromPort: 0,
                toPort: 0,
                protocol: "-1",
            },
        ],
    });

    return {securityGroup, subnet};
}
    