import { Octokit } from "octokit";
import { Issue } from "./Issue";
import { Organization } from "./Organization";
import { PullRequest } from "./PullRequest";
import { Repository } from "./Repository";
import { Status } from "../SourceControl-General/Status";

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
    // if > 100 repos, will be paged
    const respRepos = await octokit.rest.repos.listForOrg({ org: orgName });
    const repositories: Repository[] = [];

    for (let i = 0; i < respRepos.data.length; i++) {
      let repoName = respRepos.data[i].name;
      const repo = await this.GetRepository(orgName, repoName);
      repositories.push(repo);
    }

    return new Organization(orgName, id, repositories);
  }

  static async GetRepository(
    orgName: string,
    repoName: string
  ): Promise<Repository> {
    // if > 100 issues, will be paged
    const respIssues = await octokit.rest.issues.listForRepo({
      owner: orgName,
      repo: repoName,
    });

    const repo = new Repository(repoName, orgName);

    respIssues.data
      .filter((i) => i.pull_request == null)
      // get actual status
      .map((i) => new Issue(i.title, Status.Todo))
      .forEach((i) => repo.addTask(i));

    // if > 100 prs, will be paged
    const respPullRequests = await octokit.rest.pulls.list({
      owner: orgName,
      repo: repoName,
    });

    respPullRequests.data
      .map((pr) => new PullRequest(pr.title, Status.InProgress))
      .forEach((pr) => repo.addTask(pr));

    return repo;
  }
}
