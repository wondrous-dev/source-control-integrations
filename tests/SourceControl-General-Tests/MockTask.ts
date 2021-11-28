import { GUID } from "../../src/Common/GUID";
import { Status } from "../../src/SourceControl-General/Status";
import { Task } from "../../src/SourceControl-General/Task";

export class MockTask implements Task {
  id: GUID;
  title: string;
  status: Status;

  constructor(title: string, status: Status) {
    this.id = new GUID();
    this.title = title;
    this.status = status;
  }

  updateStatus(newStatus: Status): boolean {
    this.status = newStatus;
    return true;
  }
}
