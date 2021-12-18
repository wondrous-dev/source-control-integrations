import { Server } from "./Server"

import { Injector } from "reduct"

export class App {
	private server: Server

	constructor(deps: Injector) {
		this.server = deps(Server)
	}

	start(): void {
		this.server.start()
	}
}
