import reduct from "reduct"
import dotenv from "dotenv"
import path from "path"

import { App } from "./services/App"

dotenv.config({ path: path.join(__dirname, "/../.env") })
const container = reduct()
const app = container(App)
app.start()
