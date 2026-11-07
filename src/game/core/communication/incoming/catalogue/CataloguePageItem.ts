export interface CataloguePageItem {
    id: number;
    name: string;
    credits: 200;
    amount: number;
    icon: string;
    /** Decoration id for wallpaper/floor/landscape catalog entries. */
    extraData?: string | null;
}
