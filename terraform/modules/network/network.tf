resource "aws_vpc" "this" {
  cidr_block = var.vpc_cidr
  tags       = var.default_tags
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = var.azs
  map_public_ip_on_launch = "true"

  tags = var.default_tags
}

resource "aws_subnet" "private" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.private_subnet_cidr
  availability_zone       = var.azs
  map_public_ip_on_launch = "false"

  tags = var.default_tags
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags   = var.default_tags
}


resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id
  route {
    cidr_block = var.anyone_cidr
    gateway_id = aws_internet_gateway.this.id
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# NAT
# resource "aws_nat_gateway" "this" {
#   allocation_id = data.aws_eip.this.id
#   subnet_id     = aws_subnet.public.id
#   depends_on    = [aws_internet_gateway.this]
# }

# resource "aws_route_table" "private" {
#   vpc_id = aws_vpc.this.id
#   route {
#     cidr_block     = var.anyone_cidr
#     nat_gateway_id = aws_nat_gateway.this.id
#   }
# }

# resource "aws_route_table_association" "private" {
#   subnet_id      = aws_subnet.private.id
#   route_table_id = aws_route_table.private.id
# }

resource "aws_default_security_group" "this" {
  vpc_id = aws_vpc.this.id
  # ingress {
  #   description = "SSH from VPC"
  #   from_port   = 22
  #   to_port     = 22
  #   protocol    = "tcp"
  #   cidr_blocks = [var.anyone_cidr]
  # }
  # ingress {
  #   description = "HTTP connection"
  #   from_port   = 80
  #   to_port     = 80
  #   protocol    = "tcp"
  #   cidr_blocks = [var.anyone_cidr]
  # }
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.anyone_cidr]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.anyone_cidr]
  }
}
