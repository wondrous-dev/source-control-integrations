import { Organization } from "../../src/SourceControl-GitHub/Organization";
import { APIWrapper } from "../../src/SourceControl-GitHub/APIWrapper";

import { expect } from "chai";

const thisOrgName = "wondrous-dev";
const thisRepoName = "source-control-integrations";
const nonExistantRepoName = "go-programming-language";

describe("Properly Queries Organization", async () => {
  it("wondrous-dev contains 'source-control-integrations' but not 'go-programming-language'", async () => {
    const org: Organization = await APIWrapper.GetOrganization(thisOrgName);
    expect(org.containsRepo(thisRepoName)).to.equal(true);
    expect(org.containsRepo(nonExistantRepoName)).to.equal(false);
  });
});
