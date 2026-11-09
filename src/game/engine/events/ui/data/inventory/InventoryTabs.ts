/** A badge of the user: worn in the slot 1 to 5, 0 in the inventory. */
export type InventoryBadge = {
    code: string;
    slot: number;
};

/** A bot in the inventory of the user. */
export type InventoryBot = {
    id: number;
    name: string;
    look: string;
    gender: string;
};

/** A pet of the user (type as the Nitro pet libraries: 0 dog, 1 cat...). */
export type InventoryPet = {
    id: number;
    name: string;
    type: number;
    race: number;
    color: string;
};

export type InventoryBadgesData = { badges: InventoryBadge[] };
export type InventoryBotsData = { bots: InventoryBot[] };
export type InventoryPetsData = { pets: InventoryPet[] };
