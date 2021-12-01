import { v5 as uuidv5 } from "uuid";

/**
 * Global Unique Identifier, motivated from this StackOverFlow answer:
 * https://stackoverflow.com/questions/37144672/guid-uuid-type-in-typescript
 * Extended to take in an array of strings in order to be able to deterministically
 * recreate the same objects using the unique identifier system of the source.
 * I.E. for GitHub, projects are identified by "ORG_NAME/REPO_NAME". Thus, two
 * of objects which have the same "ORG_NAME/REPO_NAME" should be equal.
 */
export class GUID {
  private uuid: string;

  constructor(strings: String[]) {
    const concattedString: string = strings.join("");
    this.uuid = uuidv5(concattedString, uuidv5.DNS);
  }

  toString(): string {
    return this.uuid;
  }
}
