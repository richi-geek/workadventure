import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";


export function CreateFargate(subnetId: pulumi.Input<string>) {

    const service = new awsx.ecs.FargateService("uploader", {
        desiredCount: 1,
        // assignPublicIp: true,
        networkConfiguration: {
            subnets: [subnetId],
        },
        taskDefinitionArgs: {
            containers: {
                uploader: {
                    image: "thecodingmachine/workadventure-uploader:v1.15.10",
                    memory: 512,
                    portMappings: [{
                        containerPort: 8080,
                        hostPort: 8080,
                    }],
                    environment: [{
                        name: "REDIS_HOST",
                        value: "13.38.103.231"
                    },
                    {
                        name: "REDIS_PORT",
                        value: "6379"
                    },
                    {
                        name: "ENABLE_CHAT_UPLOAD",
                        value: "true"
                    },
                    {
                        name: "UPLOAD_MAX_FILESIZE",
                        value: "10485760"
                    },
                    {
                        name: "UPLOADER_URL",
                        value: "https://uploader.workadventure.aws.ocho.ninja"
                    }]
                },
            },
        },

        tags: {"Owner": "RICI"}
    });

    return service;
}


