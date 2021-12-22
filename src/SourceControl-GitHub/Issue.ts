import { Status } from "../SourceControl-General/Status"
import { Task } from "../SourceControl-General/Task"
import { TaskType } from "../SourceControl-General/TaskType"

/**
 * See response to "get repo issues" for all available fields:
 * https://docs.github.com/en/rest/reference/issues#list-repository-issues
 */
export class Issue implements Task {
	id: string

	title: string

	status: Status

	taskType: TaskType

	constructor (id: string, title: string, stateString: string) {
		this.id = id
		this.title = title
		this.status = stateString === "open" ? Status.Todo : Status.Completed
		this.taskType = TaskType.Issue
	}

	// https://github.com/wondrous-dev/source-control-integrations/issues/8
	updateStatus (newStatus: Status): boolean {
		throw Error("Not implemented. When implemented, update to " + newStatus)
	}
}
