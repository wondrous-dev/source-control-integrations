import { Status } from "../SourceControl-General/Status";
import { Task } from "../SourceControl-General/Task";
import { TaskType } from "../SourceControl-General/TaskType";

/**
 * See response to "get pull request" for all available fields:
 * https://docs.github.com/en/rest/reference/pulls#list-pull-requests
 */
export class PullRequest implements Task {
  id: string;

  title: string;

  status: Status;

  taskType: TaskType;

  constructor(id: string, title: string, stateString: string) {
    this.id = id;
    this.title = title;
    this.status = stateString == "open" ? Status.InProgress : Status.Completed;
    this.taskType = TaskType.PullRequest;
  }

  updateStatus(newStatus: Status): boolean {
    throw Error("Not implemented. When implemented, update to " + newStatus);
  }
}
