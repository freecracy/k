# 深入掌握 pod

## pod 和容器的使用

### pod 定义

```yaml
aiversion: v1
kind : Pod
metadata:
  name: string
  namespace: string
  labels:
    -name: string
  annotations:
    -name: string
spec:
  containers:
    - name: string
      images: string
      imagesPullPolicy: [Always | Nerver | IfNotPresent]
      command: [string]
      args: [string]
      workingDir: string
      volumeMounts:
        - name: string
          mountPath: string
          readOnly: boolean
          ports:
            - name: string
              containerPort: int
              hostPort: int
              protocol: string
          env:
            - name: string
              value: string
          resources:
            limits:
              cpu: string
              memory: string
            request:
              cpu: string
              memory: string
            livenessProbe:
              exec:
                command: [string]

```

属于同一个 pod 的多个容器应用之间相互访问仅需要通过 localhost 就可以通信,使得这一组容器被绑定在一个环境中.

### 静态 pod

静态 pod 由 kubelet 进行管理的仅存在特定 node 上的 pod,他们不能通过 api server 管理,无法与 ReplicationController、deployment、或者 DaemonSet 进行关联,并且 kubelet 无法对他们健康检查.总是由 kubelet 创建,总在 kubelet 所在 node 上运行.

#### 配置文件方式创建

设置 kubelet 启动参数 --config,指定 kubelet 需要监控的配置文件所在目录, kubelet 会定期扫描该目录,并根据目录下 yaml 和 json 文件创建.

由于静态 pod 无法通过 api server 直接管理,所以在 master 上尝试删除这个 pod 时,会变成 pending 状态,且不会被删除.删除该 pod 只能在其所在的 node 上将配置文件从目录中删除.

#### HTTP 方式创建

通过设置 kubelet 启动参数 --manifest-url,kubelet 会定期从该 url 地址下载 pod 定义的文件,并以 yaml 或 json 格式进行解析,然后创建 pod,实现方式与配置文件是一致的.

### 日志容器

日志容器启动命令 tail -f /log/access.log

```shell
kubectl logs label -c busybox
```

## 应用配置管理

### configmap

1. 生成容器内环境变量
2. 设置容器启动命令的启动参数(需设置为环境变量)
3. 以 volume 的形式挂载为容器内部文件或目录

congfigmap 以一个或多个 key:value 的形式保存在 k8s 系统中供应用使用,即可以是变量值也可以是内容(server.xml=?xml)

#### 通过 yaml 配置文件方式创建

执行 kubectl create 命令创建

```shell
kubectl create -f xxx.yaml
kubectl get configmap # 查看创建的 configmap
kubectl describe configmap xxxname
kubectl get configmap xxxname -o yaml # 查看配置文件
```

#### 命令行方式创建

```shell
kubectl create configmap name --from-file=key=file
kubectl create configmap name --from-file=dir # 文件名被设置为 key 内容设置为 value
kubectl create configmap name --from-literal=key1=value1 --from-literal=key2=value2
```

### 在容器内使用配置

容器内以环境变量形式使用

```shell
kubectl get pods --show-all # 可以查看已经停止的容器
kubectl logs podname # 可以看到容器内环境变量设置
```

### envfrom

```yaml
envFrom:
  - configMapRef:
    name: xxx # 将 configmap 中的 key=value 自动生成环境变量
```

### 通过 volumeMount 使用configmap

## pod 控制和调度管理

## pod 升级和管理

## pod 扩缩容机制
