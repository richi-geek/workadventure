terraform {
  backend "s3" {
    bucket  = "rici-tf-state"
    key     = "state/terraform.state"
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
