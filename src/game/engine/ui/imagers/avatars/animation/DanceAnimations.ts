import danceOne from './dances/Dance1.json';
import danceTwo from './dances/Dance2.json';
import danceThree from './dances/Dance3.json';
import danceFour from './dances/Dance4.json';
import {BodyPartLayer, BodyPartLayers} from './BodyPartLayers';

type DanceFrame = {bodyparts: BodyPartLayer[]};

const styles: DanceFrame[][] = [danceOne, danceTwo, danceThree, danceFour].map(
    data => Object.values(data.animations)[0].frames as DanceFrame[]
);

function getStyle(style: number): DanceFrame[] {
    return styles[Math.max(0, Math.min(styles.length - 1, style - 1))];
}

export function getDanceBodyPart(style: number, frame: number, type: string): BodyPartLayer | null {
    const dance = getStyle(style);
    if (!dance?.length) return null;

    return BodyPartLayers.find(dance[frame % dance.length]?.bodyparts, type);
}

export function getDanceFrameCount(style: number): number {
    return getStyle(style)?.length ?? 1;
}
