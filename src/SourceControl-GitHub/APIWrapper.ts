import { Octokit } from "octokit";
import { Issue } from "./Issue";
import { Milestone } from "./Milestone";
import { Organization } from "./Organization";
import { PullRequest } from "./PullRequest";
import { Repository } from "./Repository";

// authenticate via personal token for now
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
    const respRepos = await octokit.rest.repos.listForOrg({ org: orgName });

    for (let i = 0; i < respRepos.data.length; i++) {
      let repoName = respRepos.data[i].name;
      let repoId = respRepos.data[i].id.toString();
      const repo = await this.GetRepository(orgName, repoName, repoId);
      repositories[repoName] = repo;
    }

    return new Organization(orgName, id.toString(), repositories);
  }

  static async GetRepository(
    orgName: string,
    repoName: string,
    repoId: string
  ): Promise<Repository> {
    const repo = new Repository(repoId, repoName, orgName);

    // if > 100 issues, will be paged
    const respIssues = await octokit.rest.issues.listForRepo({
      owner: orgName,
      repo: repoName,
    });

    respIssues.data
      .filter((i) => i.pull_request == null)
      // get actual status
      .map((i) => new Issue(i.id.toString(), i.title, i.state))
      .forEach((i) => repo.addTask(i));

    // if > 100 prs, will be paged
    const respPullRequests = await octokit.rest.pulls.list({
      owner: orgName,
      repo: repoName,
    });

    respPullRequests.data
      .map((pr) => new PullRequest(pr.id.toString(), pr.title, pr.state))
      .forEach((pr) => repo.addTask(pr));

    // if > 100 prs, will be paged
    const respMilestones = await this.GetMilestones(orgName, repoName);
    respMilestones.forEach((m) => repo.addMilestone(m));

    return repo;
  }

  static async GetMilestones(
    orgName: string,
    repoName: string
  ): Promise<Milestone[]> {
    // if > 100 milestones, will be paged
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
