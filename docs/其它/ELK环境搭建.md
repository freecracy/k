# ELK 环境搭建

## ES 搭建

### 配置

```yaml
## 主节点+数据节点 既有主节点资格,又存储数据,主节点
node.master: true
node.data: true
## 数据节点 不参与选举,只存储数据
node.master: false
node.data: true
## 客户端节点 不会成为主节点，也不会存储数据，主要是针对海量请求的时候，可以进行负载均衡
node.master: false
node.data: false

cluster.name: cluster-name
node.name: es1
node.master: true
node.data: true
path.data: /var/data
path.logs: /var/log
network.host: 0.0.0.0
http.port: 9200
cluster.initial_master_nodes: ["es1"] # 单节点部署
bootstrap.memory_lock: false
bootstrap.system_call_filter: false
http.cors.enabled: true
http.cors.allow-origin: "*"
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
```

### 启动

```shell
bin/elasticsearch -d
```

### 验证

```shell
curl http://127.0.0.1:89200
```

## kibana 搭建

### 配置

可以下载 客户端 mac 或 windos 版直接连接服务器 es,也可以服务器部署.

```yaml
elasticsearch.hosts: ["http://127.0.0.1:9200"]
elasticsearch.username: "kibana_system"
elasticsearch.password: "password"
i18n.locale: "zh-CN"
```

### 启动

```shell
bin/kibana
```

### 验证

浏览器打开 [http://127.0.0.1:5601](http://127.0.0.1:5601) 输入 elastic 密码.

## logstash 同步 mysql 到 ES

### 配置

需要下载 jdbc connecter 相应版本.

```yaml
input {
jdbc {
jdbc_driver_library => "/mysql-connector-java-5.1.49/mysql-connector-java-5.1.49.jar"
jdbc_driver_class => "com.mysql.jdbc.Driver"
jdbc_connection_string => "jdbc:mysql://127.0.0.1:3306/db"
jdbc_user => "username"
jdbc_password => "password"
schedule => "* * * * *"
statement => "select * from test WHERE updated_at >= :sql_last_value"
use_column_value => true
tracking_column_type => "timestamp"
tracking_column => "updated_at"
last_run_metadata_path => "syncpoint_table"
}
}


output {
elasticsearch {
hosts => ["127.0.0.1:9200"]
user => elastic
password => password
index => "index"
document_id => "%{id}"
document_type => "type"
}
stdout {
codec => json_lines
}
}
```

> where hq_music.updated_at >= :sql_last_value

### 启动

```shell
bin/logstash
```

### 验证

kibana dev tool 中执行查询语句

## canal 同步 mysql 到 ES

需要开启 binlog,并且 binlog 必须是 raw 模式.

## filebeat 日志收集

### 配置

```yaml
filebeat.inputs:
  - type: log
    paths:
      - /var/*.log # 文件名没有后缀,可以用/*
    json.keys_under_root: true
    json.overwrite_keys: true
    json.add_error_key: true
    json.expand_keys: true

output.elasticsearch:
  hosts: ["http://127.0.0.1:9200"]
  username: "elastic"
  password: "password"
```

```yaml
setup.ilm.enabled: false
setup.template.enabled: false
setup.template.name: "app-log-"
setup.template.pattern: "app-log-*"
output.elasticsearch:
  hosts: ["http://127.0.0.1:9200"]
  username: "elastic"
  password: "password"
  index: "app-log-%{[agent.version]}-%{+yyyy.MM.dd}"
  enable: true
```

> - 需要 cat >> 写入日志才能生效
> - setup 要放前面

### 启动

```shell
./filebeat -e -c filebeat.yml
```

### 验证

kibana 中可以配置配置索引源,查看日志数据.如果日志行是普通日志则会解析成 msg 一个字段,如果是 json 字段会全部解析.

## 监控

Grafana : 通过 k8s 部署 es-export 将监控 metrics 导出, prometheus 采集监控数据,grafana 定制 dashboard 展示.

## ES 常见概念

### cluster

集群是由一个或者多个相同 cluster.name 配置的节点组成,共同承担数据和负载压力,当节点数量发生变化时集群会重新分布所有数据.分为单点模式和集群模式.其中单点模式一般不推荐生产环境使用,推荐使用集群模式部署,集群模式又分为 master 节点和 data 节点由同一个节点承担

### node

一个运行中的 ES 实例节点.祝节点负责集群范围内所有变更,如增加删除索引,增加删除节点,且不需要涉及文档级别的变更和搜索等,任何一个节点都能成为主节点.

### index

名词,类似于 mysql 中的数据库,倒排索引 : 类似于 mysql 中的索引,可以提升检索速度.

### type

一个索引可以包含一个或多个 type,相当于 mysql 中的表.

### document

相当于 mysql 中的数据行.

### shards

分片,是一个底层工作单元,仅保存全部数据的一部分,是数据的容器,文档保存在分片内,分片又被分配到集群内各个节点,当集群数据规模扩大或者缩小时,ES 会自动在各个节点中迁移分配,即时数据依然均匀分布在集群里.分为主分片和副分片.在索引建立的时候就确定了分片数,但是副本分片可以随时修改,默认情况下一个主分片拥有一个副本分片,相同的主分片的副本分片不会放在同一个节点.

1. 主分片 : 索引内任意一个文档都属于主分片,所以主分片数目决定着索引能保存的最大数据量
2. 副本分片 : 只是主分片的一个拷贝,做为硬件故障时保护数据不丢失的冗余备份,并为搜索和返回文档等操作提供服务

### 写数据

1. 客户端选择一个节点发送请求,此节点称为协调节点
2. 协调节点对写入文档进行路由,将请求转发到对应节点
3. 对应节点主分片自身处理完毕后,需要将数据同步到副本分片
4. 协调节点确定主分片和副本分片都处理完后,响应结果给客户端

### 写数据原理

待写入的文档并没有立马写入磁盘,首先写入 es 虚拟机堆内存中(memory cache),memory cache 中的数据默认每隔一秒会刷新到操作系统缓存中(os cache),即在操作系统内存中产生一个 segment file,同时会在 os cache 中记录 translog 日志,此时被索引到数据可以被搜索到.默认位于 os cache 中记录到 translog 日志数据会每隔 5s 写入磁盘持久化,最多丢失 5s 的数据,默认每 30 分钟或者 translog 日志文件达到一定大小值会触发 commit 操作(flush 到磁盘),会将 os cache 中 segment file 数据写入磁盘,清空和重开 translog.默认 es 被索引数据需要 1s 才会被搜索到,最多丢失 5s 数据.

### es 段文件合并

es 中每个 shard 每隔 1 秒都会 refresh 一次,每次 refresh 都会生成一个新的 segment,按照这个速度过不了多久 segment 的数量就会爆炸,所以存在太多的 segment 是一个大问题,因为每一个 segment 都会占用文件句柄,内存资源,cpu 资源,更加重要的是每一个搜索请求都必须访问每一个 segment,这就意味着存在的 segment 越多,搜索请求就会变的更慢.

那么 elaticsearch 是如何解决这个问题呢? 实际上 elasticsearch 有一个后台进程专门负责 segment 的合并,它会把小 segments 合并成更大的 segments,然后反复这样.在合并 segments 的时候标记删除的 document 不会被合并到新的更大的 segment 里面,所有的过程都不需要我们干涉,es 会自动在索引和搜索的过程中完成,合并的 segment 可以是磁盘上已经 commit 过的索引,也可以在内存中还未 commit 的 segment.

在索引时 refresh 进程每秒会创建一个新的 segment 并且打开它使得搜索可见
merge 进程会在后台选择一些小体积的 segments,然后将其合并成一个更大的 segment,这个过程不会打断当前的索引和搜索功能.一旦 merge 完成,旧的 segments 就会被删除,新的 segment 会被 flush 到磁盘
然后会生成新的 commit point 文件,包含新的 segment 名称,并排除掉旧的 segment 和那些被合并过的小的 segment
接着新的 segment 会被打开用于搜索,最后旧的 segment 会被删除掉

说明:如果不加控制,合并一个大的 segment 会消耗比较多的 io 和 cpu 资源,同时也会搜索性能造成影响,所以默认情况下 es 已经对合并线程做了资源限额以便于它不会搜索性能造成太大影响.

### 读数据

1. 通过文档 id 查询，会根据文档 id 进行 hash,然后直接路由到指定的分片查询
2. 客户端发送请求到任意节点，此节点称之为协调节点
3. 协调节点对文档 id 进行哈希路由,将请求转发到对应的节点分片,此时会使用 round-robin 随机轮询算法,在主分片以及其所有副本分片中随机选择一个,让读请求负载均衡
4. 接受请求的节点返回文档数据给协调节点
5. 协调节点返回数据给客户端

#### es 搜索数据过程

1. 客户端发送请求到任意节点，此节点称之为协调节点
2. 协调节点将搜索请求分发到所有的分片(主分片或者副本分片都可以)
3. 每个 shard 将自己的搜索结果(其实就是一些文档 id 和评分数据)返回给协调节点,由协调节点进行数据的合并、排序、分页等操作,产出最终结果
4. 接着由协调节点根据文档 id 去各个节点上拉取实际的文档数据,最终返回给客户端

## k8s 部署

```shell
kubectl -s http://ip:port create -f es-master.yaml  # 配置 master 节点
kubectl -s http://ip:port create -f es-data.yaml    # 配置 data 节点
kubectl -s http://ip:port create -f es-service.yaml # 配置成可访问服务
```

## ES 集群

### 节点配置

#### master

```yaml
cluster.name: cluster-name
node.name: node-1
node.attr.rack: r1
network.host: 0.0.0.0
http.port: 9200
discovery.seed_hosts: ["127.0.0.1:9301"]
node.master: true
node.data: false

discovery.zen.minimum_master_nodes: 1

http.cors.enabled: true
http.cors.allow-origin: "*"
transport.tcp.port: 9302

xpack.security.enabled: true
xpack.license.self_generated.type: basic
xpack.security.transport.ssl.enabled: true
xpack.security.transport.ssl.verification_mode: certificate
xpack.security.transport.ssl.keystore.path: certs/elastic-certificates.p12
xpack.security.transport.ssl.truststore.path: certs/elastic-certificates.p12

bootstrap.memory_lock: false
bootstrap.system_call_filter: false
```

#### data

```yaml
cluster.name: cluster-name
node.name: node-2
node.attr.rack: r1
network.host: 0.0.0.0
http.port: 9201
discovery.seed_hosts: ["127.0.0.1:9300"]
cluster.initial_master_nodes: ["node-1"]

node.master: false
node.data: true

discovery.zen.minimum_master_nodes: 1

http.cors.enabled: true
http.cors.allow-origin: "*"
transport.tcp.port: 9301

xpack.security.enabled: true
xpack.license.self_generated.type: basic
xpack.security.transport.ssl.enabled: true
xpack.security.transport.ssl.verification_mode: certificate
xpack.security.transport.ssl.keystore.path: certs/elastic-certificates.p12
xpack.security.transport.ssl.truststore.path: certs/elastic-certificates.p12

bootstrap.memory_lock: false
bootstrap.system_call_filter: false
```

### 设置证书

```shell
bin/elasticsearch-certutil ca # 不要输入密码
bin/elasticsearch-certutil cert  --ca elastic-stack-ca.p12 # 不要输入密码
mv elastic-certificates.p12 config/certs/ # master data 都复制该文件
chmod 777 config/certs
```

### 设置密码

```shell
bin/elasticsearch-setup-passwords auto
```
