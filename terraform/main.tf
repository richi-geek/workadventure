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

module "instance" {
  source = "./modules/instance"

  aws_region    = "eu-west-3"
  azs           = "eu-west-3a"
  instance_type = "t2.micro"
  public_key    = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKH0xK5oup7Sr0pLwYU4FOhV3pGT3r2TY6lkWHdwSBru terraform"
}
