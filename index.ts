import { config } from "./package.json";

type Card = typeof config.cards extends (infer T)[] ? T : never;

type GameState = {
  deck: Card[];
  hand: Card[];
  discardPile: Card[];
  health: number;
  luck: number;
};

//////////////////////

const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const createGameState = (): GameState => ({
  deck: config.cards,
  hand: [],
  discardPile: [],
  health: 6,
  luck: 1,
});

const shuffleDeck = (state: GameState): GameState => {
  const { deck } = state;
  const newDeck = shuffle(deck);
  return {
    ...state,
    deck: newDeck,
  };
};

const drawTopCards = (state: GameState, amount: number): GameState => {
  const { deck, hand } = state;
  const newDeck = deck.slice(amount);
  const newHand = [...hand, ...deck.slice(0, amount)];
  return {
    ...state,
    deck: newDeck,
    hand: newHand,
  };
};

const drawSpecificCards = (state: GameState, cards: Card[]): GameState => {
  const { deck, hand } = state;
  const newDeck = deck.slice(cards.length);
  const newHand = [...hand, ...cards];
  return {
    ...state,
    deck: newDeck,
    hand: newHand,
  };
};

const discardCards = (state: GameState, cards?: Card[]): GameState => {
  const { hand, discardPile } = state;
  const newHand = cards ? hand.filter((c) => !cards.includes(c)) : [];
  const newDiscardPile = [...discardPile, ...(cards || hand)];
  return {
    ...state,
    hand: newHand,
    discardPile: newDiscardPile,
  };
};

const shuffleCardsFromDiscardPileIntoDeck = (
  state: GameState,
  cards?: Card[]
): GameState => {
  const { deck, discardPile } = state;
  const newDeck = shuffle([...deck, ...(cards || discardPile)]);
  const newDiscardPile = cards
    ? discardPile.filter((c) => !cards.includes(c))
    : [];
  return {
    ...state,
    deck: newDeck,
    discardPile: newDiscardPile,
  };
};

const shuffleCardsFromHandIntoDeck = (
  state: GameState,
  cards?: Card[]
): GameState => {
  const { deck, hand } = state;
  const newDeck = [...deck, ...(cards || hand)];
  const newHand = cards ? hand.filter((c) => !cards.includes(c)) : [];
  return {
    ...state,
    deck: newDeck,
    hand: newHand,
  };
};

const setLuck = (state: GameState, amount: number): GameState => ({
  ...state,
  luck: Math.min(Math.max(amount, 0), config.rules.gameSetUp.luckDieSides),
});

const setHealth = (state: GameState, amount: number): GameState => ({
  ...state,
  health: Math.min(Math.max(amount, 0), config.rules.gameSetUp.healthDieSides),
});

const drawOneCard = (state: GameState): GameState => drawTopCards(state, 1);

const drawTwoCards = (state: GameState): GameState => drawTopCards(state, 2);

const drawThreeCards = (state: GameState): GameState => drawTopCards(state, 3);

const drawSpecificCard = (state: GameState, card: Card): GameState =>
  drawSpecificCards(state, [card]);

const discardOneCard = (state: GameState, card: Card): GameState =>
  discardCards(state, [card]);

const discardTwoCards = (state: GameState, cards: [Card, Card]): GameState =>
  discardCards(state, cards);

const discardThreeCards = (
  state: GameState,
  cards: [Card, Card, Card]
): GameState => discardCards(state, cards);

const shuffleOneCardFromDiscardPileIntoDeck = (
  state: GameState,
  card: Card
): GameState => shuffleCardsFromDiscardPileIntoDeck(state, [card]);

const incrementLuck = (state: GameState, amount: number): GameState =>
  setLuck(state, state.luck + amount);

const decrementLuck = (state: GameState, amount: number): GameState =>
  incrementLuck(state, -amount);

const incrementHealth = (state: GameState, amount: number = 1): GameState =>
  setHealth(state, state.health + amount);

const decrementHealth = (state: GameState, amount: number = 1): GameState =>
  incrementHealth(state, -amount);

//////////////////////

const rollFate = (state: GameState): number =>
  Math.floor(Math.random() * config.rules.gameSetUp.fateDieSides);

//////////////////////
