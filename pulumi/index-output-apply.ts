import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("my-bucket");

const userData = pulumi.interpolate`#!/bin/bash
sudo apt update -y
sudo apt install -y apache2 && sudo apt install -y awscli 
aws s3 cp s3://${bucket.id}/index.html /var/www/html/index.html
sudo systemctl start apache2`;

userData.apply(t => {console.log(t)})


// Export the name of the bucket
export const bucketName = bucket.id;