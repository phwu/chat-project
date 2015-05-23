'use strict'

module.exports = {
	db: {
		user: 'polly',
		pw: 'ph1991',
		host: 'ds031852.mongolab.com',
		port: 31852,
		db: 'chatex',
		options: {
			server: {
				socketOptions: {
					keepAlive: 1,
					connectTimeOutMS: 30000
				}
			},
			replset: {
				socketOptions: {
					keepAlive: 1,
					connectTimeoutMS: 30000
				}
			}
		}
	}
}