import { Octokit } from "octokit";
import { Issue } from "./Issue";
import { Milestone } from "./Milestone";
import { Organization } from "./Organization";
import { PullRequest } from "./PullRequest";
import { Repository } from "./Repository";

// authenticate via personal token for now
if (process.env._AUTHTOKEN === null || process.env._AUTHTOKEN === "") {
  throw Error("GitHub Auth Token not found.");
}
const octokit = new Octokit({ auth: process.env._AUTHTOKEN });

export class APIWrapper {
  /**
   * GetOrganization - queries GitHub for Organization information, resolving all
   *                   sub info, such as Repositories, Issues, etc.
   *
   * @param  {type} orgName: string organization name
   * @return {type}                 a GitHub organization
   */
  static async GetOrganization(orgName: string): Promise<Organization> {
    const {
      data: { id },
    } = await octokit.rest.orgs.get({ org: orgName });

    const repositories: { [key: string]: Repository } = {};

    // if > 100 repos, will be paged
    // https://github.com/wondrous-dev/source-control-integrations/issues/10
    const respRepos = await octokit.rest.repos.listForOrg({ org: orgName });

    await Promise.all(
      respRepos.data.map(async (r) => {
        const repo = await this.GetRepository(orgName, r.name, r.id.toString());
        repositories[r.name] = repo;
      })
    );

    return new Organization(orgName, id.toString(), repositories);
  }

  static async GetRepository(
    orgName: string,
    repoName: string,
    repoId: string
  ): Promise<Repository> {
    const repo = new Repository(repoId, repoName, orgName);
    return this.ResolveRepository(repo);
  }

  // uses undocumented API:
  // https://stackoverflow.com/questions/40798018/are-the-github-repository-id-numbers-permanent
  static async GetRepositoryById(orgName, repoId: string): Promise<Repository> {
    const repoResp = await octokit.request("GET /repositories/" + repoId, {
      owner: "octocat",
      repo: "hello-world",
    });

    const repoName = repoResp.data.name;

    const repo = new Repository(
      repoId,
      repoName,
      repoResp.data.organization.login
    );

    return this.ResolveRepository(repo);
  }

  static async ResolveRepository(repo: Repository): Promise<Repository> {
    // if > 100 issues, will be paged
    // https://github.com/wondrous-dev/source-control-integrations/issues/10
    const respIssues = await octokit.rest.issues.listForRepo({
      owner: repo.orgName,
      repo: repo.title,
    });

    respIssues.data.forEach((i) => {
      if (i.pull_request === null) {
        const issue = new Issue(i.id.toString(), i.title, i.state);
        repo.addTask(issue);
      }
    });

    // if > 100 prs, will be paged
    // https://github.com/wondrous-dev/source-control-integrations/issues/10
    const respPullRequests = await octokit.rest.pulls.list({
      owner: repo.orgName,
      repo: repo.title,
    });

    respPullRequests.data.forEach((pr) => {
      const p = new PullRequest(pr.id.toString(), pr.title, pr.state);
      repo.addTask(p);
    });

    // if > 100 prs, will be paged
    // https://github.com/wondrous-dev/source-control-integrations/issues/10
    const respMilestones = await this.GetMilestones(repo.orgName, repo.title);
    respMilestones.forEach((m) => repo.addMilestone(m));

    return repo;
  }

  static async GetMilestones(
    orgName: string,
    repoName: string
  ): Promise<Milestone[]> {
    // if > 100 milestones, will be paged
    // https://github.com/wondrous-dev/source-control-integrations/issues/10
    const respMilestones = await octokit.rest.issues.listMilestones({
      owner: orgName,
      repo: repoName,
    });

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
    );

    return milestones;
  }
}
