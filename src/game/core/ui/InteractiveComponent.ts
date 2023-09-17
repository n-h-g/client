import {Component as ComponentGUI} from 'vue';
import {UIEventsType} from '../../engine/events/ui/UIEventsType';
import {UIComponent} from '../../engine/ui/components/UIComponent';
import {Component} from './Component';

export abstract class InteractiveComponent extends Component {
    private _eventType: UIEventsType;

    constructor(component: ComponentGUI, type: UIComponent) {
        super(component, type);
        this._eventType = this.getEventTypeFromComponent();
    }

    init(): void {
        this.registerEvents();
    }

    get eventType(): UIEventsType {
        return this._eventType;
    }

    protected abstract getEventTypeFromComponent(): UIEventsType;

    protected abstract registerEvents(): void;
}
