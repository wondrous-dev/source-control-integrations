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

  constructor(id: string, title: string, status: Status) {
    this.id = id;
    this.title = title;
    this.status = status;
    this.taskType = TaskType.PullRequest;
  }

  // TODO: actually update GitHub
  updateStatus(newStatus: Status): boolean {
    this.status = newStatus;
    return true;
  }
}
