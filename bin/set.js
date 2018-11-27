const inquirer = require('inquirer')
const fs = require('fs')
const path = require('path')
const json = path.join(__dirname, '../server.txt')

const questions = [
	{
		type: 'input',
		name: 'name',
		message: '设置服务器别名:',
		default: '服务器名称'
	},
	{
		type: 'input',
		name: 'server',
		message: '请设置你的服务器:',
		default: '192.168.1.1'
	},
	{
		type: 'input',
		name: 'port',
		message: '请设置服务器端口号:',
		default: '22'
	},
	{
		type: 'input',
		name: 'username',
		message: '请选择服务器用户(尽可能不是用root权限登录):',
		default: 'root'
	},
	{
		type: 'password',
		name: 'password',
		message: '请设置你的服务器密码(账号密码保存在本地):'
	}
]

module.exports = () => {
	return inquirer.prompt(questions).then(answers => {
		return inquirer
			.prompt({
				type: 'confirm',
				name: 'type',
				message: `请确定你的信息!`
			})
			.then(ft => {
				if (ft.type) {
					// 读取文件
					fs.readFile(json, 'utf8', (err, data) => {
						if (err) throw err
						if (!data) data = JSON.stringify([])
						data = JSON.parse(data)
						data.push(answers)
						// 简单解决直接覆盖
						fs.writeFile(json, JSON.stringify(data), 'utf8', err => {
							if (err) throw err
						})
					})

					return ft.type
				}
			})
	})
}
