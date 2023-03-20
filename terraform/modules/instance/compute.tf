resource "aws_instance" "app_server" {
  ami             = data.aws_ami.amzLinux.id
  instance_type   = var.instance_type
  subnet_id       = aws_subnet.this.id
  key_name        = aws_key_pair.ssh_key.key_name
  security_groups = [aws_default_security_group.this.id]

  tags = var.default_tags
}

resource "aws_key_pair" "ssh_key" {
  key_name   = "rici-tf-ssh"
  public_key = var.public_key
}
