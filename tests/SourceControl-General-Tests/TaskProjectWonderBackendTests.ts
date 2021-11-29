import { SourceType } from "../../src/Common/SourceType";
import { Status } from "../../src/SourceControl-General/Status";
import { MockMilestone } from "./MockMilestone";
import { MockProject } from "./MockProject";
import { MockTask } from "./MockTask";
import { MockWonderBackend } from "./MockWonderBackend";
import { MilestonesAreEqual } from "../../src/SourceControl-General/Milestone";
import { ProjectsAreEqual } from "../../src/SourceControl-General/Project";
import { TasksAreEqual } from "../../src/SourceControl-General/Task";
import { SyncProjectWithWonder } from "../../src/SourceControl-General/WonderBackend";
import { expect } from "chai";

const TaskA = new MockTask("1", "foo", Status.InProgress);
const TaskB = new MockTask("2", "foo", Status.InProgress);
const TaskC = new MockTask("3", "foo", Status.Todo);
const TaskD = new MockTask("4", "bar", Status.InProgress);

const today: Date = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const MilestoneA = new MockMilestone(
  "5",
  "fooMilestone",
  "",
  tomorrow,
  today,
  Status.InProgress,
  { foo: TaskA, bar: TaskD },
  null
);
const MilestoneB = new MockMilestone(
  "6",
  "fooMilestone",
  "",
  tomorrow,
  today,
  Status.InProgress,
  { foo: TaskA, bar: TaskD },
  null
);
const MilestoneC = new MockMilestone(
  "7",
  "fooMilestone",
  "",
  tomorrow,
  today,
  Status.InProgress,
  { foo: TaskA, bar: TaskD },
  tomorrow
);
const MilestoneD = new MockMilestone(
  "8",
  "fooMilestone",
  "",
  tomorrow,
  today,
  Status.InProgress,
  { foo: TaskA },
  null
);
const MilestoneE = new MockMilestone(
  "9",
  "fooMilestone",
  "",
  tomorrow,
  today,
  Status.InProgress,
  { foo: TaskC, bar: TaskD },
  null
);

const ProjectA = new MockProject(
  "10",
  "fooProject",
  { foo: TaskA, bar: TaskD },
  { foo: MilestoneA },
  SourceType.GitHub
);
const ProjectB = new MockProject(
  "11",
  "fooProject",
  { foo: TaskA, bar: TaskD },
  { foo: MilestoneA },
  SourceType.GitHub
);
const ProjectC = new MockProject(
  "12",
  "fooProject",
  { foo: TaskA },
  { foo: MilestoneA },
  SourceType.GitHub
);
const ProjectD = new MockProject(
  "13",
  "fooProject",
  { foo: TaskC, bar: TaskD },
  { foo: MilestoneA },
  SourceType.GitHub
);
const ProjectE = new MockProject(
  "14",
  "barProject",
  { foo: TaskA, bar: TaskD },
  { foo: MilestoneA },
  SourceType.GitHub
);
const ProjectF = new MockProject(
  "15",
  "barProject",
  { foo: TaskA, bar: TaskD },
  { foo: MilestoneA, bar: MilestoneC },
  SourceType.GitHub
);
const ProjectG = new MockProject(
  "16",
  "barProject",
  { foo: TaskA, bar: TaskD },
  { foo: MilestoneE },
  SourceType.GitHub
);

const WonderBackendA = new MockWonderBackend({
  fooProject: ProjectC,
  barProject: ProjectE,
});

describe("Tasks Equality", () => {
  it("equal", () => {
    expect(TasksAreEqual(TaskA, TaskA)).to.equal(true);
  });

  it("differ by id", () => {
    expect(TasksAreEqual(TaskA, TaskB)).to.equal(false);
  });

  it("differ by title", () => {
    expect(TasksAreEqual(TaskA, TaskD)).to.equal(false);
  });

  it("differ by label", () => {
    expect(TasksAreEqual(TaskB, TaskC)).to.equal(false);
  });
});

describe("Milestone Equality", () => {
  it("equal", () => {
    expect(MilestonesAreEqual(MilestoneA, MilestoneA)).to.equal(true);
  });

  it("differ by id", () => {
    expect(MilestonesAreEqual(MilestoneA, MilestoneB)).to.equal(false);
  });

  it("differ by completionDate", () => {
    expect(MilestonesAreEqual(MilestoneA, MilestoneC)).to.equal(false);
  });

  it("differ by tasks length", () => {
    expect(MilestonesAreEqual(MilestoneA, MilestoneD)).to.equal(false);
  });

  it("differ by task inequality", () => {
    expect(MilestonesAreEqual(MilestoneA, MilestoneE)).to.equal(false);
  });
});

describe("Project Equality", () => {
  it("equal", () => {
    expect(ProjectsAreEqual(ProjectA, ProjectA)).to.equal(true);
  });

  it("differ by id", () => {
    expect(ProjectsAreEqual(ProjectA, ProjectB)).to.equal(false);
  });

  it("differ by title", () => {
    expect(ProjectsAreEqual(ProjectA, ProjectE)).to.equal(false);
  });

  it("differ by tasks length", () => {
    expect(ProjectsAreEqual(ProjectA, ProjectC)).to.equal(false);
  });

  it("differ by task inequality", () => {
    expect(ProjectsAreEqual(ProjectA, ProjectD)).to.equal(false);
  });

  it("differ by milestones length", () => {
    expect(ProjectsAreEqual(ProjectA, ProjectF)).to.equal(false);
  });

  it("differ by milestones inequality", () => {
    expect(ProjectsAreEqual(ProjectA, ProjectG)).to.equal(false);
  });
});

describe("SyncProjectWithWonder functions properly", () => {
  it("happy path - no sync needed", async () => {
    expect(await SyncProjectWithWonder(ProjectC, WonderBackendA)).to.equal(
      true
    );
  });

  it("happy path - sync for one project, project not found", async () => {
    expect(await SyncProjectWithWonder(ProjectD, WonderBackendA)).to.equal(
      true
    );
  });

  it("happy path - sync for one project, different set of tasks", async () => {
    expect(await SyncProjectWithWonder(ProjectA, WonderBackendA)).to.equal(
      true
    );
  });
});
