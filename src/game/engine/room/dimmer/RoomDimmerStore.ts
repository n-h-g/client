import {reactive} from 'vue';
import {Engine} from '../../../Engine';
import {UIComponent} from '../../ui/components/UIComponent';
import {IComponentShowableUI} from '../../../core/ui/IComponentShowableUI';
import {OutgoingPacket} from '../../../networking/packets/outgoing/OutgoingPacket';
import {ColorConverter} from '../../../utils/color/ColorConverter';
import {RoomLight} from '../visualization/RoomLight';

/** A preset of the room dimmer (the room has 3 of them). */
export interface RoomDimmerPreset {
    id: number;
    color: string;
    brightness: number;
    backgroundOnly: boolean;
}

/** The light of the room set by a dimmer (its data, see ItemLogicRoomDimmer). */
interface DimmerLight {
    /** The room of the dimmer: the light isn't used in another room. */
    roomId: number | undefined;
    itemId: string;
    /** 1 on, 0 off. */
    state: number;
    presetId: number;
    backgroundOnly: boolean;
    color: string;
    brightness: number;
}

/**
 * The room dimmer (moodlight) controller, as nitro-react's useFurnitureDimmerWidget:
 * - a double click on the dimmer asks the presets (RoomDimmerGetPresets): the server sends them only to a user
 *   with rights, then the dialog (RoomDimmerGUI) opens;
 * - the light of the room comes from the data of the dimmer (onDimmerState), for everyone in the room;
 * - while the dimmer is on, what is chosen in the dialog is previewed only by this user;
 * - "apply" saves the preset and lights the room for everyone, the on/off button switches the dimmer;
 * - closing the dialog the room goes back to the light of the dimmer.
 */
export class RoomDimmerStore {
    /** The colors of the dimmer, as Habbo/Nitro (DIMMER_HTML_COLORS). */
    static readonly COLORS = ['#74F5F5', '#0053F7', '#E759DE', '#EA4532', '#F2F851', '#82F349', '#000000'];
    /** The brightness range of the slider, as Nitro (MIN_BRIGHTNESS, MAX_BRIGHTNESS). */
    static readonly MIN_BRIGHTNESS = 76;
    static readonly MAX_BRIGHTNESS = 255;
    static readonly PRESET_COUNT = 3;

    private static instance: RoomDimmerStore;

    readonly state = reactive({
        /** The entity id of the dimmer the dialog is open for, null if closed. */
        itemId: null as string | null,
        /** The preset shown (0, 1, 2). */
        selected: 0,
        presets: RoomDimmerStore.defaultPresets(),
        /** True when the dimmer the dialog is open for is on. */
        enabled: false,
    });

    /** The light of the room from its dimmer, null if the room has none. */
    private light: DimmerLight | null = null;

    static getInstance(): RoomDimmerStore {
        if (!RoomDimmerStore.instance) RoomDimmerStore.instance = new RoomDimmerStore();

        return RoomDimmerStore.instance;
    }

    /** A double click on a dimmer: the presets are asked, the dialog opens when they arrive (onPresets). */
    open(itemId: string): void {
        Engine.getInstance().networkingManager?.packetManager?.applyOut(OutgoingPacket.RoomDimmerGetPresetsEvent, {id: itemId});
    }

    /** The presets of the dimmer (RoomDimmerPresets, only for a user with rights): the dialog opens. */
    onPresets(itemId: string, selectedId: number, presets: RoomDimmerPreset[]): void {
        this.state.itemId = itemId;
        this.state.presets = RoomDimmerStore.defaultPresets().map(preset => presets.find(p => p.id === preset.id) ?? preset);
        this.state.selected = Math.max(0, this.state.presets.findIndex(p => p.id === selectedId));
        this.state.enabled = this.light?.itemId === itemId && this.light.state === 1;

        Engine.getInstance()
            .userInterfaceManager?.componentsManager?.getComponent<IComponentShowableUI>(UIComponent.RoomDimmerUI)
            ?.show();

        this.preview();
    }

    /**
     * The data of a dimmer of the room changed (or the dimmer is loaded): the room gets its light
     * (Nitro: RoomObjectDimmerStateUpdateEvent, off = white and full brightness).
     */
    onDimmerState(itemId: string, state: number, presetId: number, effectId: number, color: string, brightness: number): void {
        const roomId = Engine.getInstance().roomService?.currentRoom?.id;
        this.light = {roomId, itemId, state, presetId, backgroundOnly: effectId === 2, color, brightness};

        if (this.state.itemId === itemId) this.state.enabled = state === 1;

        this.applyLight();
    }

    /** The dimmer left the room (picked up): the room goes back to its colors, the dialog closes. */
    onDimmerRemoved(itemId: string): void {
        if (this.state.itemId === itemId) this.close();

        if (this.light?.itemId !== itemId) return;

        this.light = null;
        RoomDimmerStore.roomLight()?.setColor(RoomLight.WHITE, 0xff, false);
    }

    /** The dialog was closed: the preview ends. */
    onClosed(): void {
        this.state.itemId = null;
        this.applyLight();
    }

    get preset(): RoomDimmerPreset {
        return this.state.presets[this.state.selected];
    }

    selectPreset(index: number): void {
        if (index < 0 || index >= RoomDimmerStore.PRESET_COUNT) return;

        this.state.selected = index;
        this.preview();
    }

    setColor(color: string): void {
        this.preset.color = color;
        this.preview();
    }

    setBrightness(brightness: number): void {
        this.preset.brightness = Math.min(RoomDimmerStore.MAX_BRIGHTNESS, Math.max(RoomDimmerStore.MIN_BRIGHTNESS, Math.round(brightness)));
        this.preview();
    }

    setBackgroundOnly(backgroundOnly: boolean): void {
        this.preset.backgroundOnly = backgroundOnly;
        this.preview();
    }

    /** "Apply to room": the preset is saved and lights the room for everyone (Nitro's RoomDimmerSavePresetsComposer). */
    apply(): void {
        if (!this.state.itemId) return;

        const preset = this.preset;

        Engine.getInstance().networkingManager?.packetManager?.applyOut(OutgoingPacket.RoomDimmerSavePresetEvent, {
            id: this.state.itemId,
            preset: preset.id,
            backgroundOnly: preset.backgroundOnly,
            color: preset.color,
            brightness: preset.brightness,
            apply: true,
        });
    }

    /** Switches the dimmer on or off (Nitro's RoomDimmerChangeStateComposer). */
    toggle(): void {
        if (!this.state.itemId) return;

        Engine.getInstance().networkingManager?.packetManager?.applyOut(OutgoingPacket.RoomDimmerToggleEvent, {id: this.state.itemId});
    }

    private close(): void {
        Engine.getInstance()
            .userInterfaceManager?.componentsManager?.getComponent<IComponentShowableUI>(UIComponent.RoomDimmerUI)
            ?.hide();

        this.state.itemId = null;
    }

    /** While the dimmer is on, the room shows the preset chosen in the dialog (only to this user, as Nitro). */
    private preview(): void {
        if (!this.state.itemId || !this.state.enabled) return;

        const preset = this.preset;
        RoomDimmerStore.roomLight()?.setColor(ColorConverter.fromHex(preset.color), preset.brightness, preset.backgroundOnly);
    }

    /** The room gets the light of its dimmer (the preview, if the dialog is open and the dimmer on). */
    private applyLight(): void {
        if (this.state.itemId && this.state.enabled) {
            this.preview();
            return;
        }

        const light = this.light;
        if (!light || light.roomId !== Engine.getInstance().roomService?.currentRoom?.id) return;

        if (light.state === 1) {
            RoomDimmerStore.roomLight()?.setColor(ColorConverter.fromHex(light.color), light.brightness, light.backgroundOnly);
        } else {
            RoomDimmerStore.roomLight()?.setColor(RoomLight.WHITE, 0xff, light.backgroundOnly);
        }
    }

    private static roomLight(): RoomLight | undefined {
        return Engine.getInstance().roomService?.currentRoom?.roomLayout?.visualization?.light;
    }

    private static defaultPresets(): RoomDimmerPreset[] {
        return Array.from({length: RoomDimmerStore.PRESET_COUNT}, (_, index) => ({
            id: index + 1,
            color: '#000000',
            brightness: RoomDimmerStore.MAX_BRIGHTNESS,
            backgroundOnly: false,
        }));
    }
}
