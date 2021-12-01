import { GUID } from "../../src/Common/GUID";
import { Status } from "../../src/SourceControl-General/Status";
import { Task } from "../../src/SourceControl-General/Task";

export class MockTask implements Task {
  id: GUID;
  projectId: GUID;
  title: string;
  status: Status;

  constructor(title: string, projectId: GUID, status: Status) {
    this.id = new GUID([title, projectId.toString()]);
    this.title = title;
    this.projectId = projectId;
    this.status = status;
  }

  updateStatus(newStatus: Status): boolean {
    this.status = newStatus;
    return true;
  }
}
