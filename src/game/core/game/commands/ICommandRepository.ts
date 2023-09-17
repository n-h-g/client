import {IRepository} from '../../IRepository';
import {ICommand} from './ICommand';

export type ICommandRepository = IRepository<string, ICommand>;
