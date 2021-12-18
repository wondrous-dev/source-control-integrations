import { Octokit } from "octokit"
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
const defaultOctokit = new Octokit({ auth: process.env._AUTHTOKEN })

interface UserRepo {
	id: number
	name: string
}

type AccessTokenMap = {
	[key: string]: string
}

type AuthOctokitMap = {
	[key: string]: Octokit
}

export class APIWrapper {
	// Octokit error so casting to any https://github.com/octokit/openapi-types.ts/issues/77
	userOctokit: any
	userAuthentication: any
	userAccessTokenMap: AccessTokenMap
	userAuthOctokitMap: AuthOctokitMap

	constructor() {
		this.userOctokit = null
		this.userAuthentication = null
		this.userAccessTokenMap = {}
		this.userAuthOctokitMap = {}
	}

	checkUserAccessTokenExists(userId): boolean {
		// Checks whether there is a userOctokit in this cache
		return !!(
			this.userAuthOctokitMap[userId] && this.userAccessTokenMap[userId]
		)
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
		this.userAccessTokenMap[userId] = userAuthentication?.token
		const octokit = new Octokit({
			auth: this.userAccessTokenMap[userId]
		})
		this.userAuthOctokitMap[userId] = octokit
	}

	/** getUserRepos - gets all the repos from an OAuthed user
	 *
	 *
	 * @return {type} [userRepos]: Array<UserRepo>
	 */
	async getUserOrgs(userId): Promise<Array<UserRepo>> {
		if (!this.checkUserAccessTokenExists(userId)) {
			throw new Error("No authenticated user!")
		}
		try {
			const userOrgs = await this.userAuthOctokitMap[userId].request(
				"GET /user/orgs"
			)
			const finalUserOrgs = userOrgs?.data?.map((userOrg) => ({
				id: userOrg?.id,
				name: userOrg?.url && userOrg?.url.split("/").at(-1)
			}))

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
	async getOrganization(
		orgName: string,
		userId: string
	): Promise<Organization> {
		if (!this.checkUserAccessTokenExists(userId)) {
			throw new Error("No authenticated user!")
		}
		const octokit = this.userAuthOctokitMap[userId]
		const {
			data: { id }
		} = await octokit.rest.orgs.get({ org: orgName })

		const repositories: { [key: string]: Repository } = {}

		// if > 100 repos, will be paged
		// https://github.com/wondrous-dev/source-control-integrations/issues/10
		const respRepos = await octokit.request("GET /orgs/{org}/repos", {
			org: orgName
		})

		await Promise.all(
			respRepos.data.map(async (r) => {
				const repo = await this.getRepository(
					orgName,
					r.name,
					r.id.toString(),
					userId
				)
				repositories[r.name] = repo
			})
		)

		return new Organization(orgName, id.toString(), repositories)
	}

	async getRepository(
		orgName: string,
		repoName: string,
		repoId: string,
		userId
	): Promise<Repository> {
		if (!this.checkUserAccessTokenExists(userId)) {
			throw new Error("No authenticated user!")
		}

		const repo = new Repository(repoId, repoName, orgName)
		return this.resolveRepository(repo, userId)
	}

	// uses undocumented API:
	// https://stackoverflow.com/questions/40798018/are-the-github-repository-id-numbers-permanent
	async getRepositoryById(orgName, repoId: string): Promise<Repository> {
		const repoResp = await defaultOctokit.request(
			"GET /repositories/" + repoId,
			{
				owner: "octocat",
				repo: "hello-world"
			}
		)

		const repoName = repoResp.data.name

		const repo = new Repository(
			repoId,
			repoName,
			repoResp.data.organization.login
		)

		return this.resolveRepository(repo, null)
	}

	async resolveRepository(repo: Repository, userId): Promise<Repository> {
		// if > 100 issues, will be paged
		// https://github.com/wondrous-dev/source-control-integrations/issues/10
		const octokit = this.userAuthOctokitMap[userId]

		const respIssues = await octokit.request(
			"GET /repos/{owner}/{repo}/issues",
			{
				owner: repo.orgName,
				repo: repo.title
			}
		)
		// Let's just track open PRs
		respIssues.data.forEach((i) => {
			if (!i.pull_request && i.state === "open") {
				const issue = new Issue(i.id.toString(), i.title, i.state)
				repo.addTask(issue)
			}
		})

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
		const respMilestones = await this.getMilestones(
			repo.orgName,
			repo.title,
			userId
		)
		respMilestones.forEach((m) => repo.addMilestone(m))

		return repo
	}

	async getMilestones(
		orgName: string,
		repoName: string,
		userId
	): Promise<Milestone[]> {
		// if > 100 milestones, will be paged
		// https://github.com/wondrous-dev/source-control-integrations/issues/10
		const octokit = this.userAuthOctokitMap[userId] || defaultOctokit
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
