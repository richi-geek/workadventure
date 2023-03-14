terraform {
  backend "s3" {
    bucket  = "rici-tf-state"
    key     = "terraform.state"
    region  = "eu-west-3"
    encrypt = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "eu-west-3"
}

resource "aws_instance" "app_server" {
  ami           = "ami-05b457b541faec0ca" # Ubuntu Server 22.04 LTS // eu-west-3"
  instance_type = "t2.micro"
  subnet_id     = "subnet-0394232d60f38e28b"
}
