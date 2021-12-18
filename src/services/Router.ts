import { Router } from "express"
import { apiWrapper } from "../SourceControl-GitHub/APIWrapper"

const router = Router()

router.get("/", (req, res) => {
	res.send("OK")
})

router.post("/github/user/organizations", async (req, res) => {
	// Authenticate and return all associated organizations

	const { code, userId } = req.body

	if (!apiWrapper.checkUserAccessTokenExists(userId)) {
		// TODO: Check for access token in Wonder API
		await apiWrapper.createOctokitWithAccessToken(code, userId)
	}
	const githubOrgs = await apiWrapper.getUserOrgs(userId)
	res.json(githubOrgs)
})

export default router
