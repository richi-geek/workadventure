terraform {
  backend "s3" {
    bucket  = "rici-tf-state"
    key     = "workadventure/terraform.state"
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

  azs = "eu-west-3a"
}

module "workadventure" {
  source = "../modules/instance"

  instance_type      = "t3.large"
  ami                = "ami-05e8e219ac7e82eba"
  keyname            = "rici-ssh-WA"
  public_key         = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIO8U7V6a0/cPtS70bjqcJ7zBVaDjJlWHx0wqpjBJiHQR terraform"
  subnet_id          = module.network.subnet_id
  security_group_ids = [module.network.security_group_id]

  user_data = file("./docker-compose.sh")
}


output "workadventure" {
  value = module.workadventure
}
