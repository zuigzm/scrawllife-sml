#!/usr/bin/env node
const ora = require('ora')()
const set = require('./set')
const serverList = require('./server')
const ssh = require('./ssh')

require('yargs')
	.usage('$0 <cmd> [args]')
	.command(
		'set [server]',
		'添加一台新的服务器配置',
		yargs => {
			ora.start('Loading...')
			return yargs.option('server', {
				alias: 'S',
				describe: '请设置正确的服务器配置'
			})
		},
		argv => {
			ora.stop()
			if (argv.server) {
				set().then(answers => {
					if (answers) {
						ora.succeed('设置服务器信息成功!')
					}
				})
			}
		}
	)
	.command('list', '服务器选择列表', argv => {
		serverList().then(answers => {
			if (answers) {
				ssh(answers)
			}
		})
	})
	.help().argv
