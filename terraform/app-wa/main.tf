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
  count = 9
  source = "../modules/instance"

  instance_type      = "t3.medium"
  ami                = "ami-05e8e219ac7e82eba"
  subnet_id          = module.network.public_subnet_id
  security_group_ids = [module.network.security_group_id]
  default_tags = {
    Name = "RICI - Server ${count.index}"
    Owner = "RICI"
  }
}

module "dns" {
  source = "../modules/dns"

  workadventure_records = {
    "workadventure" = module.public_instance[0].public_ip
    "*.workadventure" = module.public_instance[0].public_ip
    # "api.workadventure" = module.public_instance[1].public_ip
    # "chat.workadventure" = module.public_instance[1].public_ip
    # "ejabberd.workadventure" = module.public_instance[1].public_ip
    # "icon.workadventure" = module.public_instance[1].public_ip
    # "play.workadventure" = module.public_instance[1].public_ip
    # "uploader.workadventure" = module.public_instance[1].public_ip
  }
}

output "public_instance" {
  value = module.public_instance
}
