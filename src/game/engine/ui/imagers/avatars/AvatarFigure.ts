import {Engine} from '../../../../Engine';
import {FigurePart} from './Avatar';
import {AvatarFigureComponent} from './AvatarFigureComponent';
import {AvatarFigureDataPart} from './AvatarFigureDataPart';
import {AvatarFigurePart} from './AvatarFigurePart';
import {AvatarStructure} from './structure/AvatarStructure';
import {PaletteColor} from './structure/figure/PaletteColor';

export class AvatarFigure {
    private parts: FigurePart[];

    private figureDataParts: Map<string, AvatarFigureDataPart>;

    private avatarStructure: AvatarStructure | null;

    constructor(figure: string) {
        this.avatarStructure =
            Engine.getInstance().userInterfaceManager?.avatarImager.Structure!;
        this.parts = this.getPartsFromFigure(figure);
        this.figureDataParts = new Map();

        this.loadFigureDataParts();
    }

    getAllComponents(): AvatarFigureComponent[] {
        const figureComponents: AvatarFigureComponent[] = [];

        for (let part of this.figureDataParts.values()) {
            for (let component of part.components) {
                figureComponents.push(component);
            }
        }

        return figureComponents;
    }

    getAllHidden(): string[] {
        const hiddens: string[] = [];

        for (let part of this.figureDataParts.values()) {
            hiddens.concat(part.hidden);
        }

        return hiddens;
    }


    getFigureDataParts(): Map<string, AvatarFigureDataPart> {
        return this.figureDataParts;
    }

    getPartColorIds(id: string): number[] {
        const part = this.getPartSetId(id);

        if (!part) return [];

        return part.colors;
    }

    getPartSetId(id: string): FigurePart | null {
        for (let part of this.parts) {
            if (part.id == id) {
                return part;
            }
        }

        return null;
    }

    getFigureDataPart(type: string): AvatarFigureDataPart | null {
        const AvatarFigureDataPart = this.figureDataParts.get(type);

        if (!AvatarFigureDataPart) return null;

        return AvatarFigureDataPart;
    }

    loadFigureDataParts() {
        for (let part of this.parts) {
            this.loadFigureDataPart(part);
        }
    }

    loadFigureDataPart(figurePart: FigurePart) {
        let figureDataPart: AvatarFigureDataPart = new AvatarFigureDataPart(
            this,
            figurePart.type
        );

        const setType = this.avatarStructure?.AvatarFigureData?.getSetByType(
            figurePart.type
        );

        if (!setType) return;

        const partsSets = setType?.partSets;

        const set = partsSets?.get(figurePart.id);

        if (set?.parts) {
            figureDataPart = new AvatarFigureDataPart(
                this,
                figurePart.type,
                set.parts
            );

            for (let part of set?.parts) {
                const colorId =
                    figurePart.colors[part.colorindex] ?? figurePart.colors[0];
                const palette = part.colorable
                    ? this.avatarStructure?.AvatarFigureData?.getPalette(
                          setType.paletteid.toString()
                      )
                    : null;

                if (!palette) continue;

                const paletteColor: PaletteColor | null = palette?.getColor(
                    colorId.toString()
                ) as PaletteColor;

                const color = paletteColor?.color ?? ''

                const figureComponent: AvatarFigureComponent =
                    new AvatarFigureComponent(part, color);


                figureDataPart.addComponent(figureComponent)

                if (set.hidden) {
                    for (let hiddenPart of set.hidden) {
                        figureDataPart.addHidden(hiddenPart);
                    }
                }
            }
        }

        this.figureDataParts.set(figurePart.type, figureDataPart);
    }

    loadAvatarFigure() {
        /*for (let figurePart of this.look) {
            let fdPart = this.getFigureDataPart(figurePart)

            if (!fdPart) continue

            for (let component of fdPart?.components) {
                figurePartsComponents.push(component)
            }

            for (let hiddenComponent of fdPart?.hidden) {
                hiddenComponents.push(hiddenComponent)
            }
        }*/
    }

    private getPartsFromFigure(figure: string) {
        const look: FigurePart[] = [];

        const figureParts = figure.split('.');

        figureParts.forEach(part => {
            const parameters = part.split('-');

            const type = parameters[0];
            const id = parameters[1];
            const primaryColor = parseInt(parameters[2]);
            const secondaryColor = parseInt(parameters[3]);

            const colors: number[] = [primaryColor];

            if (!isNaN(secondaryColor)) {
                colors.push(secondaryColor);
            }

            const figurePart = new AvatarFigurePart(this, type, id, colors);

            look.push(figurePart);
        });

        return look;
    }

    get look(): FigurePart[] {
        return this.parts;
    }

    set structure(avatarStructure: AvatarStructure) {
        this.avatarStructure = avatarStructure;
    }
}
