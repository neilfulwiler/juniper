import { Action as EventAction } from './events';
import { Action as TodoAction } from './todos';
import { Action as UserAction } from './user';
import { Action as NavAction } from './nav';

export type Action = EventAction | TodoAction | UserAction | NavAction;
