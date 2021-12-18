import { Router } from 'express'
import { apiWrapper } from '../SourceControl-GitHub/APIWrapper'

const router = Router()

router.get('/', (req, res) => {
	res.send('OK')
})

/**
 * Authenticate and return all associated organizations
 * from authenticated users
 *
 * @param  {type} code: string OAuth code
 * @param  {type} userId: logged in userId
 * @return {type} [Organization]
 */

router.post('/github/user/organizations', async (req, res) => {
	const { code, userId } = req.body

	if (!apiWrapper.checkUserAccessTokenExists(userId)) {
		// TODO: Check for access token in Wonder API
		await apiWrapper.createOctokitWithAccessToken(code, userId)
	}
	const githubOrgs = await apiWrapper.getUserOrgs(userId)
	res.json(githubOrgs)
})

/**
 * Get a list of tasks and milestones from repo
 *
 * @param  {type} orgName: chosen Github Org to import from
 * @param  {type} userId: logged in userId
 * @return {type} {tasks: [Tasks], milestones: [Milestones]}
 */

router.post('/github/user/task-import', async (req, res) => {
	//
	const { orgName, userId } = req.body
	if (!apiWrapper.checkUserAccessTokenExists(userId)) {
		// TODO: read access token from DB
	}
	const organization = await apiWrapper.getOrganization(orgName, userId)
	let tasks = []
	let milestones = []
	for (const key in organization?.repos) {
		const repository = organization?.repos[key]
		tasks = [...tasks, ...repository.getTasks()]
		milestones = [...milestones, ...repository.getMilestones()]
	}
	res.json({
		tasks,
		milestones
	})
})
export default router
