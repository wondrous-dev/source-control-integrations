import { Repository } from "./Repository";

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
    return this.repos.filter((x) => x.title == repoName).length == 1;
  }
}
