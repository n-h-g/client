import {UIComponent} from '../../engine/ui/components/UIComponent';
import {InteractiveComponent} from './InteractiveComponent';
import {IComponentDeletableUI} from './IComponentDeletableUI';
import {Component} from 'vue';

export abstract class DeletableComponent
    extends InteractiveComponent
    implements IComponentDeletableUI
{
    constructor(component: Component, type: UIComponent) {
        super(component, type);
    }

    abstract delete(): void;
}
