resource "aws_vpc" "my_vpc" {
  cidr_block = "172.16.0.0/16"

  tags = {
    Name = "rici-tf-vpc"
  }
}

resource "aws_subnet" "my_subnet" {
  vpc_id            = aws_vpc.my_vpc.id
  cidr_block        = "172.16.10.0/24"
  availability_zone = "eu-west-3a"

  tags = {
    Name = "rici-tf-subnet"
  }
}

# Network interface créé par défaut

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.my_vpc.id

  tags = {
    Name = "rici-tf-igw"
  }
}

# resource "aws_route_table" "route_table" {
#   vpc_id = aws_vpc.my_vpc.id
#   route {
#     cidr_block = "0.0.0.0/0"
#     gateway_id = aws_internet_gateway.igw.id
#   }

#   tags = {
#     Name = "rici-tf-route-table"
#   }
# }

resource "aws_route" "default-vpc-route-table" {
  route_table_id         = aws_vpc.my_vpc.default_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.igw.id

}

# resource "aws_route_table_association" "route_table_association" {
#   subnet_id      = aws_subnet.my_subnet.id
#   route_table_id = aws_route_table.route_table.id
# }

resource "aws_instance" "app_server" {
  ami             = "ami-05b457b541faec0ca" # Ubuntu Server 22.04 LTS // eu-west-3"
  instance_type   = "t2.micro"
  subnet_id       = aws_subnet.my_subnet.id
  key_name        = aws_key_pair.ssh_key.key_name
  security_groups = [aws_default_security_group.default_sg.id]

  tags = {
    Name = "rici-tf-ec2"
  }
}

resource "aws_eip" "public_ip" {
  instance = aws_instance.app_server.id
  vpc      = true
}

resource "aws_key_pair" "ssh_key" {
  key_name   = "rici-tf-ssh"
  public_key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKH0xK5oup7Sr0pLwYU4FOhV3pGT3r2TY6lkWHdwSBru terraform"
}

resource "aws_default_security_group" "default_sg" {
  vpc_id = aws_vpc.my_vpc.id
  ingress {
    description = "SSH from VPC"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]

  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]

  }

}

# resource "aws_security_group" "allow_ssh" {
#   #name        = data.aws_security_group.default.name
#   description = "Allow SSH inbound traffic"
#   vpc_id      = data.aws_security_group.default.vpc_id

#   ingress {
#     description = "SSH from VPC"
#     from_port   = 22
#     to_port     = 22
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]

#   }

#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]

#   }

