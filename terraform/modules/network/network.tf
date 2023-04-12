resource "aws_vpc" "this" {
  cidr_block = var.vpc_cidr
  tags       = var.default_tags
}

resource "aws_subnet" "this" {
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.subnet_cidr
  availability_zone = var.azs
  tags              = var.default_tags
}

# Network interface créé par défaut

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags   = var.default_tags
}

resource "aws_route" "vpc_igw" {
  route_table_id         = aws_vpc.this.default_route_table_id
  destination_cidr_block = var.anyone_cidr
  gateway_id             = aws_internet_gateway.this.id
}

resource "aws_default_security_group" "this" {
  vpc_id = aws_vpc.this.id
  ingress {
    description = "SSH from VPC"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.anyone_cidr]
  }
  ingress {
    description = "HTTP connection"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.anyone_cidr]
  }

  # à verifier si ça marche sans cette regle
  ingress {
    description = "secret-santa backend"
    from_port   = 8081
    to_port     = 8081
    protocol    = "tcp"
    cidr_blocks = [var.anyone_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.anyone_cidr]
  }
}
