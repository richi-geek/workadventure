variable "instance_type" {
  description = "The instance type of EC2"
  type        = string
}

variable "ami" {
  description = "The AMI of EC2"
  type        = string
}

variable "public_key" {
  description = "SSH public key for the EC2 instance"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID for the EC2 instance"
  type        = string
}

variable "security_group_ids" {
  description = "Security group ID for the EC2 instance"
  type        = list(string)
}

variable "user_data" {
  description = "user data for the EC2 instance"
  type        = string
  default     = ""
}

variable "default_tags" {
  default = {
    Name = "RICI - TF"
    Owner = "RICI"
  }
}
