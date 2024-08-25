---
date: 2024-08-16
article: true
category:
  - tech
tag:
  - harbor
---

# build with harbor

# 1 Private Docker Registry Selection

[https://supereagle.github.io/2019/11/23/harbor-vs-quay/](https://supereagle.github.io/2019/11/23/harbor-vs-quay/)

# 2 [Harbor Installation and Configuration](https://goharbor.io/docs/2.11.0/install-config/)

本章全程参考官网给出的手册

## 2.1 [Prerequisites](https://goharbor.io/docs/2.11.0/install-config/installation-prereqs/)

|  **Software**  |  **Version**  |  **Description**  |
| --- | --- | --- |
|  Docker Engine  |  Version 20.10.10-ce+ or higher  |  For installation instructions, see [Docker Engine documentation](https://docs.docker.com/engine/installation/)  |
|  Docker Compose  |  docker-compose (v1.18.0+) or docker compose v2 (docker-compose-plugin)  |  For installation instructions, see [Docker Compose documentation](https://docs.docker.com/compose/install/)  |
|  OpenSSL  |  Latest is preferred  |  Used to generate certificate and keys for Harbor  |

docker engine和docker compose可以通过docker desktop安装，以下适用于ubuntu 22.04

### 2.1.1 [**install docker desktop on ubuntu**](https://docs.docker.com/desktop/install/ubuntu/)

#### 2.1.1.1 [**install using the apt repository**](https://docs.docker.com/engine/install/ubuntu/)

官网提供的源对国内用户不友好，以下使用[阿里的docker镜像仓库证书](https://zhuanlan.zhihu.com/p/588264423)

##### 2.1.1.1.1 安装设置仓库必须的工具

```shell
sudo apt update && sudo apt install -y ca-certificates curl gnupg lsb-release
```

##### 2.1.1.1.2 添加阿里的 Docker 镜像仓库证书

```shell
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/aliyun-docker.gpg
```

##### 2.1.1.1.3 添加仓库

```shell
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/aliyun-docker.gpg] https://mirrors.aliyun.com/docker-ce/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

#### 2.1.1.2 Download latest [DEB package](https://desktop.docker.com/linux/main/amd64/docker-desktop-amd64.deb?utm_source=docker&utm_medium=webreferral&utm_campaign=docs-driven-download-linux-amd64&_gl=1*1bzne95*_ga*Mzk5NTI4MjQ1LjE3MjE3MDU4MTE.*_ga_XJWPQMJYHQ*MTcyMzYxNjg4Ni4zLjEuMTcyMzYxNzk4MC42MC4wLjA.)

#### 2.1.1.3 Install the package with apt as follows

```shell
sudo apt-get update
sudo apt-get install ./docker-desktop-<arch>.deb
```

### 2.1.2 launch docker desktop

```shell
systemctl --user start docker-desktop

systemctl --user enable docker-desktop
```

### 2.1.3 check the versions

```shell
docker compose version

docker --version

docker version
Client: Docker Engine - Community
 Version:           27.1.2
 API version:       1.46
 Go version:        go1.21.13
 Git commit:        d01f264
 Built:             Mon Aug 12 11:50:12 2024
 OS/Arch:           linux/amd64
 Context:           default

Server: Docker Engine - Community
 Engine:
  Version:          27.1.2
  API version:      1.46 (minimum version 1.24)
  Go version:       go1.21.13
  Git commit:       f9522e5
  Built:            Mon Aug 12 11:50:12 2024
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          1.7.20
  GitCommit:        8fc6bcff51318944179630522a095cc9dbf9f353
 runc:
  Version:          1.1.13
  GitCommit:        v1.1.13-0-g58aa920
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0
```

## 2.2 [Download the Harbor Installer](https://goharbor.io/docs/2.11.0/install-config/download-installer/)

```shell
https://github.com/goharbor/harbor/releases

tar xzvf harbor-offline-installer-version.tgz
```

## 2.3 [Configure the Harbor YML File](https://goharbor.io/docs/2.11.0/install-config/configure-yml-file/)

```shell
cd harbor
cp harbor.yml.tmpl harbor.yml
# 修改hostname为本机ip，如192.168.2.248
# 修改http port为想要开放的端口，如30080
# 注释https相关字段，暂时不考虑安全认证
# 可以留意到harbor_admin_password默认为Harbor12345
vi harbor.yml
```

## 2.4 [Run the Installer Script](https://goharbor.io/docs/2.11.0/install-config/run-installer-script/)

```shell
./install.sh
```

### 2.4.1 Connecting to Harbor via HTTP

#### 2.4.1.1 Restart Docker Engine

```shell
systemctl daemon-reload
systemctl restart docker
```

#### 2.4.1.2 Stop Harbor

```shell
docker compose down -v
```

#### 2.4.1.1 Restart Harbor

```shell
docker compose up -d
```

# 3 Startup service

## 3.1 configure service

vi /etc/systemd/system/harbor.service

```shell
[Unit]
Description=Start Harbor after Docker
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=/home/cltech/zihu/harbor/install.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

## 3.2 start service

```shell
sudo systemctl daemon-reload
sudo systemctl enable harbor.service
sudo systemctl start harbor.service
```

## 3.3 query service

```shell
sudo systemctl status harbor.service
```

# 4 private docker registry

# 4.1 registry URL

```shell
http://192.168.2.248:30080
admin
Harbor12345
```

# 4.2 configure docker

```shell
sudo tee /etc/docker/daemon.json <<-'EOF'
{
    "registry-mirrors": [
        "https://docker.m.daocloud.io"
        "https://docker.mirrors.ustc.edu.cn",
        "https://hub-mirror.c.163.com",
        "https://mirror.baidubce.com",
        "https://ccr.ccs.tencentyun.com"
    ],
    "insecure-registries": ["192.168.2.248:30080"]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

# 4.3 push images

```shell
docker images
docker tag d2c94e258dcb 192.168.2.248:30080/driver/hello-world:1.0
docker login -u admin -p Harbor12345 192.168.2.248:30080
docker push 192.168.2.248:30080/driver/hello-world:1.0
```

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/8K4nyRpYGvLeqLbj/img/a28f0074-9734-4fdf-a85e-096d771bae73.png)

# 4.4 pull images

```shell
docker pull 192.168.2.248:30080/driver/hello-world:1.0
```

# 5 过程踩到的坑

## 5.1 docker daemon没有拉起来？

Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?

```shell
systemctl status docker.service
journalctl -xeu docker.service
```

**出问题了请先查docker logs**

这次遇到的问题是和iptables相关，解决办法是

```shell
update-alternatives --set iptables /usr/sbin/iptables-legacy
```