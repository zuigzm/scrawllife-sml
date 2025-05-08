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

### "ReferenceError: \_\_dirname is not defined in ES module scope"

如果您遇到这个错误，这是因为项目使用了 ES 模块（在 package.json 中设置了 `"type": "module"`），而在 ES 模块中，`__dirname` 和 `__filename` 变量不可用。

最新版本已经修复了这个问题，使用以下方式获取当前文件的目录路径：

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

// 在 ES 模块中获取 __dirname 的替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

如果您仍然遇到这个问题，可以尝试以下解决方案：

1. **更新到最新版本**：最新版本已经修复了这个问题
2. **重新构建项目**：如果您修改了代码，请运行 `npm run build`
3. **使用 utils.js 中的 \_\_dirname**：
   ```javascript
   import { __dirname } from './utils.js';
   ```
4. **降级 Node.js 版本**：如果您使用的是 Node.js v22.x，可以尝试降级到 v18.x LTS 版本
5. **修改 package.json**：将 `"type": "module"` 改为 `"type": "commonjs"`，但这可能需要修改其他导入语句

### "ReferenceError: require is not defined in ES module scope"

如果您遇到这个错误，这是因为在 ES 模块中，`require` 函数不可用，需要使用 `import` 语句代替。

解决方案：

1. **使用 import 语句**：

   ```javascript
   // 替换这个
   const fs = require('fs');

   // 使用这个
   import fs from 'fs';
   ```

2. **使用动态导入**：

   ```javascript
   // 替换这个
   const module = require('module-name');

   // 使用这个
   const module = await import('module-name');
   ```

3. **使用 createRequire API**：

   ```javascript
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
   const fs = require('fs');
   ```

4. **修改文件扩展名**：将 `.js` 改为 `.cjs`，这样文件会被视为 CommonJS 模块

### "Pseudo-terminal will not be allocated because stdin is not a terminal"

如果您遇到这个错误，工具已经自动添加了 `-tt` 参数来强制分配伪终端。如果仍然出现问题，可以尝试以下方法：

1. 确保您的 SSH 客户端版本是最新的
2. 尝试使用密钥认证而不是密码认证
3. 在交互式终端中运行命令，而不是通过脚本或其他非交互式方式

### "Permission denied, please try again" 或 "All configured authentication methods failed"

如果您遇到权限被拒绝或认证方法失败的错误，可能是以下原因：

1. **密码错误**：请确认您设置的密码是正确的
2. **用户权限**：确认该用户有权限通过 SSH 登录服务器
3. **SSH 配置**：服务器可能禁用了密码认证，只允许密钥认证
4. **登录限制**：服务器可能限制了特定 IP 地址的登录
5. **密钥问题**：SSH 密钥格式不正确或权限设置不当
6. **认证方法限制**：服务器可能只允许特定的认证方法

解决方法：

1. **重新设置密码**：使用 `sml set --server` 重新设置正确的密码
2. **尝试其他认证方式**：如果密码认证失败，尝试使用密钥认证，反之亦然
3. **检查服务器配置**：查看服务器的 SSH 配置（`/etc/ssh/sshd_config`）
4. **联系管理员**：联系服务器管理员确认您的账号权限
5. **检查密钥权限**：确保密钥文件权限正确（私钥应为 600）
6. **启用调试模式**：使用 `-v` 参数查看详细的连接过程

### "TypeError: Cannot read properties of null (reading 'join')"

如果您遇到这个错误，可能是因为 SSH 认证方法列表为 null。最新版本已经修复了这个问题，添加了对 null 值的检查和处理。

解决方法：

1. **更新到最新版本**：最新版本已经修复了这个问题
2. **检查网络连接**：确保您的网络连接正常，可以访问目标服务器
3. **检查服务器状态**：确保目标服务器正常运行并且 SSH 服务可用
4. **检查防火墙设置**：确保防火墙没有阻止 SSH 连接

最新版本已经添加了更详细的错误信息和自动重试机制，可以帮助您更好地诊断和解决连接问题。

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
