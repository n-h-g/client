/**
 * The pet libraries by type id (Nitro's configuration pet.types): the type of a pet (0 dog, 1 cat...) is the index of
 * its library in pet/<name>/<name>.json. The last ones have no library in the assets (e.g. LeetPen).
 */
export const PET_LIBRARIES: readonly string[] = [
    'dog', 'cat', 'croco', 'terrier', 'bear', 'pig', 'lion', 'rhino', 'spider', 'turtle', 'chicken', 'frog', 'dragon',
    'monster', 'monkey', 'horse', 'monsterplant', 'bunnyeaster', 'bunnyevil', 'bunnydepressed', 'bunnylove',
    'pigeongood', 'pigeonevil', 'demonmonkey', 'bearbaby', 'terrierbaby', 'gnome', 'gnome', 'kittenbaby', 'puppybaby',
    'pigletbaby', 'haloompa', 'fools', 'pterosaur', 'velociraptor', 'cow', 'LeetPen', 'bbwibb', 'elephants',
];

/** The name of the library of a pet type, null if the type has none. */
export function petLibraryName(typeId: number): string | null {
    return PET_LIBRARIES[typeId] ?? null;
}

/** The names of the pet types (as PET_LIBRARIES), for the UI. */
const PET_TYPE_NAMES: readonly string[] = ['Cane', 'Gatto', 'Coccodrillo', 'Terrier', 'Orso', 'Maiale', 'Leone', 'Rinoceronte', 'Ragno',
    'Tartaruga', 'Pulcino', 'Rana', 'Drago', 'Mostro', 'Scimmia', 'Cavallo', 'Pianta mostro', 'Coniglio',
    'Coniglio malvagio', 'Coniglio depresso', 'Coniglio innamorato', 'Piccione buono', 'Piccione malvagio',
    'Scimmia demoniaca', 'Orsetto', 'Terrier cucciolo', 'Gnomo', 'Folletto', 'Gattino', 'Cucciolo', 'Maialino',
    'Haloompa', 'Pesce d\'aprile', 'Pterodattilo', 'Velociraptor', 'Mucca'];

export function petTypeName(type: number): string {
    return PET_TYPE_NAMES[type] ?? `Animale ${type}`;
}

/** The type of a pet offer of the catalogue ("a0 pet<type>", as Arcturus), null if it isn't a pet. */
export function petOfferType(offerName: string | null | undefined): number | null {
    const match = /^a0 pet(\d+)$/.exec(offerName ?? '');
    return match ? Number(match[1]) : null;
}

/** The postures of the pets (the keys of "postures" in the libraries, e.g. dog). Each library has its own ones. */
export const PetPosture = {
    STAND: 'std',
    MOVE: 'mv',
    SIT: 'sit',
    LAY: 'lay',
    DEAD: 'ded',
    EAT: 'eat',
    JUMP: 'jmp',
    BEG: 'beg',
    PLAY: 'pla',
    SPEAK: 'spk',
} as const;

/** The gestures (the expressions on the head) of the pets, e.g. dog: smile, sad, joy... */
export const PetGesture = {
    SMILE: 'sml',
    SAD: 'sad',
    JOY: 'joy',
    SURPRISED: 'srp',
    PUZZLED: 'puz',
    ANGRY: 'agr',
    CRAZY: 'crz',
    TONGUE: 'tng',
    MISCHIEVOUS: 'mis',
} as const;
