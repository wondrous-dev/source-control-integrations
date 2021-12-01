import { GUID } from "../../src/Common/GUID";
import { expect } from "chai";

describe("GUID's are deterministic", () => {
  const guidA = new GUID(["a", "foo", "bar"]);
  const guidB = new GUID(["a", "foo", "bar"]);
  const guidC = new GUID(["a", "foo", "baz"]);
  const guidD = new GUID(["b", guidA.toString()]);
  const guidE = new GUID(["b", guidB.toString()]);

  it("created with same array of strings are equal", () => {
    expect(guidA.toString()).to.equal(guidB.toString());
  });

  it("created with same array of strings and other GUID's are equal", () => {
    expect(guidD.toString()).to.equal(guidE.toString());
  });

  it("created with different array of strings are not equal", () => {
    expect(guidA.toString()).not.to.equal(guidC.toString());
  });
});
