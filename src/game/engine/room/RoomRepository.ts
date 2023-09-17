import {Repository} from '../../core/Repository';
import {Room} from './Room';

export class RoomRepository extends Repository<number, Room> {
    tick(delta: number): void {}
}
