import express from 'express'
import bodyParser from 'body-parser'

import router from './Router'

export class Server {
	private app: express.Express

	constructor () {
		this.app = express()
		this.app.use(bodyParser.json())
		this.app.use('/', router)
	}

	start (): void {
		const port = process.env.PORT || 4002
		this.app.listen({ port }, () => {
			console.log(`Server ready at http://localhost:${port}`)
		})
	}
}
