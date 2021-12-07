import { Organization } from "../../src/SourceControl-GitHub/Organization";
import { APIWrapper } from "../../src/SourceControl-GitHub/APIWrapper";
import { Status } from "../../src/SourceControl-General/Status";

import { expect } from "chai";

const thisOrgName = "wondrous-dev";
const thisRepoName = "source-control-integrations";
const nonExistantRepoName = "go-programming-language";
const testMilestoneId = "7444945";

describe("Properly Queries Organization", async () => {
  it("wondrous-dev contains 'source-control-integrations' but not 'go-programming-language'", async () => {
    const org: Organization = await APIWrapper.GetOrganization(thisOrgName);
    expect(org.containsRepo(thisRepoName)).to.equal(true);
    expect(org.containsRepo(nonExistantRepoName)).to.equal(false);
    expect(testMilestoneId in org.repos[thisRepoName].milestones).to.equal(
      true
    );
    expect(org.repos[thisRepoName].milestones[testMilestoneId].status).to.equal(
      Status.InProgress
    );
  });

  it("wondrous-dev contains 'source-control-integrations' which can synchronize successfully", async () => {
    const org: Organization = await APIWrapper.GetOrganization(thisOrgName);
    expect(await org.repos[thisRepoName].synchronize()).to.equal(true);
  });
});
