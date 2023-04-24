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
  alias  = "euw3"
  region = "eu-west-3"
}

module "network" {
  source = "../modules/network"

  azs = "eu-west-3a"
}

module "backend" {
  source = "../modules/instance"

  instance_type      = "t2.micro"
  ami                = "ami-05e8e219ac7e82eba"
  keyname            = "rici-ssh-backend"
  public_key         = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIO8U7V6a0/cPtS70bjqcJ7zBVaDjJlWHx0wqpjBJiHQR terraform"
  subnet_id          = module.network.subnet_id
  security_group_ids = [module.network.security_group_id]

  user_data = file("./backend.sh")
}

module "frontend" {
  source = "../modules/instance"

  instance_type      = "t2.micro"
  ami                = "ami-05e8e219ac7e82eba"
  keyname            = "rici-ssh-frontend"
  public_key         = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIO8U7V6a0/cPtS70bjqcJ7zBVaDjJlWHx0wqpjBJiHQR terraform"
  subnet_id          = module.network.subnet_id
  security_group_ids = [module.network.security_group_id]

  user_data = templatefile("./frontend.sh", {
    backend_ip = module.backend.public_ip
  })

  depends_on = [
    module.backend
  ]
}

output "backend" {
  value = module.backend
}

output "frontend" {
  value = module.frontend
}
