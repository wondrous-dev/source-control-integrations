import { Milestone } from "../SourceControl-General/Milestone";
import { Project } from "../SourceControl-General/Project";
import { SourceType } from "../Common/SourceType";
import { Task } from "../SourceControl-General/Task";
import { APIWrapper } from "./APIWrapper";

/**
 * See response to "get milestone" for all available fields:
 * https://docs.github.com/en/rest/reference/issues#milestones
 */
export class Repository implements Project {
  id: string;

  title: string;

  orgName: string;

  tasks: { [key: string]: Task };

  milestones: { [key: string]: Milestone };

  sourceType: SourceType;

  constructor(id: string, title: string, orgName: string) {
    this.id = id;
    this.title = title;
    this.orgName = orgName;
    this.sourceType = SourceType.GitHub;
    this.tasks = {};
    this.milestones = {};
  }

  /**
   * addTask - helper to append Task to Repository's internal collection of Tasks
   *
   * @param  {type} task: Task
   */
  addTask(task: Task) {
    if (task.id in this.tasks) {
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
    if (milestone.id in this.milestones) {
      throw Error("Unexpected duplicate milestone");
    } else {
      this.milestones[milestone.id] = milestone;
    }
  }

  /**
   * Synchronize this Repository's internal state with GitHub, i.e. the Source
   * of Truth.
   */
  async synchronize(): Promise<boolean> {
    try {
      const newRepoState = await APIWrapper.GetRepositoryById(
        this.orgName,
        this.id
      );

      // TODO: detect org movement. If this happens, we need to drop it from the
      // "owning" org
      this.orgName = newRepoState.orgName;
      this.title = newRepoState.title;
      this.tasks = newRepoState.tasks;
      this.milestones = newRepoState.milestones;

      return true;
    } catch (ex) {
      // TODO: log this exception. Silent failure is evil.
      // https://github.com/wondrous-dev/source-control-integrations/issues/9
      return false;
    }
  }
}
