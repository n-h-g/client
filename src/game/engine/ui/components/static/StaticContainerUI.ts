import Component from "../../../../core/ui/Component";

import StaticContainerGUI from '../../../../../ui/components/static/StaticContainerGUI.vue'
import { UIComponent } from "../UIComponent";
import UiUtils from "../../../../utils/UiUtils";

export default class StaticContainerUI extends Component{

    public constructor() {
        super(StaticContainerGUI, UIComponent.StaticContainerUI)
    }

    public init(): void {
        UiUtils.mountComponent(this.component, UIComponent.StaticContainerUI)
    }
}