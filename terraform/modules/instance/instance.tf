resource "aws_instance" "app_server" {
  ami             = var.ami
  instance_type   = var.instance_type
  subnet_id       = var.subnet_id
  key_name        = aws_key_pair.ssh_key.key_name
  security_groups = var.security_group_ids

  user_data = var.user_data
  tags      = var.default_tags
}

# Creer une seule clé à la main et la recuperer avec un data source
resource "aws_key_pair" "ssh_key" {
  key_name   = var.keyname
  public_key = var.public_key
}

resource "aws_eip" "public" {
  instance = aws_instance.app_server.id
  vpc      = true
}
