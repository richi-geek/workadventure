output "public_ip" {
  description = "Public IP address"
  value       = aws_instance.app_server.public_ip
}