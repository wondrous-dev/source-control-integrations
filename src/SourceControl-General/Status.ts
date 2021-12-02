/**
 * Status represents the typical task status cycle.
 */
export enum Status {
  Todo,
  InProgress,
  InReview,
  Completed,
}

export function StringToStatus(status: string): Status {
  switch (status.toLowerCase().trim()) {
    case "open":
      return Status.Todo;
  }
}
