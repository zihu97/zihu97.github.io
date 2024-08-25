---
date: 2024-08-25
article: true
category:
  - tech
tag:
  - container
---

# 使用[minikube](https://minikube.sigs.k8s.io/docs/)搭建K8S环境

## 1 [minikube start](https://minikube.sigs.k8s.io/docs/start/?arch=%2Fwindows%2Fx86-64%2Fstable%2F.exe+download)

### 1.1 Prerequisites

Container or virtual machine manager, such as: [Docker](./build%20with%20harbor.md), QEMU, Hyperkit, Hyper-V, KVM, Parallels, Podman, VirtualBox, or VMware Fusion/Workstation

### 1.2 Installation

```shell
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube && rm minikube-linux-amd64
```

### 1.3 Version

```shell
root@ubuntu5:/home/ubuntu# minikube version
minikube version: v1.33.1
commit: 5883c09216182566a63dff4c326a6fc9ed2982ff
```

### 1.4 Start cluster

```shell
minikube start --vm-driver=docker --base-image="anjone/kicbase" --image-mirror-country='cn' --image-repository='registry.cn-hangzhou.aliyuncs.com/google_containers'
```

## 2 [Install and Set Up kubectl on Linux](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)

### 2.1 Install using other package management

```shell
ubuntu@ubuntu5:~$ sudo snap install kubectl --classic
kubectl 1.30.4 from Canonical✓ installed
ubuntu@ubuntu5:~$ kubectl version --client
Client Version: v1.30.4
Kustomize Version: v5.0.4-0.20230601165947-6ce0bf390ce3
```

# 4 过程踩到的坑

## 4.1 root用户拉起cluster失败

```shell
root@ubuntu5:/home/ubuntu# minikube start
😄  minikube v1.33.1 on Ubuntu 24.04 (vbox/amd64)
✨  Automatically selected the docker driver. Other choices: none, ssh
🛑  The "docker" driver should not be used with root privileges. If you wish to continue as root, use --force.
💡  If you are running minikube within a VM, consider using --driver=none:
📘    https://minikube.sigs.k8s.io/docs/reference/drivers/none/

❌  Exiting due to DRV_AS_ROOT: The "docker" driver should not be used with root privileges.
```
不能在root用户下执行

## 4.2 普通用户找不到docker

```shell
ubuntu@ubuntu5:~$ minikube start
😄  minikube v1.33.1 on Ubuntu 24.04 (vbox/amd64)
👎  Unable to pick a default driver. Here is what was considered, in preference order:
    ▪ docker: Not healthy: "docker version --format {{.Server.Os}}-{{.Server.Version}}:{{.Server.Platform.Name}}" exit status 1: permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get "http://%2Fvar%2Frun%2Fdocker.sock/v1.46/version": dial unix /var/run/docker.sock: connect: permission denied
    ▪ docker: Suggestion: Add your user to the 'docker' group: 'sudo usermod -aG docker $USER && newgrp docker' <https://docs.docker.com/engine/install/linux-postinstall/>
💡  Alternatively you could install one of these drivers:
    ▪ kvm2: Not installed: exec: "virsh": executable file not found in $PATH
    ▪ podman: Not installed: exec: "podman": executable file not found in $PATH
    ▪ qemu2: Not installed: stat /usr/share/OVMF/OVMF_CODE.fd: no such file or directory
    ▪ virtualbox: Not installed: unable to find VBoxManage in $PATH

❌  Exiting due to DRV_NOT_HEALTHY: Found driver(s) but none were healthy. See above for suggestions how to fix installed drivers.
```
需要将当前用户加入docker属组
```shell
sudo usermod -aG docker ubuntu && newgrp docker
```

## 4.3 minikube找不到docker machine

```shell
ubuntu@ubuntu5:~$ minikube start
😄  minikube v1.33.1 on Ubuntu 24.04 (vbox/amd64)
E0825 17:30:06.513595    8301 start.go:812] api.Load failed for minikube: filestore "minikube": Docker machine "minikube" does not exist. Use "docker-machine ls" to list machines. Use "docker-machine create" to add a new one.
✨  Using the docker driver based on existing profile
👍  Starting "minikube" primary control-plane node in "minikube" cluster
🚜  Pulling base image v0.0.44 ...
    > index.docker.io/kicbase/sta...:  0 B [_______________________] ?% ? p/s ?^C
```
因为之前执行了--image-mirror-country=cn中断了导致配置有问题，因此删除重配
```shell
minikube stop
minikube delete
minikube start
```