import {
  Organization,
  GetOrganization,
} from "../../src/SourceControl-GitHub/Organization";
import { expect } from "chai";

describe("Properly Queries Organization", async () => {
  const org: Organization = await GetOrganization("wondrous-dev");

  it("contains this repo", () => {
    expect(org.containsRepo("source-control-integrations")).to.equal(true);
  });

  it("does not contain go programming language repo", () => {
    expect(org.containsRepo("go")).to.equal(false);
  });
});
