import {Component as ComponentGUI} from 'vue';
import {UIEventsType} from '../../engine/events/ui/UIEventsType';
import {UIComponent} from '../../engine/ui/components/UIComponent';
import {Component} from './Component';

export abstract class InteractiveComponent extends Component {
    readonly eventType: UIEventsType;

    constructor(component: ComponentGUI, type: UIComponent) {
        super(component, type);
        this.eventType = this.getEventTypeFromComponent();
    }

    init(): void {
        this.registerEvents();
    }

    protected abstract getEventTypeFromComponent(): UIEventsType;

    protected abstract registerEvents(): void;
}
