import { shuffle } from "lodash";
import prompts from "prompts";

class NotImplementedError extends Error {
  constructor() {
    super("Not implemented");
    this.name = "NotImplementedError";
  }
}

type Health = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type Luck = 1 | 2 | 3 | 4 | 5 | 6;

type Fate = 1 | 2 | 3 | 4 | 5 | 6;

type Card = {
  title: string;
  flavorText: string;
  sensoryDescription: string;
  instructions: string;
  onPlay: (state: State) => Promise<State>;
};

type State = {
  cards: {
    deck: Card[];
    discardPile: Card[];
    hand: Card[];
    play: Card[];
  };
  health: Health;
  luck: Luck;
};

export const play = async (): Promise<State> => {
  console.log("Starting a new game...");

  let state = initialState;

  state = await shuffleDeck(state);

  for (let i = 0; i < 5; i++) {
    state = await drawCard(state);
  }

  return takeTurn(state);
};

const takeTurn = async (state: State): Promise<State> => {
  console.log("Starting your turn...");

  console.log(`You have ${state.health} health and ${state.luck} luck.`);

  console.log(`You have ${state.cards.deck.length} cards left in your deck.`);

  console.log(
    `You have ${state.cards.discardPile.length} cards in your discard pile.`
  );

  console.log(`You have ${state.cards.hand.length} cards in your hand.`);

  state = await drawCard(state);

  const cardToPlay = await selectCardToPlayFromHand(state);

  state = await playCard(state, cardToPlay);

  return takeTurn(state);
};

const playCard = async (state: State, card: Card): Promise<State> => {
  console.log(`Playing ${card.title}...`);

  const index = state.cards.hand.indexOf(card);

  state.cards.hand.splice(index, 1);

  state.cards.play.push(card);

  console.log(
    [
      card.title,
      card.sensoryDescription,
      card.flavorText,
      card.instructions,
    ].join("\n\n")
  );

  state = await card.onPlay(state);

  state.cards.play.pop();

  state.cards.discardPile.push(card);

  return state;
};

const drawCard = async (state: State): Promise<State> => {
  const card = state.cards.deck.shift();

  console.log(`Drawing ${card.title}...`);

  state.cards.hand.push(card);

  console.log(`You have ${state.cards.hand.length} cards in your hand.`);

  return state;
};

const discardCard = async (state: State, card: Card): Promise<State> => {
  console.log(`Discarding ${card.title}...`);

  const index = state.cards.hand.indexOf(card);

  state.cards.hand.splice(index, 1);

  state.cards.discardPile.push(card);

  return state;
};

const discardHand = async (state: State): Promise<State> => {
  console.log("Discarding your hand...");

  state.cards.hand.forEach((card) => {
    state.cards.discardPile.push(card);
  });

  state.cards.hand = [];

  return state;
};

const selectCardToDiscardFromHand = async (state: State): Promise<Card> => {
  return selectCardFromHand(state, "to discard");
};

const selectCardToPutBackOnTopOfDeckFromHand = async (
  state: State
): Promise<Card> => {
  return selectCardFromHand(state, "to put back on top of the deck");
};

const selectCardToPlayFromHand = async (state: State): Promise<Card> => {
  return selectCardFromHand(state, "to play");
};

const selectCardToShuffleIntoDeckFromHand = async (
  state: State
): Promise<Card> => {
  return selectCardFromHand(state, "to shuffle into the deck");
};

const selectCardFromHand = async (
  state: State,
  purpose: string
): Promise<Card> => {
  const { card } = await prompts({
    type: "select",
    name: "card",
    message: `Select a card ${purpose} from your hand`,
    choices: state.cards.hand.map((card) => ({
      title: card.title,
      description: [card.instructions, card.flavorText].join("\n\n"),
      value: card,
    })),
  });

  return card;
};

const selectCardToShuffleIntoDeckFromDiscardPile = async (
  state: State
): Promise<Card> => {
  return selectCardFromDiscardPile(state, "to shuffle into the deck");
};

const selectCardFromDiscardPile = async (
  state: State,
  purpose: string
): Promise<Card> => {
  const { card } = await prompts({
    type: "select",
    name: "card",
    message: `Select a card ${purpose} from the discard pile`,
    choices: state.cards.discardPile.map((card) => ({
      title: card.title,
      description: [card.instructions, card.flavorText].join("\n\n"),
      value: card,
    })),
  });

  return card;
};

const selectCardFromDeck = async (state: State): Promise<Card> => {
  const { card } = await prompts({
    type: "select",
    name: "card",
    message: "Select a card from the deck",
    choices: state.cards.deck.map((card) => ({
      title: card.title,
      description: [card.instructions, card.flavorText].join("\n\n"),
      value: card,
    })),
  });

  return card;
};

const shuffleDeck = async (state: State): Promise<State> => {
  return {
    ...state,
    cards: {
      ...state.cards,
      deck: shuffle(state.cards.deck),
    },
  };
};

const putCardFromHandOnTopOfDeck = async (
  state: State,
  card: Card
): Promise<State> => {
  console.log("Putting your card from your hand on top of the deck...");

  const cardIndex = state.cards.hand.indexOf(card);

  state.cards.hand.splice(cardIndex, 1);

  state.cards.deck.unshift(card);

  return state;
};

const shuffleCardFromHandIntoDeck = async (
  state: State,
  card: Card
): Promise<State> => {
  console.log("Shuffling your card from your hand into the deck...");

  const cardIndex = state.cards.hand.indexOf(card);

  state.cards.hand.splice(cardIndex, 1);

  state.cards.deck.push(card);

  return shuffleDeck(state);
};

const shuffleCardFromDiscardPileIntoDeck = async (
  state: State,
  card: Card
): Promise<State> => {
  console.log("Shuffling your card from the discard pile into the deck...");

  const cardIndex = state.cards.discardPile.indexOf(card);

  state.cards.discardPile.splice(cardIndex, 1);

  state.cards.deck.push(card);

  return shuffleDeck(state);
};

const shuffleHandIntoDeck = async (state: State): Promise<State> => {
  console.log("Shuffling your hand into the deck...");

  state.cards.hand.forEach((card) => {
    state.cards.deck.push(card);
  });

  state.cards.hand = [];

  return shuffleDeck(state);
};

const shuffleDiscardPileIntoDeck = async (state: State): Promise<State> => {
  console.log("Shuffling the discard pile into the deck...");

  state.cards.discardPile.forEach((card) => {
    state.cards.deck.push(card);
  });

  state.cards.discardPile = [];

  return shuffleDeck(state);
};

const rollFate = async (): Promise<Fate> => {
  console.log("Rolling fate...");

  // TODO spinner

  const roll = (Math.floor(Math.random() * 6) + 1) as Fate;

  console.log(`You rolled a ${roll}`);

  return roll;
};

const selectLuckPoints = async (state: State): Promise<Luck> => {
  const selection = await prompts({
    type: "select",
    name: "luck",
    message:
      "How many luck points would you like to spend to improve your roll?",
    choices: [
      { title: "0", value: 0, disabled: false },
      { title: "1", value: 1, disabled: state.luck < 1 },
      { title: "2", value: 2, disabled: state.luck < 2 },
      { title: "3", value: 3, disabled: state.luck < 3 },
      { title: "4", value: 4, disabled: state.luck < 4 },
      { title: "5", value: 5, disabled: state.luck < 5 },
      { title: "6", value: 6, disabled: state.luck < 6 },
    ],
  });

  return selection.luck;
};

const incrementLuck = async (state: State): Promise<State> => {
  const luck = Math.max(Math.min(state.luck + 1, 6), 1) as Luck;

  console.log(`Your luck is now ${luck}`);

  return {
    ...state,
    luck,
  };
};

const decrementLuck = async (state: State): Promise<State> => {
  const luck = Math.max(Math.min(state.luck - 1, 6), 1) as Luck;

  console.log(`Your luck is now ${luck}`);

  return {
    ...state,
    luck,
  };
};

const incrementHealth = async (state: State): Promise<State> => {
  const health = Math.max(Math.min(state.health + 1, 12), 1) as Health;

  console.log(`Your health is now ${health}`);

  return {
    ...state,
    health,
  };
};

const decrementHealth = async (state: State): Promise<State> => {
  const health = Math.max(Math.min(state.health - 1, 12), 1) as Health;

  console.log(`Your health is now ${health}`);

  return {
    ...state,
    health,
  };
};

const initialState: State = {
  cards: {
    deck: [
      {
        title: "The Scholars' Study",
        flavorText:
          "A musty scent of parchment hangs in the air as forgotten theories whisper from the inscribed walls. Even in this forgotten place, the thirst for knowledge perseveres.",
        sensoryDescription:
          "A secluded chamber filled with half-finished etchings and dusty stone tablets. Symbols of the Hibernus Guild punctuate the knowledge inscribed on the walls, while discarded equipment suggests the hurried retreat of its scholars. A faint glow of the All-Father's mystic energy lingers in the air.",
        instructions: "Draw a card.",
        onPlay: async (state) => {
          return drawCard(state);
        },
      },
      {
        title: "The Chamber of Abandoned Vows",
        flavorText:
          "Long forgotten promises echo in the musty air. Every discarded pledge here whispers of the dungeon's grip, breaking the resolve of explorers and turning ambition to regret.",
        sensoryDescription:
          "The room is littered with discarded equipment from past adventurers; old maps, broken blades, and worn-out boots are strewn about. Walls bear the inscribed, faded pledges of those who entered, but never emerged. The echo of whispers and the cold air serves as a stark reminder of their broken vows.",
        instructions: "Discard a card.",
        onPlay: async (state) => {
          const cardFromHand = await selectCardToDiscardFromHand(state);

          return discardCard(state, cardFromHand);
        },
      },
      {
        title: "The Altar at The Echoing Abyss",
        flavorText:
          "A monument to choices and sacrifices made by past adventurers stands solemnly at the abyss's edge. Their whispers, full of hope and despair, echo through the hallowed chamber, a testament to their unfulfilled destinies.",
        sensoryDescription:
          "An ancient altar carved of worn stone sits at the precipice of a yawning chasm. Eroded symbols of the All-Father are faintly visible on its surface, alongside remnants of offerings, sacrificed in the hopes of safe passage through the dungeon.",
        instructions: "Draw a card. Discard a card.",
        onPlay: async (state) => {
          state = await drawCard(state);

          const cardFromHand = await selectCardToDiscardFromHand(state);

          return discardCard(state, cardFromHand);
        },
      },
      {
        title: "Passage of Prophetic Glimpses",
        flavorText:
          "Whispers of the All-Father's cosmic wisdom echo through this starlit tunnel. Every footfall stirs ancient energy, and the celestial symbols pulse with a silent promise of enlightenment.",
        sensoryDescription:
          "The tunnel's ceiling is illuminated with a soft glow, casting eerie shadows on the mystical inscriptions that cover the walls. Mysterious orbs of light float in the air, reminiscent of distant stars. The way ahead is shrouded in semi-darkness, enticing you deeper into the secrets of the cosmos.",
        instructions: "Draw two cards.",
        onPlay: async (state) => {
          state = await drawCard(state);

          return drawCard(state);
        },
      },
      {
        title: "Hall of Recurring Fates",
        instructions:
          "Discard a card. Shuffle a card from the discard pile back into the deck.",
        flavorText:
          "The intricate dragon-carved walls of this vast hall whisper tales of past adventurers who faced the same challenges. Every choice resonates in the air, feeding the cycle of renewal, for in this dungeon, every decision is both an ending and a new beginning.",
        sensoryDescription:
          "This grandiose room houses towering dragon statues, their shadows flickering with the ethereal glow of mystic energy. The walls are adorned with inscriptions of the All-Father, intertwining with the dragon carvings. In the center, a circular stone platform pulses softly with an ancient power, influencing the path of those who dare to enter.",
        onPlay: async (state) => {
          const cardFromHand = await selectCardToDiscardFromHand(state);

          state = await discardCard(state, cardFromHand);

          const cardFromDiscardPile =
            await selectCardToShuffleIntoDeckFromDiscardPile(state);

          return shuffleCardFromDiscardPileIntoDeck(state, cardFromDiscardPile);
        },
      },
      {
        title: "Scout's Outlook",
        instructions: "Draw three cards.",
        flavorText:
          "You discover a vantage point used by past adventurers, a makeshift map etched into the stone. The paths forward are suddenly clear, each direction leading to unseen chambers echoing with untold histories.",
        sensoryDescription:
          "You find yourself standing at a high point in the dungeon, offering an overview of numerous interconnected chambers and corridors sprawling beneath you. A rough sketch has been etched onto the stone floor at your feet, depicting pathways and the crude symbols of various chambers. You see marked routes to the echoing Abyss, the verdant Cloister, and the unsettling Den of Serpents. Soft, ghostly whispers carried on an underground draft brush against your ears, a chilling symphony of past events resonating from the depths of the dungeon.",
        onPlay: async (state) => {
          for (let i = 0; i < 3; i++) {
            state = await drawCard(state);
          }

          return state;
        },
      },
      {
        title: "The Chamber of Choices",
        instructions: "Draw three cards. Discard three cards.",
        flavorText:
          "The serpentine paths etched into the walls of the chamber hint at the multitude of fates that could unfold. Here, in the heart of Eldrath's Sorrow, choices bear the weight of survival and knowledge, sculpting the tale of your journey. Beware, for every decision echoes through the sprawling labyrinth, shaping your destiny.",
        sensoryDescription:
          "The chamber is filled with a labyrinthine pattern of ancient paths and corridors carved into the walls, an intricate, beautiful, and terrifying reminder of the dungeon's vastness. Small pedestals holding abandoned relics and hastily discarded scrolls stand scattered around the room, silent testimonials of past explorers who faced their crossroads here. The room's dimly lit stone surfaces reflect the flicker of your torchlight, casting long shadows that sway and morph, mirroring the ebb and flow of the countless possibilities that lie ahead.",
        onPlay: async (state) => {
          for (let i = 0; i < 3; i++) {
            state = await drawCard(state);
          }

          for (let i = 0; i < 3; i++) {
            const cardFromHand = await selectCardToDiscardFromHand(state);

            state = await discardCard(state, cardFromHand);
          }

          return state;
        },
      },
      {
        title: "Portal of the All-Father",
        instructions:
          "Shuffle your hand into the deck. Re-draw that many cards.",
        flavorText:
          "Through the All-Father's gate, the echo of creation reverberates, reshaping the path to destiny.",
        sensoryDescription:
          "A towering stone archway etched with celestial symbols glows with an otherworldly light in the heart of the dungeon. Flecks of stardust seem to swirl within the portal, and a sense of overwhelming cosmic power emanates from it. Eldrath's shadowy form is seen flitting around, paying homage to the All-Father's might, as the whispers of scholars and adventurers reverberate, hinting at tales of awe and caution.",
        onPlay: async (state) => {
          const handSize = state.cards.hand.length;

          state = await shuffleHandIntoDeck(state);

          for (let i = 0; i < handSize; i++) {
            state = await drawCard(state);
          }

          return state;
        },
      },
      {
        title: "Sinkhole of Skyward Longing",
        flavorText:
          "Within the stone-ringed cavity, sunlight dares to descend, sparking whispers of freedom. Lift your eyes, weary traveler. Embrace the fleeting respite in the midst of your descent.",
        sensoryDescription:
          "A vast, circular chasm penetrates the dungeon, providing a vertiginous glimpse of the clear sky above. Overgrown vines from the encroaching forest edge into the stony perimeter, casting dancing shadows on the ground as they sway with the breeze. Sunlight illuminates the space, casting a stark contrast against the surrounding darkness, invoking a promise of the surface world.",
        instructions: "Discard your hand.",
        onPlay: async (state) => {
          return discardHand(state);
        },
      },
      {
        title: "Dash through the Beast's Den",
        instructions: "Discard your hand. Draw a card.",
        flavorText:
          "A shrill screech echoes through the room as the Feral Beast mother's slumber is disturbed. With her litter of snarling young ones around, it's best to make haste and slip into the shadows of the adjacent chamber.",
        sensoryDescription:
          "A hidden den, nestled in the corner of a stone room, teems with restless baby beasts, their sharp teeth gleaming in the dim light. The mother beast, a large, imposing figure with burning eyes, rises to her full height, snarling at the intruder. The adventurer, a fleeting shadow in the backdrop, retreats quickly, making for a partially collapsed doorway that leads to the darkness of the next room.",
        onPlay: async (state) => {
          state = await discardHand(state);

          return drawCard(state);
        },
      },
      {
        title: "The All-Father's Reprieve",
        flavorText:
          "In the deepest despair of the dungeon's depths, the All-Father's light permeates the darkness. Will you seize this divine opportunity, or falter under the weight of your journey?",
        sensoryDescription:
          "A faint, otherworldly light illuminates the intricate celestial etchings on the dungeon walls. A mysterious, benevolent energy pulses around you, its subtle warmth promising a momentary respite.",
        instructions:
          "Pick any card from the deck. Shuffle the deck. Discard a card.",
        onPlay: async (state) => {
          const card = await selectCardFromDeck(state);

          console.log("Shuffling the deck...");

          state = await shuffleDeck(state);

          return discardCard(state, card);
        },
      },
      {
        title: "The Vault of Visions",
        sensoryDescription:
          "An ancient chamber, rich in the mystic energy of the All-Father, is revealed. The walls are adorned with celestial symbols glowing softly, their light dancing on piles of scrolls left by scholars from different eras. Statues of dragons stand at each corner of the room, their eyes seemingly following every move with an unnerving intensity. In the center, a magical vortex, swirling with vibrant colors, awaits to shape the path of the beholder.",
        flavorText:
          "Here lies the power of foresight, a gift of the All-Father, a curse to the unworthy. This chamber, filled with whispers of past, present, and future, demands a choice from those who dare to gaze into its depths.",
        instructions:
          "Draw three cards. Put one in your hand, one in the discard pile, and one on top of the deck.",
        onPlay: async (state) => {
          for (let i = 0; i < 3; i++) {
            state = await drawCard(state);
          }

          const cardToDiscard = await selectCardToDiscardFromHand(state);

          state = await discardCard(state, cardToDiscard);

          const cardToPutOnTopOfDeck =
            await selectCardToPutBackOnTopOfDeckFromHand(state);

          return putCardFromHandOnTopOfDeck(state, cardToPutOnTopOfDeck);
        },
      },
      {
        title: "The Abyssal Fall",
        flavorText:
          "The dungeon breathes. Its labyrinthine depths conspire to mislead the unwary. In the echoing abyss, a misstep can be a journey's end... or a new beginning.",
        sensoryDescription:
          "A deceptively peaceful spot by the Echoing Abyss, where an unsuspecting footfall can lead to a plummet into the abyss. Deep scratches and bite marks on the nearby stones speak of the Feral Beasts that lurk in the shadows, silently observing the misfortune of unwary adventurers. As you tumble further into the abyss, the faintest roars of Eldrath's spirit echo a chilling welcome.",
        instructions: "Shuffle the discard pile into the deck.",
        onPlay: async (state) => {
          return shuffleDiscardPileIntoDeck(state);
        },
      },
      {
        title: "Trial of the Dragon's Breath",
        flavorText:
          "In the heart of the Dragon's Gallery, the air shimmers with residual heat. Fire and fury once shaped these halls. Can you withstand the remnants of their wrath?",
        sensoryDescription:
          "The room pulses with an uncanny heat, and towering dragon statues cast elongated shadows on scorched stone. Patches of the floor still glow faintly, remnants of dragonfire from a bygone era. You can almost hear the flapping of massive wings echoing in the heated silence.",
        instructions:
          "Roll fate. On an even number, draw a card. On an odd number, discard a card.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          const isTotalEven = total % 2 === 0;

          if (isTotalEven) {
            return drawCard(state);
          }

          const card = await selectCardToDiscardFromHand(state);

          return discardCard(state, card);
        },
      },
      {
        title: "Eldrath's Ethereal Judgement",
        sensoryDescription:
          "You find yourself in a shadowy chamber, its arched ceiling seemingly suspended in the abyss. The room pulses with an eerie, blue glow, and a chill runs down your spine. Across the walls, the faint, shadowy form of a Dragon appears and disappears, its roars echoing around the room as if coming from everywhere and nowhere at the same time.",
        flavorText:
          "In this spectral chamber, the spirit of Eldrath the Dragon weighs your worth. Will you receive Eldrath's spectral blessing or face his ethereal wrath? The echo of his roars will be your answer.",
        instructions:
          "Roll fate. On an even number, gain a luck point. On an odd number, lose a luck point.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          const isTotalEven = total % 2 === 0;

          if (isTotalEven) {
            return incrementLuck(state);
          }

          return decrementLuck(state);
        },
      },
      {
        title: "The Overgrown Conservatory",
        instructions:
          "Roll fate. If you roll a 1 or a 2, gain a health point. If you roll a 3 or a 4, gain a luck point. If you roll a 5 or a 6, draw a card.",
        flavorText:
          "In this room, nature’s reach extends beyond its usual limits under the influence of the Dark Druids. Exotic vines choke the stonework, their rapid growth spurred on by druidic glyphs. Amongst the dense foliage, enticing berries of myriad colors beckon with the promise of unexpected boons.",
        sensoryDescription:
          "You step into a verdant paradise, bursting with life. The crumbling stone architecture is blanketed with lush greenery, featuring flowers of otherworldly hues and tangled vines laden with bright berries. Druidic glyphs hum with latent power amidst the vegetation, their arcane energies accelerating the growth of the plants. The rustling leaves seem to whisper ancient secrets, and the air is thick with the fragrant aroma of the thriving flora.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(1, Math.min(6, fate + luck)) as Fate;

          if (total === 1 || total === 2) {
            return incrementHealth(state);
          } else if (total === 3 || total === 4) {
            return incrementLuck(state);
          } else if (total === 5 || total === 6) {
            return drawCard(state);
          }
        },
      },
      {
        title: "The Sanctuary of Chains",
        flavorText:
          "The Sanctuary of Chains, a paradoxical haven, offers the promise of safety at the cost of your freedom. Here, the Giants' stone constructs surround you, their eyes seeming to promise protection, yet their immense, stoic forms also serve as an oppressive barrier. One must be willing to bear the weight of their chains to bask in the glow of their protection.",
        sensoryDescription:
          "The room is a vast stone chamber, lined with towering, chained statues of Giants. Their outstretched arms are linked by heavy, unbreakable chains, forming a protective circle around the room. The chains glimmer with an otherworldly light, emanating a comforting warmth yet radiating an undeniable sense of confinement.",
        instructions:
          "Roll fate. On an even number, gain that many health points. On an odd number, lose that many luck points.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          const isTotalEven = total % 2 === 0;

          if (isTotalEven) {
            for (let i = 0; i < total; i++) {
              state = await incrementHealth(state);
            }

            return state;
          }

          for (let i = 0; i < total; i++) {
            state = await decrementLuck(state);
          }

          return state;
        },
      },
      {
        title: "The Seedling's Cradle",
        flavorText:
          "A microcosm of life and death, renewal and decay. Here, in the dungeon's heart, life emerges from the remnants of the old. The cycle never ends.",
        instructions:
          "Roll fate. Draw that many cards. Shuffle that many cards from your hand into the deck.",
        sensoryDescription:
          "A small nook within the dungeon is teeming with life. Moss, lichen, and mushrooms of all colors colonize the stone floor, and the carcass of a long-deceased creature provides fertile ground for new growth. A single seedling emerges from the decay, its green leaves a stark contrast against the darkness. As you watch, a fruit falls from the seedling, and immediately starts to decompose, nourishing the tiny life below. This place hums with quiet energy, the air rich with the scent of earth and new growth, a testament to the Forest's encroaching influence.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          for (let i = 0; i < total; i++) {
            state = await drawCard(state);
          }

          for (let i = 0; i < total; i++) {
            const cardFromHand = await selectCardToShuffleIntoDeckFromHand(
              state
            );

            state = await shuffleCardFromHandIntoDeck(state, cardFromHand);
          }

          return state;
        },
      },
      {
        title: "The Lair of the Shadow Beast",
        flavorText:
          "Your heart pounds in sync with the pulsing echo from the heart of the darkness. You're no longer the hunter, but the prey. You brace yourself - survival here comes at a cost.",
        sensoryDescription:
          "A cavernous chamber filled with the palpable tension of a predator's domain. Shadowy corners bristle with the matted fur of monstrous nests. Claw marks scar the stone walls, while scattered bones of previous trespassers gleam ominously under the faint luminescence of phosphorescent fungi. The silence is broken occasionally by a low growl, reverberating through the air, a chilling reminder of the feral inhabitants of this den.",
        instructions:
          "Roll fate. Lose that many luck points. Lose that many health points. Draw that many cards.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          for (let i = 0; i < total; i++) {
            state = await decrementLuck(state);
          }

          for (let i = 0; i < total; i++) {
            state = await decrementHealth(state);
          }

          for (let i = 0; i < total; i++) {
            state = await drawCard(state);
          }

          return state;
        },
      },
      {
        title: "The Beast's Favor",
        flavorText:
          "In the foreboding depths of Eldrath's Sorrow, an unexpected alliance is born. A wary beast becomes an unlikely guardian, guiding you with feral wisdom through the dungeon's winding ways.",
        sensoryDescription:
          "Amidst the lush overgrowth claiming the stone halls, a fierce creature emerges. Its eyes, glowing with an intelligent, primal force, reflect an unspoken understanding. Guided by this unusual ally, you traverse paths less trodden, marked by claw and bite marks, and through chambers glowing with the eerie luminescence of bioluminescent fungi. The echoing growls and rustling vegetation underscore the strange, wild harmony of this alliance.",
        instructions:
          "Roll fate. Gain that many luck points. Gain that many health points. Discard that many cards.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          for (let i = 0; i < total; i++) {
            state = await incrementLuck(state);
          }

          for (let i = 0; i < total; i++) {
            state = await incrementHealth(state);
          }

          for (let i = 0; i < total; i++) {
            const cardToDiscard = await selectCardToDiscardFromHand(state);

            state = await discardCard(state, cardToDiscard);
          }

          return state;
        },
      },
      {
        title: "The Serpent's Gauntlet",
        flavorText:
          "In the dim light, a figure moves with purpose through the Serpent's Gauntlet, a labyrinthine section of the dungeon known for its pilfered chambers. The stranger's quick, precise movements suggest a familiarity with the shadows. Could this be a member of the notorious Serpent's Eye? Tread carefully, adventurer, for these halls echo with deception.",
        sensoryDescription:
          "A twisting maze of narrow passageways, where the cold stone walls bear signs of reckless excavation and hastily etched serpent graffiti. The light from a single torch flickers across a cloaked figure, their face hidden in shadow, picking their way through the labyrinth with a deftness that hints at many previous expeditions.",
        instructions:
          "Roll fate. On an even number, draw that many cards. On an odd number, shuffle that many cards from the discard pile into the deck.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          const isTotalEven = total % 2 === 0;

          if (isTotalEven) {
            for (let i = 0; i < total; i++) {
              state = await drawCard(state);
            }

            return state;
          }

          for (let i = 0; i < total; i++) {
            const cardFromDiscardPile =
              await selectCardToShuffleIntoDeckFromDiscardPile(state);

            state = await shuffleCardFromDiscardPileIntoDeck(
              state,
              cardFromDiscardPile
            );
          }

          return state;
        },
      },
      {
        title: "Vial of Venom and Vigor",
        flavorText:
          "In the Den of Serpents, the stakes of fortune and ruin are distilled into a tantalizing elixir. Each sip may strengthen or devastate you, but the allure of the next drop is irresistible.",
        sensoryDescription:
          "A sleek, glistening vial stands out amidst the treasures of the den, its iridescent liquid shifting between inviting green and menacing crimson. The hiss of a thousand serpents seems to emanate from within the vial, whispering promises of power and threats of pain.",
        instructions:
          "Roll fate. If you roll higher than your current health total, gain a health point and reroll. If you roll lower than your current health total, lose three health points.",
        onPlay: async (state) => {
          const handle = async (state: State) => {
            const fate = await rollFate();

            const luck = await selectLuckPoints(state);

            const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

            const health = state.health;

            const isTotalHigherThanHealth = total > health;

            if (isTotalHigherThanHealth) {
              state = await incrementHealth(state);

              return handle(state);
            }

            for (let i = 0; i < 3; i++) {
              state = await decrementHealth(state);
            }

            return state;
          };

          return handle(state);
        },
      },
      {
        title: "The Giants' Gauntlet",
        sensoryDescription:
          "A colossal corridor stretches before you, its towering walls etched with the enormous carvings of Giants locked in battle and triumph. Their stone-cold eyes seem to watch your every move, their faces a mixture of disdain and challenge. A mystical essence fills the air, the palpable remnant of their mighty feats of strength and endurance, inspiring and intimidating in equal measure.",
        flavorText:
          "Only the brave dare tread the path of the Giants, for their trials are as tremendous as the rewards they guard.",
        instructions:
          "Roll fate. If you roll the same number as your current health total, draw twice that number of cards. If you roll a different number than your current health total, lose twice that many health points.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          const health = state.health;

          const isTotalEqualToHealth = total === health;

          if (isTotalEqualToHealth) {
            for (let i = 0; i < total * 2; i++) {
              state = await drawCard(state);
            }

            return state;
          }

          for (let i = 0; i < total * 2; i++) {
            state = await decrementHealth(state);
          }

          return state;
        },
      },
      {
        title: "The Egg-laden Nest",
        instructions:
          "Roll fate. If you roll a 1, 2, or 3, lose a health point for each card in your hand. If you roll a 4, 5, or 6, gain a health point for each card in your hand.",
        flavorText:
          "A dimly lit cavern draped in shadows houses an oversized nest, a testament to the Feral Beasts that roam Eldrath's Sorrow. Scratches, imprints of claws and gnawed bone fragments warn of the current resident, a formidable creature drawn by the ancient energy of the All-Father. Whispers of the Echoing Abyss resound, chilling your spine as you carefully approach the egg-laden nest. Here, in the harsh embrace of the dungeon, you understand that the line between predator and prey is a question of choices.",
        sensoryDescription:
          "The cavern is barely lit, with slivers of light piercing the gloom through cracks in the rock. The enormous nest dominates the room, a chaotic pile of branches, bones, and feathers. It cradles large, mottled eggs that glisten with an otherworldly hue. Claw marks scar the stone around it, and the remains of unfortunate adventurers lie scattered, their equipment glinting ominously. The echo of distant roars fills the cavern, their unseen source a constant threat.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          if (total === 1 || total === 2 || total === 3) {
            for (let i = 0; i < state.cards.hand.length; i++) {
              state = await decrementHealth(state);
            }
          } else if (total === 4 || total === 5 || total === 6) {
            for (let i = 0; i < state.cards.hand.length; i++) {
              state = await incrementHealth(state);
            }
          }

          return state;
        },
      },
      {
        title: "The Seer's Refuge",
        instructions:
          "Roll fate. If you roll a 1, 2, or 3, lose a luck point for each card in your hand. If you roll a 4, 5, or 6, gain a luck point for each card in your hand.",
        flavorText:
          "Within Eldrath's Sorrow, tucked away in a forgotten corner, exists the refuge of a blind seer. Despite his physical blindness, his second sight reads the web of fate and destiny. Be prepared - for the choices here could tip the scales of fortune.",
        sensoryDescription:
          "A snug grotto illuminated by the faint glow of runic symbols on the walls, mirroring those found in The Scholar's Archive. In the center sits the blind seer, an old man dressed in ragged robes, his eyes covered with a cloth marked with a symbol of the All-Father. The room is rich with the aroma of herbs and parchment, mixing with the damp earthiness of the dungeon. Muffled whispers from the Echoing Abyss seem to converse with the seer's silent murmurs. As you step in, a sense of profound anticipation fills the air, hinting at the promise of revealed destinies.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          if (total === 1 || total === 2 || total === 3) {
            for (let i = 0; i < state.cards.hand.length; i++) {
              state = await decrementLuck(state);
            }
          } else if (total === 4 || total === 5 || total === 6) {
            for (let i = 0; i < state.cards.hand.length; i++) {
              state = await incrementLuck(state);
            }
          }

          return state;
        },
      },
      {
        title: "The Hall of Tempting Fate",
        flavorText:
          "A legendary corridor within Eldrath's Sorrow, where the All-Father's ancient magic tests one's luck. Many a bold adventurer has succumbed here, but those favored by fate emerge reborn, filled with the vitality of a dozen men.",
        sensoryDescription:
          "Before you, a torch-lit hallway stretches into the shadows. The floor is etched with glowing celestial symbols, pulsing with a quiet but powerful energy. Dragon statues loom overhead, their stone eyes gleaming with an ominous light. The air seems charged with both anticipation and danger, a fitting welcome to this corridor of chance and consequence.",
        instructions:
          "Roll fate. If you roll a 1, set your health to 12. If you roll anything other than a 1, set your health level to 1.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          if (total === 1) {
            while (state.health < 12) {
              state = await incrementHealth(state);
            }

            return state;
          }

          while (state.health > 1) {
            state = await decrementHealth(state);
          }

          return state;
        },
      },
      {
        title: "The Serpent's Gift",
        instructions: "Gain a luck point.",
        flavorText:
          "As you wander through the pilfered chambers of the Serpent's Eye, your foot strikes a tiny object obscured by the dim dungeon light. Stooping to investigate, you uncover a gemstone, its iridescent sparkle hinting at the fortune it once brought its owner. Perhaps some luck still lingers in its facets?",
        sensoryDescription:
          "The card displays a dimly lit room filled with recklessly overturned chests and scattered artifacts. A faint serpent-encircled eye is etched into the far wall, the graffiti nearly faded with time. Dominating the scene is a single gemstone, partially hidden amidst the chaos, casting a soft, alluring glow that contradicts the dungeon's chilling atmosphere.",
        onPlay: async (state) => {
          return incrementLuck(state);
        },
      },
      {
        title: "The Flicker of Fate",
        instructions:
          "Roll fate. If you roll higher than 1, gain a luck point. If you roll a 1, lose a health point.",
        flavorText:
          "In the gloom of Eldrath's Sorrow, a single flicker of light beckons from an unexplored chamber. Will it lead to luck or disaster?",
        sensoryDescription:
          "A dimly lit chamber, carved from the ancient stone of the dungeon. Glints of light sparkle off the traces of celestial symbols etched into the walls, a testament to the All-Father's cosmic domain. In the center of the room, an eerie glow illuminates a solitary die, its outcome hidden in shadow. Faint echoes of past adventurers ripple through the air, the scent of old campfires linger, and the residue of an unending struggle against fate is palpable.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          if (total === 1) {
            state = await decrementHealth(state);
          } else if (total > 1) {
            state = await incrementLuck(state);
          }

          return state;
        },
      },
      {
        title: "Encounter at the Dragon's Breath Bridge",
        flavorText:
          "The once magnificent bridge, scorched and warped by dragonfire, remains a contested ground in Eldrath's Sorrow. As you traverse its cracked stone surface, shadows of monstrous forms begin to detach from the surrounding abyss, their eyes glowing with eerie luminescence. Here, the dance of death begins anew.",
        sensoryDescription:
          "The large bridge spans a gaping chasm, and is lit by an eerie glow from molten cracks. Dragon statues flank the entrance, their forms warped by ancient flames. Claw marks scar the ground, and the echoes of roars from battles past still reverberate in the dense, sulfurous air. Dark figures loom in the distance, ready to test your mettle.",
        instructions:
          "Roll fate. If you roll higher than 2, defeat the beast and gain a luck point. If you roll lower than 3, the beast overpowers you, and you lose 2 health points.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          if (total > 2) {
            state = await incrementLuck(state);
          } else {
            for (let i = 0; i < 2; i++) {
              state = await decrementHealth(state);
            }
          }

          return state;
        },
      },
      {
        title: "The Ambush in the Overgrowth",
        flavorText:
          "In the less-traveled sections of the Verdant Cloister, the dungeon reveals its true nature, favoring those who tread with caution and respect. A rustle of leaves, a flicker of shadow, and suddenly the flora's verdant embrace turns into a monstrous snare.",
        sensoryDescription:
          "Before you stands a tangle of dense vegetation, a seemingly peaceful corner of the dungeon reclaimed by the forest. Suddenly, a feral beast lunges from the shadows, its eyes glinting ominously. There is little room to move or evade – the claw marks on the stone walls a grim testament to previous encounters. Your heart races as you brace yourself for the inevitable conflict.",
        instructions:
          "Roll fate. If you roll higher than 3, gain a luck point. If you roll lower than 4, lose 3 health points.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          if (total > 3) {
            state = await incrementLuck(state);
          } else {
            for (let i = 0; i < 3; i++) {
              state = await decrementHealth(state);
            }
          }

          return state;
        },
      },
      {
        title: "The Enigma of the Veiled Wanderer",
        flavorText:
          "In the obsidian blackness of the Echoing Abyss, you meet a cloaked stranger. He is a solitary figure, illuminated faintly by the bioluminescent fungi. His voice reverberates around the chamber, whispering an ancient riddle of fate that promises fortune or doom. The hushed whispers of the abyss suddenly seem to hold their breath, awaiting your response.",
        sensoryDescription:
          "In the heart of the abyss, a figure stands draped in a cloak of shadows, his face obscured by a deep hood. His outstretched hand holds a crystal sphere filled with swirling constellations, casting an otherworldly glow that dances on the chamber walls, rich with ancient carvings of celestial bodies. The sphere pulsates as you ponder, awaiting your interaction.",
        instructions:
          "Roll fate. If you roll higher than 4, gain a luck point. If you roll lower than 5, lose 4 health points.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          if (total > 4) {
            state = await incrementLuck(state);
          } else {
            for (let i = 0; i < 4; i++) {
              state = await decrementHealth(state);
            }
          }

          return state;
        },
      },
      {
        title: "The Crumbling Hall of Folly",
        instructions:
          "Roll fate. If you roll higher than 5, gain a luck point. If you roll lower than 6, lose 5 health points.",
        flavorText:
          "A sudden rumble makes your heart lurch. The hall groans with the weight of centuries, pushed to its limit by recent transgressions. The spirit of the Giants seems to murmur in the air, 'Strength is more than muscle... it's the will to endure.'",
        sensoryDescription:
          "A hallway marked by signs of reckless excavation, likely the careless work of the Serpent's Eye. The aftermath of a small cave-in is evident, with debris and dust scattering the ground. Stone constructs, remnants of the Giants' handiwork, jut out from the walls, their carved majesty marred by recent, violent fractures. Faint glimmers of mystic energy flicker around the rubble, indicating a disruption in the ancient energy infused into the dungeon's foundation. Amidst the chaos, a serpent-encircled eye graffiti boldly proclaims the culprits of this sacrilege.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          if (total > 5) {
            state = await incrementLuck(state);
          } else {
            for (let i = 0; i < 5; i++) {
              state = await decrementHealth(state);
            }
          }

          return state;
        },
      },
      {
        title: "Scholars' Snare",
        instructions:
          "Roll fate. If you roll higher than 6, gain a luck point. If you roll lower than 7, lose 6 health points.",
        flavorText:
          "You've stepped into the Scholars' Snare, a clever ruse set by the Hibernus Guild to protect the dungeon's secrets from those with less than noble intentions. The room pulses with mystic energy, a magical trap designed to measure the integrity of those who dare to cross its threshold. For the pure of heart, luck shall be their companion; for the unworthy, they will feel the scholars' rebuke.",
        sensoryDescription:
          "The Scholars' Snare is a room filled with shelves of fake artifacts, parchment, and cryptic diagrams. Guild symbols subtly etched into the stone floor glitter underfoot, denoting the intricate spellwork imbued into the room. The walls are adorned with murals depicting a grand assembly of scholars in deep contemplation. In the middle, a large, antique desk bears the weight of an open tome with pages blank and inviting. Yet, upon closer inspection, you notice a shimmer in the air, a barely perceptible curtain of energy that signals the room's true, trap-laden nature.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          if (total > 6) {
            state = await incrementLuck(state);
          } else {
            for (let i = 0; i < 6; i++) {
              state = await decrementHealth(state);
            }
          }

          return state;
        },
      },
      {
        title: "The Spider's Parlor",
        flavorText:
          "In the labyrinth of Eldrath's Sorrow, you've stumbled upon a grim rendezvous of shadowy weavers. The silent chittering of countless arachnid inhabitants forms an eerie symphony, their glistening webwork a perilous dance of fortune.",
        sensoryDescription:
          "This room is shrouded in darkness, its corners and ceiling obscured by a thick tapestry of silken webs. As your eyes adjust, you can make out the eerie glint of countless eight-legged inhabitants, their eyes reflecting the scant light. Statues of the All-Father and the Dragons are discernable beneath the intricate webs, their carved faces imbued with an eerie foreboding by the silvery strands.",
        instructions:
          "Roll fate. If you roll higher than 7, gain a luck point. If you roll lower than 8, lose 7 health points.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          if (total > 7) {
            state = await incrementLuck(state);
          } else {
            for (let i = 0; i < 7; i++) {
              state = await decrementHealth(state);
            }
          }

          return state;
        },
      },
      {
        title: "Abyssal Fates",
        flavorText:
          "As you approach the Edge of the Echoing Abyss, you can feel the power of Eldrath's spirit radiating from the endless void. The echoes of ancient roars and the ominous whispers of unseen beasts resonate with your own destiny, urging you to proceed despite the impending doom.",
        sensoryDescription:
          "The card depicts a brave adventurer standing at the edge of a vast chasm. The walls of the Echoing Abyss are filled with fading Giant carvings and unseen creatures' claw marks. Mysterious whispers and echoes seem to emanate from the depths of the abyss, creating an atmosphere of danger and foreboding.",
        instructions:
          "Roll fate. If you roll higher than 8, gain a luck point. If you roll lower than 9, lose 8 health points.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          if (total > 8) {
            state = await incrementLuck(state);
          } else {
            for (let i = 0; i < 8; i++) {
              state = await decrementHealth(state);
            }
          }

          return state;
        },
      },
      {
        title: "The Serpent's Toll",
        instructions:
          "Roll fate. If you roll higher than 9, gain a luck point. If you roll lower than 10, lose 9 health points.",
        flavorText:
          "In a narrow passage, you encounter members of the Serpent's Eye. With sneers and threats, they demand a toll for safe passage. Will fortune favor you, or will you pay the price for crossing paths with these relentless treasure hunters?",
        sensoryDescription:
          "The corridor is lit with the flicker of torchlight revealing the graffiti of a serpent-encircled eye on the cold stone walls, signifying the Serpent's Eye's claim over this area. Figures draped in dark, hooded cloaks block your path. Their smirking faces are barely visible under the hoods, their hands resting on the pommels of sheathed daggers. The air is filled with a tense silence, broken only by their raspy demands for tribute.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          if (total > 9) {
            state = await incrementLuck(state);
          } else {
            for (let i = 0; i < 9; i++) {
              state = await decrementHealth(state);
            }
          }

          return state;
        },
      },
      {
        title: "The Crucible of Dragonfire",
        flavorText:
          "A reminder of the Dragons' fearsome power, this room seethes with latent infernal energy. The scorched stone and half-melted carvings tell a tale of pyroclastic wrath that could be awakened at any moment.",
        sensoryDescription:
          "You find yourself in a chamber filled with towering dragon statues, their maws wide open as if frozen in a roar of fire. The walls bear the signs of intense heat, warped and blackened, and an oppressive heat still hangs in the air. On the ground, faint traces of an ash-covered path can be discerned, likely the only safe route through this fiery gauntlet.",
        instructions:
          "Roll fate. If you roll higher than 10, gain a luck point. If you roll lower than 11, lose 10 health points.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          if (total > 10) {
            state = await incrementLuck(state);
          } else {
            for (let i = 0; i < 10; i++) {
              state = await decrementHealth(state);
            }
          }

          return state;
        },
      },
      {
        title: "The Chamber of Abandoned Hopes",
        flavorText:
          "Beneath the stern gaze of the celestial bodies in this solemn chamber, many have been tested and found wanting. The allure of surrender can be strong in this quiet place where hope seems to wane.",
        sensoryDescription:
          "A domed chamber, dimly lit by twinkling celestial symbols etched into its ceiling. Discarded equipment lies scattered about, testament to adventurers who have forsaken their journey. The walls bear inscriptions from the Hibernus Guild, recording theories of despair and sacrifice, but the notes grow sparse and forlorn as one moves deeper into the room. An ethereal whisper seems to permeate the air, a wordless hymn of relinquishment.",
        instructions:
          "Roll fate. If you roll higher than 11, gain a luck point. If you roll lower than 12, lose 11 health points.",
        onPlay: async (state) => {
          const fate = await rollFate();

          const luck = await selectLuckPoints(state);

          const total: Fate = Math.max(0, Math.min(6, fate + luck)) as Fate;

          if (total > 11) {
            state = await incrementLuck(state);
          } else {
            for (let i = 0; i < 11; i++) {
              state = await decrementHealth(state);
            }
          }

          return state;
        },
      },
      {
        title: "Chamber of Eternal Shadows",
        flavorText:
          "A room so deep within Eldrath's Sorrow that no sunlight has ever reached it. In this place, the absence of light weighs heavily, feeding despair and extinguishing hope.",
        instructions: "Lose 12 health points.",
        sensoryDescription:
          "The chamber is shrouded in an all-consuming darkness that swallows every beam of your torchlight. The air, heavy with dampness and centuries-old silence, stifles your breath, making every inhalation a struggle. Prolonged absence of sunlight has left an almost tangible layer of desolation, a pervasive echo of countless explorers' despair. The walls, unseen but palpably close, seem to press inward, their chill seeping into your very bones.",
        onPlay: async (state) => {
          for (let i = 0; i < 12; i++) {
            state = await decrementHealth(state);
          }

          return state;
        },
      },
      {
        title: "The Infirmary of Renewal",
        flavorText:
          "In this quiet, forgotten corner of the dungeon, once a restful haven for the Giants, a healing energy suffuses the air, remnants of the All-Father's benevolence. The moss-covered stone has a soothing coolness, and for a moment, it seems as though the dungeon itself breathes life into your weary body.",
        sensoryDescription:
          "Vines creep up the ancient stone walls, softening the stark architecture. A dim, ethereal light filters through the cracks in the ceiling, casting a calming glow on the mossy floor. The faint scent of healing herbs lingers in the air, a mystery in the heart of this imposing stone labyrinth. An old, stone seat, likely meant for the titanic form of a Giant, serves as a makeshift bed.",
        instructions: "Gain a health point",
        onPlay: async (state) => {
          return incrementHealth(state);
        },
      },
      {
        title: "The Forgotten Campsite",
        flavorText:
          "Among the detritus of past adventurers, you find a weathered stone, glowing faintly with a mystic aura. Perhaps it was dropped by a scholar of the Hibernus Guild, or maybe a hopeful wanderer seeking the Giants' ancient wisdom. You feel an undeniable surge of luck coursing through you as you pocket the precious stone.",
        instructions: "Gain a luck point",
        sensoryDescription:
          "A timeworn campsite surrounded by rusted gear and remnants of past expeditions. An eerie silence hangs over the scene, broken only by the hushed whispers of the dungeon's ancient history. Your eye is drawn to a small, luminescent stone, lying discarded among the ruins, as if waiting for you to discover its secret.",
        onPlay: async (state) => {
          return incrementLuck(state);
        },
      },
      {
        title: "The Grotto of Impulsive Gains",
        flavorText:
          "In the echoing hollow of this ancient chamber, temptation lingers, urging seekers to trade caution for immediate reward.",
        sensoryDescription:
          "A damp, moss-covered chamber illuminated by a swarm of luminescent insects buzzing near the ceiling. In the center stands a glistening stalagmite adorned with various artifacts left by previous adventurers. A faint, intoxicating scent wafts through the air, inducing a sense of heightened vitality as one steps closer to the stalagmite.",
        instructions: "Sacrifice a luck point. Gain a health point.",
        onPlay: async (state) => {
          state = await decrementLuck(state);

          return incrementHealth(state);
        },
      },
      {
        title: "The Grotto of Sacrifice",
        flavorText:
          "Deep within the dungeon, an eerie aura emanates from a secluded grotto, its stone basin stained with ancient blood. The air hums with an alluring promise of fortune for those daring to pay the price. Here, the echo of the All-Father's mystic energy pulses in tandem with the heartbeat of the brave and desperate, fueling the dungeon's relentless cycle of life and death.",
        sensoryDescription:
          "The grotto's damp, moss-covered walls glisten under a low, celestial glow that refracts off the pool of stagnant water below. Strange carvings, reminiscent of those found in the Giants' Sanctum, speak of ancient rituals. The remnants of past sacrifices lay scattered around - rusted weapons, torn banners, and aged bones. A whisper of ethereal dragon roars seems to sweep through this place, leaving a trail of chills on your skin.",
        instructions: "Sacrifice a health point. Gain a luck point.",
        onPlay: async (state) => {
          state = await decrementHealth(state);

          return incrementLuck(state);
        },
      },
      {
        title: "Spring of the All-Father",
        instructions: "Gain two health points.",
        flavorText:
          "In the depths of Eldrath's Sorrow, a mystical spring pulsates with divine energy. As you dip your weary hand into the shimmering water, your wounds begin to mend, your strength returns. The All-Father's power, ancient and benevolent, continues to nourish those who tread these forgotten halls.",
        sensoryDescription:
          "A dimly-lit grotto, cradling a radiant spring. Celestial symbols, reminiscent of those seen in the Celestial Observatory, are etched around the pool's rim. The water shimmers with a soft, otherworldly light, reflecting off the damp stone ceiling. Faint echoes of ethereal hymns, carried by the gentle drip-drip-drip of the sacred water, fill the space with a sense of tranquility and reverence.",
        onPlay: async (state) => {
          for (let i = 0; i < 2; i++) {
            state = await incrementHealth(state);
          }

          return state;
        },
      },
      {
        title: "The Chamber of Fortuitous Findings",
        flavorText:
          "In the quiet corners of the dungeon, where the Hibernus Guild has been diligent in their studies, you find a cache of strange relics. Their purpose is obscure, but they hum with a quiet promise of providence. Luck, it seems, favors the vigilant.",
        sensoryDescription:
          "This room, bathed in the soft glow of luminescent fungi, is a hidden gem amidst the gargantuan stonework. Shelves on the walls, carved painstakingly into the rock, hold ancient artifacts - tokens left behind by the Giants, scribbled theories of the Guild, and even a few remnants of adventurers' tools. The air hums with a strange, compelling energy, whispering ancient secrets to those who would listen.",
        instructions: "Gain two luck points.",
        onPlay: async (state) => {
          for (let i = 0; i < 2; i++) {
            state = await incrementLuck(state);
          }

          return state;
        },
      },
      {
        title: "Repose in the Verdant Cloister",
        flavorText:
          "In the heart of the encroaching forest, nature offers respite to the weary, healing your wounds but demanding a tribute of fortune.",
        instructions: "Sacrifice two luck points. Gain three health points.",
        sensoryDescription:
          "Vibrant greenery shrouds the chamber, twisting ivy and soft moss making a serene retreat out of a once-bare stone room. The chirping of forest creatures seeping through the walls harmonizes with the gentle rustle of leaves. The sweet scent of earth and bloom fills the air, a stark contrast to the cold dampness of the rest of the dungeon. Yet, amid the peace, the unyielding touch of the Dark Druids is felt as unusually vibrant overgrowth pulses with their uncanny magic.",
        onPlay: async (state) => {
          for (let i = 0; i < 2; i++) {
            state = await decrementLuck(state);
          }

          for (let i = 0; i < 3; i++) {
            state = await incrementHealth(state);
          }

          return state;
        },
      },
      {
        title: "The Altar of Offering",
        flavorText:
          "In the deepest corner of the dungeon, an ominous altar glows with an ancient energy, as if yearning for a sacrificial offering. It's said that those who brave its demands are rewarded with a stroke of divine luck.",
        instructions: "Sacrifice two health points. Gain three luck points.",
        sensoryDescription:
          "A worn stone altar stands bathed in dim, ethereal light. Faded etchings of celestial symbols and draconic figures cover its surface, an homage to the All-Father and his celestial beings. Blood stains from previous sacrifices darken the stone, adding a sinister touch to the hallowed ambiance. The air tingles with an omnipresent mystical energy, a silent testament to the All-Father's enduring influence.",
        onPlay: async (state) => {
          for (let i = 0; i < 2; i++) {
            state = await decrementHealth(state);
          }

          for (let i = 0; i < 3; i++) {
            state = await incrementLuck(state);
          }

          return state;
        },
      },
      {
        title: "The Sporiferous Hollow",
        instructions:
          "If you have an even number of luck points, gain a health point. If you have an odd number of luck points, lose a health point.",
        flavorText:
          "This cavernous pocket of the dungeon reeks of decay and dampness. Countless fungi have found a home here, their spores filling the air. The All-Father's magic infused in these spores may grant you vigor or sap your strength, echoing the capricious nature of survival deep within Eldrath's Sorrow.",
        sensoryDescription:
          "The hollow is an unsettling sight. Bioluminescent fungi emit an eerie glow, casting flickering shadows on the damp stone walls. The air is dense with floating spores, painting an almost ethereal landscape in this grim dungeon. On the floor, the remains of past explorers lay scattered, silent witnesses to the perils of breathing in too deeply.",
        onPlay: async (state) => {
          if (state.luck % 2 === 0) {
            return incrementHealth(state);
          } else {
            return decrementHealth(state);
          }
        },
      },
      {
        title: "The Echoing Baths of Eldrath",
        flavorText:
          "Hidden within the dungeon's depths lies the dragon Eldrath's abandoned bathhouse. An ancient relic, it still holds a restorative magic. But beware: the soothing waters echo loudly against the stone, and even the smallest splash might draw unwanted attention.",
        sensoryDescription:
          "Within the room, an immense stone basin filled with shimmering water is cradled by giant carvings of dragons. Light dances off the water's surface, casting peculiar shadows on the heat-warped stone structures. From the basin's depths, a soft, comforting warmth radiates, inviting you to heal your wounds. Yet, the cavernous space around it amplifies the smallest of sounds into echoing splashes, a stark reminder of the caution needed in this peaceful but perilous sanctuary.",
        instructions:
          "Sacrifice all of your luck points. Gain that many health points.",
        onPlay: async (state) => {
          const luck = state.luck;

          while (state.luck > 0) {
            state = await decrementLuck(state);
          }

          for (let i = 0; i < luck; i++) {
            state = await incrementHealth(state);
          }

          return state;
        },
      },
      {
        title: "Verdant Sanctuary",
        flavorText:
          "A glimmer of sunlight filters down into a room where the forest has made its mark. The delicate scent of earth and leaves fills the air. The power of the forest has entered the dungeon here, a beacon of hope in your long journey towards the surface.",
        sensoryDescription:
          "The room is bathed in the soft, filtered light that finds its way from the surface, illuminating a scene of tranquil coexistence. The stone walls and floor of the dungeon are almost entirely swallowed by the verdant life of the forest. Vines creep up the giant carvings, the symbology of the All-Father partially obscured by layers of moss. The once imposing stone constructs of the Giants have been softened by the encroachment of foliage, their formidable facades adorned with flowers. A broken compass and tattered map from past adventurers nestle within a patch of wildflowers, while careful inscriptions from the Hibernus Guild are barely visible beneath the overgrowth. It is a place where the realm of the dungeon and the realm of the forest intertwine, a place that seems to hum with a quiet, rejuvenating power.",
        instructions:
          "If you have an even number of luck points, set your health to 12. If you have an odd number of luck points, set your luck to 6.",
        onPlay: async (state) => {
          if (state.luck % 2 === 0) {
            while (state.health < 12) {
              state = await incrementHealth(state);
            }

            return state;
          }

          if (state.luck < 6) {
            while (state.luck < 6) {
              state = await incrementLuck(state);
            }

            return state;
          }

          if (state.luck > 6) {
            while (state.luck > 6) {
              state = await decrementLuck(state);
            }

            return state;
          }
        },
      },
      {
        title: "The Crypt",
        flavorText:
          "You enter a room pulsating with a malevolent energy. It's said that this is the place where Eldrath fell, and his spirit took root. The air is heavy with his resentment, the spectral echo of his roar fills your ears, sending shivers down your spine. You feel an unwelcome guest, treading on the sacred ground of an ancient, vengeful spirit. Can you withstand Eldrath's ire, or will it be your undoing?",
        sensoryDescription:
          "The room is circular, the walls and floors scarred with deep claw marks, a brutal testament to a long-ago struggle. Shadowy forms flit across the edges of your vision, spectral shapes that appear dragon-like. There's a palpable aura of malevolence that hangs in the air, making the hair on the back of your neck stand up. The quiet is unsettling, punctuated only by the distant, echoing roar of a dragon.",
        instructions:
          "If you have an odd number of luck points, set your health to 1. If you have an even number of luck points, set your luck to 1.",
        onPlay: async (state) => {
          if (state.luck % 2 === 0) {
            while (state.luck > 1) {
              state = await decrementLuck(state);
            }

            return state;
          }

          while (state.health > 1) {
            state = await decrementHealth(state);
          }

          return state;
        },
      },
      {
        title: "Vault of the Covetous Serpent",
        flavorText:
          "In a room glittering with riches, a single misstep triggers an ancient trap. You barely escape, but your possessions do not share your luck.",
        instructions: "Set your luck and health to 1.",
        sensoryDescription:
          "A grand chamber filled with glistening treasures. Gold, jewels, and ancient artifacts gleam enticingly from pedestals and alcoves, a tantalizing lure for any adventurer. But amidst the bounty, the ominous image of a serpent-encircled eye is carved into the floor - the symbol of the Serpent's Eye. Too late, you realize the treasures were a ruse, and the room's true purpose is to strip unsuspecting intruders of their belongings.",
        onPlay: async (state) => {
          while (state.luck > 1) {
            state = await decrementLuck(state);
          }

          while (state.health > 1) {
            state = await decrementHealth(state);
          }

          return state;
        },
      },
    ],
    discardPile: [],
    hand: [],
    play: [],
  },
  health: 6,
  luck: 1,
};
