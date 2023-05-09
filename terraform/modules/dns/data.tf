data "aws_route53_zone" "ninja" {
  name         = "aws.ocho.ninja"
  private_zone = false
}
