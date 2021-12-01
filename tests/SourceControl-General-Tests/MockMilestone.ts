import { GUID } from "../../src/Common/GUID";
import { Status } from "../../src/SourceControl-General/Status";
import { Milestone } from "../../src/SourceControl-General/Milestone";
import { Task } from "../../src/SourceControl-General/Task";

export class MockMilestone implements Milestone {
  id: GUID;
  title: string;
  projectId: GUID;
  description: string;
  dueDate: Date;
  startDate: Date;
  completionDate: Date;
  status: Status;
  tasks: { [key: string]: Task };

  constructor(
    title: string,
    projectId: GUID,
    description: string,
    dueDate: Date,
    startDate: Date,
    status: Status,
    tasks: { [key: string]: Task },
    completionDate: Date = null
  ) {
    this.id = new GUID([title, projectId.toString()]);
    this.title = title;
    this.projectId = projectId;
    this.description = description;
    this.dueDate = dueDate;
    this.startDate = startDate;
    this.completionDate = completionDate;
    this.status = status;
    this.tasks = tasks;
  }

  updateStatus(newStatus: Status): boolean {
    this.status = newStatus;
    return true;
  }

  // in the real world, we'd do some checking to make sure this isn't already
  // complete
  complete(completionDate: Date): boolean {
    this.completionDate = completionDate;
    return true;
  }
}
