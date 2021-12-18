import { Octokit } from "octokit"
import request from "@octokit/request"
import { createOAuthUserAuth } from "@octokit/auth-oauth-user"
import { Issue } from "./Issue"
import { Milestone } from "./Milestone"
import { Organization } from "./Organization"
import { PullRequest } from "./PullRequest"
import { Repository } from "./Repository"

const githubClientId = process.env.GITHUB_CLIENT_ID
// authenticate via personal token for now
if (process.env._AUTHTOKEN === null || process.env._AUTHTOKEN === "") {
	throw Error("GitHub Auth Token not found.")
}
const octokit = new Octokit({ auth: process.env._AUTHTOKEN })

interface UserRepo {
	id: number
	name: string
}

type AccessTokenMap = {
	[key: string]: string
}

type AuthObjectMap = {
	[key: string]: any
}

export class APIWrapper {
	// Octokit error so casting to any https://github.com/octokit/openapi-types.ts/issues/77
	userOctokit: any
	userAuthentication: any
	userAccessTokenMap: AccessTokenMap
	userAuthObjectMap: AuthObjectMap

	constructor() {
		this.userOctokit = null
		this.userAuthentication = null
		this.userAccessTokenMap = {}
		this.userAuthObjectMap = {}
	}

	checkUserAccessTokenExists(userId): Boolean {
		// Checks whether there is a userOctokit in this cache
		return !!(this.userAuthObjectMap[userId] && this.userAccessTokenMap[userId])
	}

	/**
	 * GetAccessToken - gets access token
	 *
	 *
	 * @param  {type} code: string OAuth code
	 * @param  {type} state: string OAuth state
	 * @return {type} accessToken: string
	 */
	async createOctokitWithAccessToken(
		code: string,
		userId: string
	): Promise<void> {
		// Store Github access token with user id
		const auth = createOAuthUserAuth({
			clientId: githubClientId,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			code
		})
		this.userOctokit = auth
		const userAuthentication = await auth()
		// Store token in backend
		this.userAuthObjectMap[userId] = auth
		this.userAccessTokenMap[userId] = userAuthentication?.token
	}

	/** getUserRepos - gets all the repos from an OAuthed user
	 *
	 *
	 * @return {type} [userRepos]: Array<UserRepo>
	 */
	async getUserOrgs(userId): Promise<Array<UserRepo>> {
		if (!this.userAccessTokenMap[userId]) {
			throw new Error("No authenticated user!")
		}
		try {
			console.log("userOctokit", this.userAuthObjectMap[userId])
			console.log("access_token", this.userAccessTokenMap[userId])
			const octokit = new Octokit({
				auth: this.userAccessTokenMap[userId]
			})
			const userOrgs = await octokit.request("GET /user/orgs")

			console.log("userOrgs check", userOrgs?.data)
			const finalUserOrgs = userOrgs?.data?.map((userOrg) => ({
				id: userOrg?.id,
				name: userOrg?.url && userOrg?.url.split("/").at(-1)
			}))
			console.log("final userOrgs check", finalUserOrgs)
			return finalUserOrgs
		} catch (err) {
			// Logging for error request user repos
			console.error(err)
		}
	}
	/**
	 * getOrganization - queries GitHub for Organization information, resolving all
	 *                   sub info, such as Repositories, Issues, etc.
	 *
	 * @param  {type} orgName: string organization name
	 * @return {type}                 a GitHub organization
	 */
	static async getOrganization(orgName: string): Promise<Organization> {
		const {
			data: { id }
		} = await octokit.rest.orgs.get({ org: orgName })

		const repositories: { [key: string]: Repository } = {}

		// if > 100 repos, will be paged
		// https://github.com/wondrous-dev/source-control-integrations/issues/10
		const respRepos = await octokit.rest.repos.listForOrg({ org: orgName })

		await Promise.all(
			respRepos.data.map(async (r) => {
				const repo = await this.getRepository(orgName, r.name, r.id.toString())
				repositories[r.name] = repo
			})
		)

		return new Organization(orgName, id.toString(), repositories)
	}

	static async getRepository(
		orgName: string,
		repoName: string,
		repoId: string
	): Promise<Repository> {
		const repo = new Repository(repoId, repoName, orgName)
		return this.resolveRepository(repo)
	}

	// uses undocumented API:
	// https://stackoverflow.com/questions/40798018/are-the-github-repository-id-numbers-permanent
	static async getRepositoryById(orgName, repoId: string): Promise<Repository> {
		const repoResp = await octokit.request("GET /repositories/" + repoId, {
			owner: "octocat",
			repo: "hello-world"
		})

		const repoName = repoResp.data.name

		const repo = new Repository(
			repoId,
			repoName,
			repoResp.data.organization.login
		)

		return this.resolveRepository(repo)
	}

	static async resolveRepository(repo: Repository): Promise<Repository> {
		// if > 100 issues, will be paged
		// https://github.com/wondrous-dev/source-control-integrations/issues/10
		const respIssues = await octokit.rest.issues.listForRepo({
			owner: repo.orgName,
			repo: repo.title
		})

		respIssues.data.forEach((i) => {
			if (i.pull_request === null) {
				const issue = new Issue(i.id.toString(), i.title, i.state)
				repo.addTask(issue)
			}
		})

		// Let's just only track open PRs for now

		// if > 100 prs, will be paged
		// https://github.com/wondrous-dev/source-control-integrations/issues/10
		const respPullRequests = await octokit.rest.pulls.list({
			owner: repo.orgName,
			repo: repo.title
		})

		respPullRequests.data.forEach((pr) => {
			const p = new PullRequest(pr.id.toString(), pr.title, pr.state)
			repo.addTask(p)
		})

		// if > 100 prs, will be paged
		// https://github.com/wondrous-dev/source-control-integrations/issues/10
		const respMilestones = await this.getMilestones(repo.orgName, repo.title)
		respMilestones.forEach((m) => repo.addMilestone(m))

		return repo
	}

	static async getMilestones(
		orgName: string,
		repoName: string
	): Promise<Milestone[]> {
		// if > 100 milestones, will be paged
		// https://github.com/wondrous-dev/source-control-integrations/issues/10
		const respMilestones = await octokit.rest.issues.listMilestones({
			owner: orgName,
			repo: repoName
		})

		const milestones = respMilestones.data.map(
			(m) =>
				new Milestone(
					m.id.toString(),
					m.title,
					orgName,
					m.description,
					new Date(m.due_on),
					new Date(m.created_at),
					m.state,
					m.closed_at === null ? null : new Date(m.closed_at)
				)
		)

		return milestones
	}
}

export const apiWrapper = new APIWrapper()
