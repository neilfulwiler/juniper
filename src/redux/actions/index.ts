import { Action as EventAction } from './events';
import { Action as TodoAction } from './todos';
import { Action as UserAction } from './user';

export type Action = EventAction | TodoAction | UserAction;
