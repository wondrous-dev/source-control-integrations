import { SourceType } from "../../src/Common/SourceType";
import { Milestone } from "../../src/SourceControl-General/Milestone";
import { Project } from "../../src/SourceControl-General/Project";
import { Task } from "../../src/SourceControl-General/Task";

export class MockProject implements Project {
  id: string;
  title: string;
  tasks: { [key: string]: Task };
  milestones: { [key: string]: Milestone };
  sourceType: SourceType;

  constructor(
    id: string,
    title: string,
    tasks: { [key: string]: Task },
    milestones: { [key: string]: Milestone },
    sourceType: SourceType
  ) {
    this.id = id;
    this.title = title;
    this.tasks = tasks;
    this.milestones = milestones;
    this.sourceType = sourceType;
  }

  async synchronize(): Promise<boolean> {
    return true;
  }
}
