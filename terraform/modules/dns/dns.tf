resource "aws_route53_record" "workadventure" {
  count = "${length(var.workadventure_records)}"
  zone_id = data.aws_route53_zone.ninja.zone_id
  name    = "${keys(var.workadventure_records)[count.index]}.${data.aws_route53_zone.ninja.name}"
  type    = "A"
  ttl     = "300"
  records = ["${values(var.workadventure_records)[count.index]}"]
}