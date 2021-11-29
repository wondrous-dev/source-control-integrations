import { GUID } from "../Common/GUID";
import { Milestone } from "../SourceControl-General/Milestone";
import { Project } from "../SourceControl-General/Project";
import { SourceType } from "../Common/SourceType";
import { Task } from "../SourceControl-General/Task";
import { APIWrapper } from "./APIWrapper";
/**
 * See response to "get repo" for all available fields:
 * https://docs.github.com/en/rest/reference/repos#get-a-repository
 */
export class Repository implements Project {
  id: GUID;

  title: string;

  orgName: string;

  tasks: { [key: string]: Task };

  milestones: { [key: string]: Milestone };

  sourceType: SourceType;

  constructor(title: string, orgName: string) {
    this.title = title;
    this.orgName = orgName;
    this.sourceType = SourceType.GitHub;

    // will be an issue here since GUID is random
    // TODO: derive GUID from uniqueness as derived from GitHub
    this.id = new GUID();
    this.tasks = {};
    this.milestones = {};
  }

  /**
   * addTask - helper to append Task to Repository's internal collection of Tasks
   *
   * @param  {type} task: Task
   */
  addTask(task: Task) {
    if (task.id.toString() in this.tasks) {
      throw Error("Unexpected duplicate task");
    } else {
      this.tasks[task.id.toString()] = task;
    }
  }

  /**
   * addMilestone - helper to append Milestone to Repository's internal collection
   * of Milestones
   *
   * @param  {type} task: Task
   */
  addMilestone(milestone: Milestone) {
    if (milestone.id.toString() in this.milestones) {
      throw Error("Unexpected duplicate milestone");
    } else {
      this.milestones[milestone.id.toString()] = milestone;
    }
  }

  /**
   * Synchronize this Repository's internal state with GitHub, i.e. the Source
   * of Truth
   */
  async synchronize(): Promise<boolean> {
    try {
      const newRepoState = await APIWrapper.GetRepository(
        this.orgName,
        this.title
      );

      // since orgName and title are part of the repo's identification, we obviously
      // do not update those. In fact, if those come back different, we have a
      // problem.
      if (
        this.title != newRepoState.title ||
        this.orgName != newRepoState.orgName
      ) {
        throw Error(
          "Repository's orgname and/or title unexpectedly came back different when attempting to synchronize."
        );
      }

      this.tasks = newRepoState.tasks;
      this.milestones = newRepoState.milestones;

      return true;
    } catch (ex) {
      // TODO: log this exception. Silent failure is evil.
      return false;
    }
  }
}
