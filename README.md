# scrawllife sml

> server message lock，用来保存终端上会使用到的服务器账号密码（给不想保存秘钥的朋友）

## 系统兼容性

本工具支持以下操作系统：

- Windows 10/11（需要安装 OpenSSH 或 Git Bash）
- Linux（各主流发行版）
- macOS

## Node.js 版本兼容性

本工具已经过重构，移除了对 node-pty 的依赖，现在可以在以下 Node.js 版本上运行：

- Node.js v16.x 及以上版本
- Node.js v18.x LTS（推荐）
- Node.js v20.x 及以上版本

## 常见问题解决

### "Pseudo-terminal will not be allocated because stdin is not a terminal"

如果您遇到这个错误，工具已经自动添加了 `-tt` 参数来强制分配伪终端。如果仍然出现问题，可以尝试以下方法：

1. 确保您的 SSH 客户端版本是最新的
2. 尝试使用密钥认证而不是密码认证
3. 在交互式终端中运行命令，而不是通过脚本或其他非交互式方式

### "Permission denied, please try again"

如果您遇到权限被拒绝的错误，可能是以下原因：

1. **密码错误**：请确认您设置的密码是正确的
2. **用户权限**：确认该用户有权限通过 SSH 登录服务器
3. **SSH 配置**：服务器可能禁用了密码认证，只允许密钥认证
4. **登录限制**：服务器可能限制了特定 IP 地址的登录

解决方法：

1. 使用 `sml set --server` 重新设置正确的密码
2. 尝试使用密钥认证方式
3. 检查服务器的 SSH 配置（`/etc/ssh/sshd_config`）
4. 联系服务器管理员确认您的账号权限

### 关于自动密码登录

最新版本使用了智能检测方式来自动输入密码：

1. 程序会监控 SSH 的输出，检测密码提示
2. 当检测到密码提示时，会自动输入您设置的密码
3. 如果自动输入失败，您仍然可以手动输入密码

如果自动密码登录仍然不工作，可能是因为：

1. 服务器的密码提示格式不常见，无法被程序识别
2. 服务器禁用了密码认证
3. 网络延迟导致检测不准确

您可以尝试：

1. 使用 `-v` 参数查看详细的 SSH 连接过程（已默认添加）
2. 使用密钥认证代替密码认证
3. 手动输入密码

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
4. 使用密码登录时，程序会自动在适当的时机输入密码，无需手动输入

## Linux/macOS 用户注意事项

1. 确保已安装 OpenSSH 客户端
2. 确保 `~/.ssh` 目录的权限设置为 700，`~/.ssh/authorized_keys` 文件的权限设置为 600
3. 使用密码登录时，程序会自动在适当的时机输入密码，无需手动输入
