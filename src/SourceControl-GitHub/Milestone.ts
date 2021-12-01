import { Milestone as GeneralMilestone } from "../SourceControl-General/Milestone";
import { Status } from "../SourceControl-General/Status";
import { Task } from "../SourceControl-General/Task";
import { APIWrapper } from "./APIWrapper";

export class Milestone implements GeneralMilestone {
  id: string;

  title: string;

  orgName: string;

  description: string;

  dueDate: Date;

  startDate: Date;

  completionDate: Date;

  status: Status;

  tasks: { [key: string]: Task };

  constructor(
    id: string,
    title: string,
    orgName: string,
    description: string,
    dueDate: Date,
    startDate: Date,
    status: string, // TODO: translate to status
    completionDate: Date = null
  ) {
    this.id = id;
    this.title = title;
    this.orgName = orgName;
    this.description = description;
    this.dueDate = dueDate;
    this.startDate = startDate;
    this.completionDate = completionDate;
    this.status = Status.InReview; // TODO: fix
    this.tasks = {};
  }

  /**
   * addTask - helper to append Task to Milestone's internal collection of Tasks
   *
   * @param  {type} task: Task
   */
  addTask(task: Task) {
    if (task.id in this.tasks) {
      throw Error("Unexpected duplicate task");
    } else {
      this.tasks[task.id] = task;
    }
  }

  // TODO: implement
  updateStatus(): boolean {
    return true;
  }

  // TODO: implement
  complete(): boolean {
    return true;
  }
}
