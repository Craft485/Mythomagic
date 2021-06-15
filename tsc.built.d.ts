interface CardProps {
    name: string;
    description: string;
    imageURL: string;
    attack?: number;
    health?: number;
    defense?: number;
    isMajorOlympian?: boolean;
    isUndead?: boolean;
    isInPlay?: boolean;
    [key: string]: any;
}
declare class Card {
    name: string;
    description: string;
    imgURL: string;
    action: any;
    props: CardProps;
    constructor(props: CardProps);
}
declare const CHAOS: Card;
declare const ZEUS: Card;
declare const HERA: Card;
declare const HESTIA: Card;
declare const HADES: Card;
declare const POSEIDON: Card;
declare const cardList: Card[];
declare class Game {
    Players: Array<Player>;
    constructor();
    join(id: string): string | void;
    drawCard(playerID: string): Card | Error;
    endTurn(): void;
    isGameOver(): Object | Boolean;
}
declare function shuffle(array: Array<any>): void;
interface _DeckProps {
    deckMap: Map<string, Array<any>>;
}
declare class Deck {
    props: _DeckProps;
    cards: Array<any>;
    constructor(props: _DeckProps);
    draw(): Card;
}
declare const m: Map<any, any>;
declare const _tDeck: Deck;
declare const _tDeck1: Deck;
declare const _tDeck2: Deck;
interface _PlayerProps {
    deck: Deck;
    id: string | number;
    health: number;
    isTakingTurn?: boolean;
}
declare class Player {
    props: _PlayerProps;
    isTakingTurn: boolean;
    health: number;
    constructor(props: _PlayerProps);
}
