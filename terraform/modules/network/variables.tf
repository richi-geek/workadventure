variable "anyone_cidr" {
  description = "The anyone CIDR block."
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

variable "default_tags" {
  default = {
    Name = "RICI - TF"
    Owner = "RICI"
  }
}
