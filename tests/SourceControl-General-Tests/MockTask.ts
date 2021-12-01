import { Status } from "../../src/SourceControl-General/Status";
import { Task } from "../../src/SourceControl-General/Task";

export class MockTask implements Task {
  id: string;
  title: string;
  status: Status;

  constructor(id: string, title: string, status: Status) {
    this.id = id;
    this.title = title;
    this.status = status;
  }

  updateStatus(newStatus: Status): boolean {
    this.status = newStatus;
    return true;
  }
}
