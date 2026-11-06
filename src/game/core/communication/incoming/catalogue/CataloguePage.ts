export interface CataloguePage {
    description: string;
    id: number;
    sequence: number;
    title: string;
    /** Parent page in the catalogue tree, -1 for a root page. */
    parentId: number;
    iconImage: number;
    /** Furni whose icon is the page icon. */
    iconName: string;
}
