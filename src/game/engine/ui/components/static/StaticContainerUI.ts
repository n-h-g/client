import {Component} from '../../../../core/ui/Component';
import StaticContainerGUI from '../../../../../ui/components/static/StaticContainerGUI.vue';
import {UIComponent} from '../UIComponent';
import {UiUtils} from '../../../../utils/UiUtils';

export class StaticContainerUI extends Component {
    constructor() {
        super(StaticContainerGUI, UIComponent.StaticContainerUI);
    }

    init(): void {
        UiUtils.mountComponent(this.component, UIComponent.StaticContainerUI);
    }
}
