import fs from "node:fs";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { log } from "node:console";

const rl = readline.createInterface({ input, output });

// const answer = await rl.question('What do you think of Node.js? ');

// console.log(`Thank you for your valuable feedback: ${answer}`);

// rl.close();

const players = [
  { name: "player1", cards: [] },
  { name: "player2", cards: [] },
];
const colors = ["red", "blue", "green", "yellow"];
const numberOfCards = 7;

const cardsSpecials = {
  takeTwo: () => null,
  skip: () => null,
  reverse: () => null,
  wild: () => null,
  wildDrawFour: () => null,
};

const cardsWild = {
  wild: () => null,
  wildDrawFour: () => null,
};

function startGame() {
  const cardsRandom = createCards();
  const playersCards = deal(cardsRandom);
  let currentCard = takeCard();

  const takePlayerTurn = async () => {
    log("################## player turn #################");
    console.log("********* carta Actual  **********");
    console.log(currentCard);
    console.log("*******************************\n");
    const filterCards = cardsRandom.filter(
      (card) =>
        card.color === currentCard.color ||
        card.number === currentCard.number ||
        (card.special && card.specialType === "wildDrawFour") ||
        (card.special && card.specialType === "wild")
    );

    console.log(`------------------------- tus cartas -------------------------`);
    filterCards.forEach((card) => {
      const index = playersCards[0].cards.indexOf(card);
      console.log(`${index} card: ${card?.color ?? ""} ${card?.number ?? ""}`);
    });
    
    log("tienes " + playersCards[0].cards.length + " cartas");
    console.log("-------------------------------------------------------------\n");

    if (filterCards.length === 0) {
      // console.log("******* no tienes cartas para lanzar ******");
      log("************** Tomaste una carta ******************");
      const newCard = takeCard();
      playersCards[0].cards.push(newCard);
      console.log(`-> Tu Nueva carta es ${JSON.stringify(newCard)}`);
      log("**********************************************************");
      takeCpuTurn();
      return;
    }

    const answer = await rl.question("Escoje una carta: ");

    if (isNaN(answer)) {
      console.log(answer + "no es un numero, Pierdes turno");
      takeCpuTurn();
      return;
    }

    const { color, number, special, specialType } = playersCards[0].cards[answer];

    log("*********** " + JSON.stringify(cardEscogida) + "**********************");


    if (
      cardEscogida?.color === color ||
      cardEscogida?.number === number || special
    ) {
      if(special){
        cardsSpecials[specialType]();
      }
      const cardEscogidaIndex = playersCards[0].cards.indexOf(cardEscogida);
      log(cardEscogidaIndex);
      log("TENIAS " + playersCards[0].cards.length + " CARTAS");
      playersCards[0].cards.splice(cardEscogidaIndex, 1);
      log("Ahora tienes " + playersCards[0].cards.length + " cartas");
      if (playersCards[0].cards.length === 0) {
        console.log("Jugador " + playersCards[0].name + " gano el juego");
        rl.close();
        return;
      }
      currentCard = cardEscogida;
      takeCpuTurn();
      return;
    } else {
      console.error(" **************** NO puedes lanzar esa carta ***************************\n");
      takePlayerTurn();
      return;
    }
  };

  const takeCpuTurn = () => {
    log("################## cpu turn #################");
    const filterCards = playersCards[1].cards.filter(
      (card) => card.color === currentCard.color || card.number === currentCard.number
    );

    if (filterCards.length === 0) {
      const newCard = takeCard();
      console.log(`############### CPU tomo una carta ##########`);
      playersCards[1].cards.push(newCard);
      takePlayerTurn();
      return;
    }

    const cardEscogida = filterCards[Math.floor(Math.random() * filterCards.length)];

    if (
      cardEscogida?.color === currentCard?.color ||
      cardEscogida?.number === currentCard?.number
    ) {
      console.log("\n");
      console.log(`############# cpu lanza carta  #############`);
      console.log(cardEscogida);
      console.log("############################################\n");
      const cardEscogidaIndex = playersCards[1].cards.indexOf(cardEscogida);

      playersCards[1].cards.splice(cardEscogidaIndex, 1);

      currentCard = cardEscogida;
      if (playersCards[1].cards.length === 0) {
        console.log("Jugador " + playersCards[1].name + " gana el juego");
        rl.close();
        return;
      }
      console.log("\n###### A CPU LE QUENDAN " + playersCards[1].cards.length + " CARTAS #######");
      takePlayerTurn();
      return;
    } else {
      console.log("CPU no puedes lanzar esa carta");
      takeCpuTurn();
      return;
    }
  };

  takePlayerTurn();
}

const randomCardSpecial = () => {
  const probabilityCardSpecial = Math.random();
  if (probabilityCardSpecial > 0.75) {
    const specialCardsKeys = Object.keys(cardsSpecials);
    const cardsSpecialRandom =
      specialCardsKeys[Math.floor(Math.random() * specialCardsKeys.length)];
    if (cardsSpecialRandom === "wild" || cardsSpecialRandom === "wildDrawFour") {
      return { color: null, number: null, special: true, specialType: cardsSpecialRandom };
    }

    return {
      color: colors[Math.floor(Math.random() * colors.length)],
      number: cardsSpecialRandom === "drawTwo" ? "+2" : null,
      special: true,
      specialType: cardsSpecialRandom,
    };
  }

  return null;
};

const createCards = () => {
  const cards = Array(numberOfCards * players.length)
    .fill(null)
    .map((_, i) => {
      const cardsSpecial = randomCardSpecial();
      if (cardsSpecial !== null) {
        return cardsSpecial;
      }
      return {
        color: colors[i % colors.length],
        number: i % 10,
        special: false,
        specialType: null,
      };
    });
  return cards;
};

const takeCard = () => {
  return {
    color: colors[Math.floor(Math.random() * colors.length)],
    number: Math.floor(Math.random() * 10),
    special: false,
    specialType: null,
  };
};

// console.log(createCards());

const deal = (deck) => {
  const hands = [];
  const playersClone = structuredClone(players);
  const playersMap = playersClone.map((player, index) => {
    const cards = [];
    for (let i = 0; i < numberOfCards; i++) {
      cards.push(deck.pop());
    }
    return { ...player, cards };
  });

  return playersMap;
};

// startGame();

const currentCard = { color: "red", number: 5, special: null, specialType: null };
const cardsRandom = createCards();
const filtercards = cardsRandom.filter(
  (card) =>
    card.color === currentCard.color ||
    card.number === currentCard.number ||
    (card.special === true && card.specialType === "wildDrawFour") ||
    (card.special === true && card.specialType === "wild")
);
log(currentCard);
log(filtercards);

rl.close();
