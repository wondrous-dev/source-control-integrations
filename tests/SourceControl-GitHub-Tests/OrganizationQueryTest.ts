// Commenting out these tests as these require a full OAuth flow to provide a code
// TODO: Fix these tests

// import { Organization } from "../../src/SourceControl-GitHub/Organization"
// import {
// 	apiWrapper,
// 	APIWrapper
// } from "../../src/SourceControl-GitHub/APIWrapper"
// import { Status } from "../../src/SourceControl-General/Status"

// import { expect } from "chai"

// const fakeUserId = "1"
// const thisOrgName = "wondrous-dev"
// const thisRepoName = "source-control-integrations"
// const nonExistantRepoName = "go-programming-language"
// const testMilestoneId = "7444945"

// describe("Properly Queries Organization", async () => {
// 	it("wondrous-dev contains 'source-control-integrations' but not 'go-programming-language'", async () => {
// 		const org: Organization = await apiWrapper.getOrganization(
// 			thisOrgName,
// 			fakeUserId
// 		)
// 		expect(org.containsRepo(thisRepoName)).to.equal(true)
// 		expect(org.containsRepo(nonExistantRepoName)).to.equal(false)
// 		expect(testMilestoneId in org.repos[thisRepoName].milestones).to.equal(true)
// 		expect(org.repos[thisRepoName].milestones[testMilestoneId].status).to.equal(
// 			Status.InProgress
// 		)
// 	})

// 	it("wondrous-dev contains 'source-control-integrations' which can synchronize successfully", async () => {
// 		const org: Organization = await apiWrapper.getOrganization(
// 			thisOrgName,
// 			fakeUserId
// 		)
// 		expect(await org.repos[thisRepoName].synchronize()).to.equal(true)
// 	})
// })
