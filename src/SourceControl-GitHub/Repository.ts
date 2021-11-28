import { GUID } from "../Common/GUID";
import { Milestone } from "../SourceControl-General/Milestone";
import { Project } from "../SourceControl-General/Project";
import { SourceType } from "../Common/SourceType";
import { Task } from "../SourceControl-General/Task";

/**
 * See response to "get repo" for all available fields:
 * https://docs.github.com/en/rest/reference/repos#get-a-repository
 */
export class Repository implements Project {
  id: GUID;

  title: string;

  tasks: { [key: string]: Task };

  milestones: { [key: string]: Milestone };

  sourceType: SourceType;

  constructor(title: string) {
    this.title = title;
    this.sourceType = SourceType.GitHub;

    // will be an issue here since GUID is random
    // TODO: derive GUID from uniqueness as derived from GitHub
    this.id = new GUID();
    this.tasks = {};
    this.milestones = {};
  }

  addTask(task: Task) {
    // TODO: override or throw?
    if (task.id.toString() in this.tasks) {
      // throw?
    } else {
      this.tasks[task.id.toString()] = task;
    }
  }

  addMilestone(milestone: Milestone) {
    // TODO: override or throw?
    if (milestone.id.toString() in this.milestones) {
      // throw?
    } else {
      this.milestones[milestone.id.toString()] = milestone;
    }
  }

  // TODO: implement this for real
  sync(): boolean {
    return true;
  }
}
