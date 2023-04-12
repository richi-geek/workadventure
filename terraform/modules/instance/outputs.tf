output "public_ip" {
  description = "Public IP address"
  value       = aws_eip.public.public_ip
}