#!/bin/bash
sudo apt-get remove docker docker-engine docker.io containerd runc
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo chmod a+r /etc/apt/keyrings/docker.gpg
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install \
  ca-certificates \
  curl \
  gnupg
sudo apt-get install git -y
sudo apt-get install make -y
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
git clone https://gitlab.com/octo-artic/secret-santa-back.git
sudo make docker-build -C secret-santa-back/
sudo docker run -d --rm -p 8081:8081 secret-santa-backend