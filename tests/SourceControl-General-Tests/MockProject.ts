import { GUID } from "../../src/Common/GUID";
import { SourceType } from "../../src/Common/SourceType";
import { Milestone } from "../../src/SourceControl-General/Milestone";
import { Project } from "../../src/SourceControl-General/Project";
import { Task } from "../../src/SourceControl-General/Task";

export class MockProject implements Project {
  id: GUID;
  title: string;
  tasks: { [key: string]: Task };
  milestones: { [key: string]: Milestone };
  sourceType: SourceType;

  constructor(
    title: string,
    tasks: { [key: string]: Task },
    milestones: { [key: string]: Milestone },
    sourceType: SourceType
  ) {
    this.id = new GUID();
    this.title = title;
    this.tasks = tasks;
    this.milestones = milestones;
    this.sourceType = sourceType;
  }

  sync(): boolean {
    return true;
  }
}
