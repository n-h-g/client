import {Message} from './Message';
import {IRepository} from '../../IRepository';

export type IChatMessageRepository = IRepository<string, Message>;
