resource "aws_instance" "app_server" {
  ami             = var.ami
  instance_type   = var.instance_type
  subnet_id       = var.subnet_id
  key_name        = data.aws_key_pair.this.key_name
  security_groups = var.security_group_ids

  user_data = var.user_data
  tags      = var.default_tags
}

# Lier EIP avec EC2 si la variable est vraie
# resource "aws_eip_association" "this" {
#   count = var.ec2_with_ip ? 1 : 0
#   instance_id   = aws_instance.app_server.id
#   allocation_id = data.aws_eip.this.id
# }
