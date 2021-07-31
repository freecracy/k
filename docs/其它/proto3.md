# proto3

## 下载安装

```shell
# https://github.com/protocolbuffers/protobuf
protoc --version
go get -u github.com/golang/protobuf/protoc-gen-go
go get -u github.com/golang/protobuf
protoc --go_out=. *.proto
```

## 一个简答的例子

```protobuf
syntax = "proto3";
message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 result_per_page = 3;
}
```

## 版本定义

```protobuf
syntax = "proto3";
```

## 引入其它 proto 文件

```protobuf
import  "other.proto";
```

## package

包名可以避免对 message 类型之间的名字冲突,同名的 Message 可以通过 package 进行区分.

```protobuf
import  "other.proto";
```

## option

option 可以用在 proto 的 scope 中,或者 message、enum、service 的定义中.可以是 Protobuf 定义的 option,或者自定义的 option.

```protobuf
option java_package = "com.example.foo";
```

## 普通字段

repeated 允许字段重复,对于 Go 语言来说,它会编译成数组(slice of type)类型的格式.同一个 message 的每个字段都有唯一一个编号,并且建议终生这个编号都不要改变.

- 数字类型: double、float、int32、int64、uint32、uint64、sint32、sint64 : 存储长度可变的浮点数、整数、无符号整数和有符号整数
- 存储固定大小的数字类型: fixed32、fixed64、sfixed32、sfixed64 : 存储空间固定
- 布尔类型: bool
- 字符串: string
- bytes: 字节数组
- messageType: 消息类型
- enumType:枚举类型

| .proto Type | Go Type | PHP Type          |
| :---------- | :------ | :---------------- |
| double      | float64 | float             |
| float       | float32 | float             |
| int32       | int32   | integer           |
| int64       | int64   | integer/string[6] |
| uint32      | uint32  | integer           |
| uint64      | uint64  | integer/string[6] |
| sint32      | int32   | integer           |
| sint64      | int64   | integer/string[6] |
| fixed32     | uint32  | integer           |
| fixed64     | uint64  | integer/string[6] |
| sfixed32    | int32   | integer           |
| sfixed64    | int64   | integer/string[6] |
| bool        | bool    | boolean           |
| string      | string  | string            |
| bytes       | []byte  | string            |

## Oneof

```protobuf
message OneofMessage {
    oneof test_oneof {
      string name = 4;
      int64 value = 9;
    }
}
```

## map 类型

map 字段不能同时使用 repeated.

```protobuf
map<int64,string> values = 1;
```

## Reserved

Reserved 可以用来指明此 message 不使用某些字段,也就是忽略这些字段.声明保留的字段你就不要再定义了,否则编译的时候会出错.

```protobuf
message AllNormalypes {
  reserved 2, 4 to 6;
  reserved "field14", "field11";
  double field1 = 1;
  // float field2 = 2;
  int32 field3 = 3;
  // int64 field4 = 4;
  // uint32 field5 = 5;
  // uint64 field6 = 6;
  sint32 field7 = 7;
  sint64 field8 = 8;
  fixed32 field9 = 9;
  fixed64 field10 = 10;
  // sfixed32 field11 = 11;
  sfixed64 field12 = 12;
  bool field13 = 13;
  // string field14 = 14;
  bytes field15 = 15;
}
```

## 枚举类型

所以避免在同一个 package 定义重名的枚举字段.

```protobuf
enum EnumAllowingAlias {
  option allow_alias = true;
  UNKNOWN = 0;
  STARTED = 1;
  RUNNING = 1;
}
enum EnumNotAllowingAlias {
  UNKNOWN2 = 0;
  STARTED2 = 1;
  // RUNNING = 1;
}
```

- 如果设置 allow_alias,允许字段编号重复,RUNNING 是 STARTED 的别名.
- 第一个枚举值必须是 0,而且必须定义

## 使用其它类型

```protobuf
message SearchResponse {
  repeated Result results = 1; // 自定义类型
}
message Result {
  string url = 1;
  string title = 2;
  repeated string snippets = 3;
}
```

## 嵌套类型

```protobuf
message SearchResponse {
  message Result {
    string url = 1;
    string title = 2;
    repeated string snippets = 3;
  }
  repeated Result results = 1;
}
```

## Any

any 字段允许你处理嵌套数据,并不需要它的 proto 定义.一个 Any 以 bytes 呈现序列化的消息,并且包含一个 URL 作为这个类型的唯一标识和元数据.

```protobuf
import "google/protobuf/any.proto";
message ErrorStatus {
  string message = 1;
  repeated google.protobuf.Any details = 2;
}
```

## 更新消息类型

- 不要改变已有字段的字段编号
- 当你增加一个新的字段的时候,老系统序列化后的数据依然可以被你的新的格式所解析,只不过你需要处理新加字段的缺省值.老系统也能解析你信息的值,新加字段只不过被丢弃了
- 字段也可以被移除,但是建议你 Reserved 这个字段,避免将来会使用这个字段
- int32,uint32,int64,uint64 和 bool 类型都是兼容的
- sint32 和 sint64 兼容,但是不和其它整数类型兼容
- string 和 bytes 兼容,如果 bytes 是合法的 UTF-8 bytes 的话
- 嵌入类型和 bytes 兼容,如果 bytes 包含一个消息的编码版本的话

## gogo 库

虽然官方库 golang/protobu 提供了对 Protobuf 的支持,但是使用最多还是第三方实现的库 gogo/protobuf.

### gofast

速度优先.

```shell
go get github.com/gogo/protobuf/protoc-gen-gofast
protoc --gofast_out=. myproto.proto
```

### gogofast、gogofaster、gogoslick

gogofast 类似 gofast,但是会导入 gogoprotobuf.
gogofaster 类似 gogofast,不会产生 XXX_unrecognized 指针字段,可以减少垃圾回收时间.
gogoslick 类似 gogofaster,但是可以增加一些额外的方法 gostring 和 equal 等等.

```shell
go get github.com/gogo/protobuf/proto
go get github.com/gogo/protobuf/{binary} //protoc-gen-gogofast、protoc-gen-gogofaster 、protoc-gen-gogoslick
go get github.com/gogo/protobuf/gogoproto
protoc -I=. -I=$GOPATH/src -I=$GOPATH/src/github.com/gogo/protobuf/protobuf --{binary}_out=. myproto.proto
```

### protoc-gen-gogo

```shell
go get github.com/gogo/protobuf/proto
go get github.com/gogo/protobuf/jsonpb
go get github.com/gogo/protobuf/protoc-gen-gogo
go get github.com/gogo/protobuf/gogoproto
```

### grpc

```shell
protoc --gofast_out=plugins=grpc:. my.proto
```
