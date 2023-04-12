output "subnet_id" {
  value = aws_subnet.this.id
}

output "security_group_id" {
  value = aws_default_security_group.this.id
}