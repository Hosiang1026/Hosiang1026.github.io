---
title: 推荐系列-Kubernetes身份认证和授权操作全攻略-上手操作Kubernetes身份认证
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 719
cover_picture: 'https://static.oschina.net/uploads/img/201909/11111054_I39w.jpg'
abbrlink: e979c12
date: 2021-04-14 07:54:42
---

&emsp;&emsp;这是本系列文章的第二篇，在上篇文章中我们介绍了Kubernetes访问控制。在本文中，我们将通过上手实践的方式来进一步理解身份认证的概念。 在生产环境中，Kubernetes管理员使用命名空间来隔离...
<!-- more -->

                                                                                                                                                                                        这是本系列文章的第二篇，在上篇文章中我们介绍了Kubernetes访问控制。在本文中，我们将通过上手实践的方式来进一步理解身份认证的概念。 
在生产环境中，Kubernetes管理员使用命名空间来隔离资源和部署。命名空间作为一个逻辑边界来强制基本访问控制。 
假设现在我们有个新的管理员叫Bob，要加入开发团队为研发组管理Kubernetes部署。我们现在需要给他提供足够的访问权限以便于他管理工程命名空间。假设你是集群管理员并且拥有管理全局资源和对象的权限，你需要登上Bob的账户并帮助他获取访问Kubernetes集群所需的凭据。 
我在操作中使用的是Minikube，但本文示例的场景适用于任何使用其他方式配置的Kubernetes集群（只要你是集群管理员身份就行）。 
首先，创建一个名为cred的目录，并运行以下命令为Bob生成一个私钥。 
 ```java 
  mkdir cred
cd cred

  ```  
 ```java 
  
openssl genrsa -out bob.key 2048
Generating RSA private key, 2048 bit long modulus
..................................................................................................................+++
................................................+++
e is 65537 (0x10001)

  ```  
我们还需要一个可以从私钥生成的证书签名请求。 
 ```java 
  openssl req -new -key bob.key -out bob.csr -subj "/CN=bob/O=eng"\n

  ```  
将密钥移动到父级文件夹并在Base64中对其进行编码。 
 ```java 
  cp bob.key ..
cd ..
cat cred/bob.csr | base64 | tr -d '\n'
LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ1lqQ0NBVW9DQVFBd0hURU1NQW9HQTFVRUF3d0RZbTlpTVEwd0N3WURWUVFLREFSbGJtZHVNSUlCSWpBTgpCZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUEzSU9oUTArMFJUakpqZjBKTkd2Rmo0YWFlN1hYCkkrZWkzTzZWTEpqMHNKNDBvengyUTVndXBmeFc5b0lEYTJETnhVZjZkNHVMOUJ3V2lhdFdQdnBDNm80MHJQc2EKTjBUdEhEekFYeWppc0E5VXVRMVNKMWg5Mkg0TU9XWEpWNWJWaTlXYjBKU3hLbXVrSUVtaERJcW9TcEh6MU5xaApQMWNXOFFpNXpoVVBmWlpnOUhSaWVUQ2xEMmR3bWRtS1JjbU9uenNGVWhJWmZWanVZNzZJUm9KbksyaHNzVjZoCmMyY1JNTVNEdFA0ZDArYkxOY1BKdExpS3JjQkdwUGxLUEdrSHovM2NNbVhpVi8wY2xqUlppMzJCb3B4NlI1NUIKc0Z6cXZwcWgzNWxLNUVOUGxPZy9sdURFdllGeUtzOUY2aERBRFhDNzQxU0ZCQTI0TERzcTFiWWtVUUlEQVFBQgpvQUF3RFFZSktvWklodmNOQVFFTEJRQURnZ0VCQUxTejgxL2N3bjQxbVRrUDhabWhhUUx3MkpIRkN4ZUlaOFdpCkZOV0U1cnRVd3hrSjJGWVJKRlFUL1hJN0FoL0pXTkhqeHlhOUNyN3c0OThmanN3bDF2ZzQ1QUgrR29DeVEwTWkKOU1MMHl0WmZyaG5jYmtpRG9oSUpuaWhJTjlCUGpHVkw2SG1USytGc0sybG1ZZ1JDdk9Cclg3Rkh6ZjgwM0ZFNAp4ZkgrZlFsdGxDdEZTSEhuaUlzZTFEQ2J4cFVTdnRISXpYMFcyb2hXV3RPVkRpOTAzOW8zY2VaWmdVK3VRYno0Cmp2djJoeVdRNDhORFl3RWF1UUU2S3NBQTFLT0IyUkI2dE45bjFTVWoxU1B2WnBsQkVieDZ5MTkzaUJSVFJRM2wKM2JhdFRNUUEzelBsdk01ZEE2Vy8rQWcwVm0xMk1SR091VFRLSEU2bE5INE1DbHQvRGZZPQotLS0tLUVORCBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0K

  ```  
我们需要将生成的base64编码的字符串嵌入到YAML文件中，并将其作为证书签名请求提交给Kubernetes。这一步骤基本上可以将Bob的私钥与Kubernetes集群相关联。 
 ```java 
  
apiVersion: certificates.k8s.io/v1beta1
kind: CertificateSigningRequest
metadata:
  name: bob-csr
spec:
  groups:
  - system:authenticated
 
  request: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ1lqQ0NBVW9DQVFBd0hURU1NQW9HQTFVRUF3d0RZbTlpTVEwd0N3WURWUVFLREFSbGJtZHVNSUlCSWpBTgpCZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUEzSU9oUTArMFJUakpqZjBKTkd2Rmo0YWFlN1hYCkkrZWkzTzZWTEpqMHNKNDBvengyUTVndXBmeFc5b0lEYTJETnhVZjZkNHVMOUJ3V2lhdFdQdnBDNm80MHJQc2EKTjBUdEhEekFYeWppc0E5VXVRMVNKMWg5Mkg0TU9XWEpWNWJWaTlXYjBKU3hLbXVrSUVtaERJcW9TcEh6MU5xaApQMWNXOFFpNXpoVVBmWlpnOUhSaWVUQ2xEMmR3bWRtS1JjbU9uenNGVWhJWmZWanVZNzZJUm9KbksyaHNzVjZoCmMyY1JNTVNEdFA0ZDArYkxOY1BKdExpS3JjQkdwUGxLUEdrSHovM2NNbVhpVi8wY2xqUlppMzJCb3B4NlI1NUIKc0Z6cXZwcWgzNWxLNUVOUGxPZy9sdURFdllGeUtzOUY2aERBRFhDNzQxU0ZCQTI0TERzcTFiWWtVUUlEQVFBQgpvQUF3RFFZSktvWklodmNOQVFFTEJRQURnZ0VCQUxTejgxL2N3bjQxbVRrUDhabWhhUUx3MkpIRkN4ZUlaOFdpCkZOV0U1cnRVd3hrSjJGWVJKRlFUL1hJN0FoL0pXTkhqeHlhOUNyN3c0OThmanN3bDF2ZzQ1QUgrR29DeVEwTWkKOU1MMHl0WmZyaG5jYmtpRG9oSUpuaWhJTjlCUGpHVkw2SG1USytGc0sybG1ZZ1JDdk9Cclg3Rkh6ZjgwM0ZFNAp4ZkgrZlFsdGxDdEZTSEhuaUlzZTFEQ2J4cFVTdnRISXpYMFcyb2hXV3RPVkRpOTAzOW8zY2VaWmdVK3VRYno0Cmp2djJoeVdRNDhORFl3RWF1UUU2S3NBQTFLT0IyUkI2dE45bjFTVWoxU1B2WnBsQkVieDZ5MTkzaUJSVFJRM2wKM2JhdFRNUUEzelBsdk01ZEE2Vy8rQWcwVm0xMk1SR091VFRLSEU2bE5INE1DbHQvRGZZPQotLS0tLUVORCBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0K
  
  usages:
  - digital signature
  - key encipherment
  - server auth

  ```  
 ```java 
  
kubectl create -f signing-request.yaml
certificatesigningrequest.certificates.k8s.io/bob-csr created

  ```  
使用以下kubectl命令验证CSR： 
 ```java 
  kubectl get csr
NAME      AGE   REQUESTOR       CONDITION
bob-csr   41s   minikube-user   Pending

  ```  
请注意，请求此时依旧处于pending状态。集群管理员需要批准它，才会变成active状态。 
 ```java 
  kubectl certificate approve bob-csr
certificatesigningrequest.certificates.k8s.io/bob-csr approved

  ```  
 ```java 
  kubectl get csr
NAME      AGE    REQUESTOR       CONDITION
bob-csr   104s   minikube-user   Approved,Issued

  ```  
既然证书已经批准并发布，我们需要从集群中获取签名证书。这是登录Bob账户最关键的一步。 
 ```java 
  kubectl get csr bob-csr -o jsonpath='{.status.certificate}' | base64 --decode > bob.crt

  ```  
bob.crt这一文件是用于Bob身份认证的客户端证书。我们现在拥有Kubernetes的私钥（bob.key）和批准的证书（bob.crt）。只要Bob拥有这两个凭据，他就可以通过集群进行身份认证。 
那么，现在就可以将Bob作为用户添加到Kubernetes中。 
 ```java 
  kubectl config set-credentials bob --client-certificate=bob.crt --client-key=bob.key
User "bob" set.

  ```  
打开~/.kube/config 文件确认凭据已经设置完成。 
 
让我们创建一个名为engineering的新命名空间，Bob是其管理员。 
 ```java 
  kubectl create namespace engineering
namespace/engineering created

  ```  
 ```java 
  kubectl get namespace
NAME              STATUS   AGE
default           Active   37m
engineering       Active   0s
kube-node-lease   Active   37m
kube-public       Active   37m
kube-system       Active   37m

  ```  
kubectl CLI以auth的形式提供了非常有用的开关，可以验证特定用户的权限。让我们检查一下当前的管理员用户是否可以访问engineering命名空间。鉴于您集群管理员的身份，因此可以轻易看到输出结果。 
 ```java 
   kubectl auth can-i list pods --namespace engineering
yes

  ```  
我们也能够检查Bob能否访问engineering命名空间。 
 ```java 
  kubectl auth can-i list pods --namespace engineering --as bob
no

  ```  
很显然，Bob无法访问命名空间，这是因为我们创建了凭据但是没有明确授权Bob对任何对象进行任何特定的动作。 
在下一篇文章中，我将引导您完成授权Bob的所有步骤。同时，还会介绍角色以及角色绑定。保持关注哟~
                                        