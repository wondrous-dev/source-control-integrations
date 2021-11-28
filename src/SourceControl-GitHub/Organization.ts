import { Octokit } from "octokit";
import { Issue } from "./Issue";
import { PullRequest } from "./PullRequest";
import { Repository } from "./Repository";
import { Status } from "../SourceControl-General/Status";

/**
 * See response to "get organization" for all available fields:
 * https://docs.github.com/en/rest/reference/orgs#get-an-organization
 */
export class Organization {
  name: string;

  id: number;

  repos: Repository[];

  constructor(name: string, id: number, repos: Repository[]) {
    this.name = name;
    this.id = id;
    this.repos = repos;
  }

  containsRepo(repoName: string): boolean {
    // TODO: should enforce uniqueness (which GitHub does?)
    return this.repos.filter((x) => x.title == repoName).length == 1;
  }
}

// authenticate via personal token for now
const octokit = new Octokit({ auth: process.env._AUTHTOKEN });

// private to this module
async function GetRepository(
  orgName: string,
  repoName: string
): Promise<Repository> {
  // if > 100 issues, will be paged
  const respIssues = await octokit.rest.issues.listForRepo({
    owner: orgName,
    repo: repoName,
  });

  const repo = new Repository(repoName);

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

/**
 * GetOrganization - queries GitHub for Organization information, resolving all
 *                   sub info, such as Repositories, Issues, etc.
 *
 * @param  {type} orgName: string organization name
 * @return {type}                 a GitHub organization
 */
export async function GetOrganization(orgName: string): Promise<Organization> {
  const {
    data: { id },
  } = await octokit.rest.orgs.get({ org: orgName });
  // if > 100 repos, will be paged
  const respRepos = await octokit.rest.repos.listForOrg({ org: orgName });
  const repositories: Repository[] = [];

  for (const i in respRepos.data) {
    let r = respRepos.data[i];
    repositories.push(await GetRepository(orgName, r.name));
  }

  return new Organization(orgName, id, repositories);
}