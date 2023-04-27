data "aws_key_pair" "this" {
  include_public_key = true
  filter {
    name   = "tag:Owner"
    values = ["RICI"]
  }
}
