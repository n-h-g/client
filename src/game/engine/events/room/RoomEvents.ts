import {Events} from '../Events';

export class RoomEvents extends Events {
	private constructor(key: string) {
		super(key);
	}

	LOAD: RoomEvents = new RoomEvents('room_loaded');
}
