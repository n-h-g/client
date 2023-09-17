import {IComponentUI} from '../../../core/ui/IComponentUI';
import {UIComponent} from './UIComponent';
import {BottomBarUI} from './static/BottomBarUI';
import {GameLoaderUI} from './loader/GameLoaderUI';
import {TopBarUI} from './static/TopBarUI';
import {NavigatorUI} from './navigator/NavigatorUI';
import {InventoryUI} from './inventory/InventoryUI';
import {PreviewBoxUI} from './general/PreviewBoxUI';
import {CreateRoomUI} from './navigator/CreateRoomUI';
import {CatalogueUI} from './catalogue/CatalogueUI';
import {StaticContainerUI} from './static/StaticContainerUI';
import {RoomUI} from './room/RoomUI';
import {AvatarContainerUI} from './avatar/AvatarContainerUI';
import {RoomInfoUI} from './room/RoomInfoUI';
import {Repository} from '../../../core/Repository';

export class ComponentsManager {
    private _rootComponent: HTMLElement;
    private _gameComponents: Repository<UIComponent, IComponentUI>;

    constructor() {
        this._rootComponent = document.getElementById('gameContainer');
        this._gameComponents = new Repository();
    }

    loadGameComponents(): void {
        this.addComponent(UIComponent.GameLoaderUI, new GameLoaderUI());
        this.addComponent(UIComponent.BottomBarUI, new BottomBarUI());
        this.addComponent(
            UIComponent.StaticContainerUI,
            new StaticContainerUI()
        );
        this.addComponent(UIComponent.TopBarUI, new TopBarUI());
        this.addComponent(UIComponent.NavigatorUI, new NavigatorUI());
        this.addComponent(UIComponent.InventoryUI, new InventoryUI());
        this.addComponent(UIComponent.PreviewBoxUI, new PreviewBoxUI());
        this.addComponent(UIComponent.CreateRoomUI, new CreateRoomUI());
        this.addComponent(UIComponent.CatalogueUI, new CatalogueUI());
        this.addComponent(UIComponent.RoomUI, new RoomUI());
        this.addComponent(
            UIComponent.AvatarContainerUI,
            new AvatarContainerUI()
        );
        this.addComponent(UIComponent.RoomInfoUI, new RoomInfoUI());
    }

    initGameComponents(): void {
        for (const component of this._gameComponents.getAll().values()) {
            component.init();
        }
    }

    get rootComponent(): HTMLElement {
        return this._rootComponent;
    }

    private addComponent(
        componentKey: UIComponent,
        component: IComponentUI
    ): void {
        if (this._gameComponents.has(componentKey)) return;

        this._gameComponents.add(componentKey, component);
    }

    getComponents(): Repository<UIComponent, IComponentUI> {
        return this._gameComponents;
    }

    getComponent<T>(componentKey: UIComponent): T {
        return this._gameComponents.get(componentKey) as T;
    }
}
