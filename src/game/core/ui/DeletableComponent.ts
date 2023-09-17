import {UIComponent} from '../../engine/ui/components/UIComponent';
import {InteractiveComponent} from './InteractiveComponent';
import {IComponentDeletableUI} from './IComponentDeletableUI';
import {Component} from 'vue';

export abstract class DeletableComponent
    extends InteractiveComponent
    implements IComponentDeletableUI
{
    public constructor(component: Component, type: UIComponent) {
        super(component, type);
    }

    public abstract delete(): void;
}
