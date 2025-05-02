# scrawllife sml

> server message lock，用来保存终端上会使用到的服务器账号密码（给不想保存秘钥的朋友）

## 系统兼容性

本工具支持以下操作系统：

- Windows 10/11（需要安装 OpenSSH 或 Git Bash）
- Linux（各主流发行版）
- macOS

## 安装使用

```
// 安装
npm i -g @scrawllife/sml

// 使用
sml set --server  // sml set -S 设置需要保存的服务器信息

sml list // 查看并进入需要保存的服务器
```

## 本地使用方法

```bash
git clone https://github.com/zuigzm/scrawllife-sml

cd scrawllife-sml

npm link

// 查看 sml
sml --help

// 使用
sml set --server  // sml set -S 设置需要保存的服务器信息

sml list // 查看并进入需要保存的服务器
```

## Windows 用户注意事项

1. 确保已安装 OpenSSH 客户端（Windows 10 1809 及更高版本可通过"可选功能"安装）
2. 如果使用密钥登录，请确保 SSH 密钥的权限设置正确
3. 如果遇到 `ssh-copy-id` 相关错误，可以尝试手动将公钥添加到远程服务器的 `~/.ssh/authorized_keys` 文件中

## Linux/macOS 用户注意事项

1. 确保已安装 OpenSSH 客户端
2. 确保 `~/.ssh` 目录的权限设置为 700，`~/.ssh/authorized_keys` 文件的权限设置为 600
