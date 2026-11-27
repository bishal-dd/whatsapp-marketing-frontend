export interface Group {
  id: string;
  name: string;
  createdAt: string;
  /** Everyone in the group. */
  count: number;
  /** Of those, how many can get messages (agreed and not unsubscribed). */
  reachable: number;
}

/** What the contact list shows: everyone, people in no group, or one group (its id). */
export type GroupFilter = "all" | "none" | (string & {});
