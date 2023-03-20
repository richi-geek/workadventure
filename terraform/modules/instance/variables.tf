# Network block

variable "default_cidr" {
  description = "The default CIDR block."
  type        = string
  default     = "0.0.0.0/0"
}

variable "vpc_cidr" {
  description = "The CIDR block for the VPC."
  type        = string
  default     = "172.16.0.0/16"
}

variable "subnet_cidr" {
  description = "The CIDR block for the subnet."
  type        = string
  default     = "172.16.10.0/24"
}

variable "azs" {
  description = "A list of availability zones in the region"
  type        = string
}

# Compute block

variable "aws_region" {
  description = "The region of AWS"
  type        = string
}

variable "instance_type" {
  description = "The instance type of EC2"
  type        = string
}

variable "public_key" {
  description = "SSH public key for the EC2 instance"
  type        = string
}

variable "default_tags" {
  default = {
    Name = "rici-tf"
  }
}
