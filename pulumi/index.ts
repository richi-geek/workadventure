import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

import * as network from "./network";
import * as instance from "./instance";
import * as fargate from "./fargate"

const config = new pulumi.Config();
const defaultName: string = "rici-pulumi";

// VPC configuration
const vpcCIDR: pulumi.Input<string> = config.require("vpcCIDR");
const subnetCIDR: pulumi.Input<string> = config.require("subnetCIDR");

const awsNetwork: network.Network = network.CreateNetwork(defaultName, vpcCIDR, subnetCIDR, "tcp", 22);

// EC2 configuration
// const instanceType: pulumi.Input<string> = "t2.micro";
// const instanceOwners: string[] = ["amazon"];
const subnetId: pulumi.Input<string> = awsNetwork.subnet.id;
// const securityGroupIds: pulumi.Input<string>[] = [awsNetwork.securityGroup.id];
// const publicKey: pulumi.Input<string> = config.require("publicKey");

// const awsInstance: aws.ec2.Instance = instance.CreateInstance(defaultName, instanceType, instanceOwners, subnetId, securityGroupIds, publicKey);
// export const publicIP = awsInstance.publicIp;

const ecs: awsx.ecs.FargateService = fargate.CreateFargate(subnetId);


