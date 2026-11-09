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
import {RoomInfoUI} from './room/RoomInfoUI';
import {Repository} from '../../../core/Repository';
import { ChangeLookUI } from './guardrobe/ChangeLookUI';
import {FriendsUI} from './friends/FriendsUI';
import {MessengerUI} from './friends/MessengerUI';
import {FriendProfileUI} from './friends/FriendProfileUI';
import {RoomDimmerUI} from './room/RoomDimmerUI';

export class ComponentsManager {
    readonly rootComponent: HTMLElement;
	
    private gameComponents: Repository<UIComponent, IComponentUI>;

    constructor() {
        this.rootComponent = document.getElementById('gameContainer');
        this.gameComponents = new Repository();
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
        this.addComponent(UIComponent.ChangeLookUI, new ChangeLookUI)
        this.addComponent(UIComponent.RoomInfoUI, new RoomInfoUI());
        this.addComponent(UIComponent.FriendsMenuUI, new FriendsUI());
        this.addComponent(UIComponent.PrivateChatUI, new MessengerUI());
        this.addComponent(UIComponent.FriendProfileUI, new FriendProfileUI());
        this.addComponent(UIComponent.RoomDimmerUI, new RoomDimmerUI());
    }

    initGameComponents(): void {
        for (const component of this.gameComponents.getAll().values()) {
            component.init();
        }
    }

    private addComponent(
        componentKey: UIComponent,
        component: IComponentUI
    ): void {
        if (this.gameComponents.has(componentKey)) return;

        this.gameComponents.add(componentKey, component);
    }

    getComponents(): Repository<UIComponent, IComponentUI> {
        return this.gameComponents;
    }

    getComponent<T>(componentKey: UIComponent): T {
        return this.gameComponents.get(componentKey) as T;
    }
}
