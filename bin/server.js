const inquirer = require('inquirer')
const fs = require('fs')
const path = require('path')
const json = path.join(__dirname, '../server.txt')

module.exports = () => {
	return new Promise((resolve, reject) => {
		fs.readFile(json, 'utf8', (err, data) => {
			if (err) throw err
			if (!data) data = []
			data = JSON.parse(data)
			resolve(data)
		})
	}).then(data => {
		return inquirer
			.prompt([
				{
					type: 'list',
					name: 'select',
					message: '请选择服务器',
					choices: data
				}
			])
			.then(answers => {
				const serverList = {}
				data.map(item => {
					if (item.name === answers.select) {
						Object.assign(serverList, item)
					}
				})
				return serverList
			})
	})
}
