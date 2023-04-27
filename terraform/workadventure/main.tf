terraform {
  backend "s3" {
    bucket  = "ocho-ninja-state-backend"
    key     = "RICI/38-workadventure/terraform.state"
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
  alias  = "euw3"
  region = "eu-west-3"
}

module "network" {
  source = "../modules/network"

  azs            = "eu-west-3a"
}

module "public_instance" {
  count = 2
  source = "../modules/instance"

  instance_type      = "t3.large"
  ami                = "ami-05e8e219ac7e82eba"
  subnet_id          = module.network.public_subnet_id
  security_group_ids = [module.network.security_group_id]
  default_tags = {
    Name = "Server ${count.index}"
    Owner = "RICI"
  }
}

output "public_instance" {
  value = module.public_instance
}


