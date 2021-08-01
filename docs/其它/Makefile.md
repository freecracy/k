# Makefile

## 命令

每行命令在一个单独的 shell 中执行,这些 Shell 之间没有继承关系.一个解决办法是将两行命令写在一行,中间用分号分隔.

```makefile
var-kept:
    export foo=bar; echo "foo=[$$foo]"
```

另一个解决办法是在换行符前加反斜杠转义.

```makefile
export foo=bar; \
    echo "foo=[$$foo]"
```

最后一个方法是加上`.ONESHELL:`命令.

```makefile
.ONESHELL:
var-kept:
    export foo=bar;
    echo "foo=[$$foo]"
```

## .RECIPEPREFIX

每行命令之前必须有一个 tab 键,如果想用其他键,可以用内置变量.RECIPEPREFIX 声明.

```makefile
.RECIPEPREFIX = >
all:
> echo Hello, world
```

## 语法

### 注释

```makefile
# 这是注释
result.txt: source.txt
    # 这是注释
    cp source.txt result.txt # 这也是注释
```

### 回声

正常情况下,make 会打印每条命令,然后再执行,这就叫做回声.在命令的前面加上`@`,就可以关闭回声.

```makefile
test:
    @# 这是测试
```

## 模式匹配

使用匹配符`%`,可以将大量同类型的文件,只用一条规则就完成构建.

```makefile
%.o: %.c # a.o : a.c
```

## 变量

调用时,变量需要放在 `$()` 之中.调用 Shell 变量,需要在美元符号前,再加一个美元符号,这是因为 Make 命令会对美元符号转义.

```makefile
txt = Hello World
test:
    @echo $(txt)
    @echo $$HOME
```

### 运算符

```makefile
VARIABLE = value   # 在执行时扩展,允许递归扩展
VARIABLE := value  # 在定义时扩展
VARIABLE ?= value  # 只有在该变量为空时才设置值
VARIABLE += value  # 将值追加到变量的尾端
```

### 内置变量

### 自动变量

- `$@` : 指代当前目标,就是 Make 命令当前构建的那个目标
- `$<` 指代第一个前置条件

## 判断和循环

```makefile
ifeq ($(CC),gcc)
  libs=$(libs_for_gcc)
else
  libs=$(normal_libs)
endif
```

## 函数

```makefile
$(function arguments)# 或者 ${function arguments}
```

### shell 函数

shell 函数用来执行 shell 命令

```makefile
srcfiles := $(shell echo src/{00..99}.txt)
```

### wildcard 函数

wildcard 函数用来在 Makefile 中,替换 Bash 的通配符.

### subst 函数

用来文本替换.

```makefile
$(subst ee,EE,feet on the street) # $(subst from,to,text)
```

### patsubst 函数

模式匹配的替换.

```makefile
$(patsubst %.c,%.o,x.c.c bar.c) # $(patsubst pattern,replacement,text)
```

### 替换后缀名

```makefile
min: $(OUTPUT:.js=.min.js)
```
