import { Milestone } from '../SourceControl-General/Milestone'
import { Project } from '../SourceControl-General/Project'
import { SourceType } from '../Common/SourceType'
import { Task } from '../SourceControl-General/Task'
import { APIWrapper } from './APIWrapper'

/**
 * See response to "get milestone" for all available fields:
 * https://docs.github.com/en/rest/reference/issues#milestones
 */
export class Repository implements Project {
	id: string

	title: string

	orgName: string

	tasks: { [key: string]: Task }

	milestones: { [key: string]: Milestone }

	sourceType: SourceType

	constructor (id: string, title: string, orgName: string) {
		this.id = id
		this.title = title
		this.orgName = orgName
		this.sourceType = SourceType.GitHub
		this.tasks = {}
		this.milestones = {}
	}

	/**
	 * getTasks - helper to get all the tasks in a repo
	 */
	getTasks () {
		return Object.values(this.tasks)
	}

	/**
	 * getTasks - helper to get all the tasks in a repo
	 */
	getMilestones () {
		return Object.values(this.milestones)
	}

	/**
	 * addTask - helper to append Task to Repository's internal collection of Tasks
	 *
	 * @param  {type} task: Task
	 */
	addTask (task: Task) {
		if (task.id in this.tasks) {
			throw Error('Unexpected duplicate task')
		} else {
			this.tasks[task.id.toString()] = task
		}
	}

	/**
	 * addMilestone - helper to append Milestone to Repository's internal collection
	 * of Milestones
	 *
	 * @param  {type} task: Task
	 */
	addMilestone (milestone: Milestone) {
		if (milestone.id in this.milestones) {
			throw Error('Unexpected duplicate milestone')
		} else {
			this.milestones[milestone.id] = milestone
		}
	}

	/**
	 * Synchronize this Repository's internal state with GitHub, i.e. the Source
	 * of Truth.
	 *
	 *  @return {type}            boolean value here denotes successful, i.e. is
	 *                            still part of this org and still exists. Throws
	 *                            in exceptional circumstance.
	 */
	async synchronize (): Promise<boolean> {
		try {
			const apiWrapper = new APIWrapper()
			const newRepoState = await apiWrapper.getRepositoryById(
				this.orgName,
				this.id
			)

			// repo moved orgs
			if (this.orgName !== newRepoState.orgName) {
				return false
			}

			this.title = newRepoState.title
			this.tasks = newRepoState.tasks
			this.milestones = newRepoState.milestones

			return true
		} catch (e) {
			// TODO: proper logging
			// https://github.com/wondrous-dev/source-control-integrations/issues/9

			// not found, thus bad id
			if (e.status == 404) {
				return false
			}

			throw e
		}
	}
}
