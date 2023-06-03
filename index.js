import readline from "node:readline";
// const players = 2;
const players = [
  { name: "player1", cards: [] },
  { name: "cpu", cards: [] },
];
const colors = ["green", "red", "blue", "yellow"];
const numberOfCards = 7;
const specialCards = {
  skip: () => null, // saltar turno
  drawTwo: () => null, // comer 2
  reverse: () => null, // cambiar sentido

  wild: () => null, // escoger color
  wildDrawFour: () => null, // comer 4
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function startGame() {
  const deck = createDeck2();
  let playersCards = deal(deck);
  let cardActual = takeCard();

  function takePlayerTurn() {
    console.log("****** carta Actual  *****");
    console.log(cardActual);
    console.log("**************************\n");

    const filterCards = playersCards[0].cards.filter(
      (card) => card?.color === cardActual?.color || card?.number === cardActual?.number
    );

    console.log(`****** tus cartas  ${playersCards[0].cards.length}*****`);
    filterCards.forEach((card) => {
      const indexCard = playersCards[0].cards.indexOf(card);
      console.log(`${indexCard} card: ${card?.color ?? ""} ${card?.number ?? ""}`);
    });
    console.log("**************************\n");

    if (filterCards.length === 0) {
      console.log("no tienes cartas para lanzar");
      const newCard = takeCard();
      console.log(`Tomaste una carta: ${newCard.color ?? ""} ${newCard.number ?? ""}`);
      playersCards[0].cards.push(newCard);
      takeCpuTurn();
    }

    rl.question(`Lanza una carta \n (numero de posicion): `, (guess) => {
      if (isNaN(guess)) {
        console.log(guess + " no es un numero, Pierdes turno");
        takeCpuTurn();
        return;
      }

      const cardEscogida = playersCards[0].cards[guess];
      if (cardEscogida?.color === cardActual?.color || cardEscogida?.number === cardActual?.number) {
        cardActual = cardEscogida;
        playersCards[0].cards.splice(guess, 1);
        takeCpuTurn();
        return;
      } else {
        console.log(" ************ no puedes lanzar esa carta \n");
        takePlayerTurn();
        return
      }
    });
  }

  function takeCpuTurn() {
    const filterCards = playersCards[1].cards.filter(
      (card) => card.color === cardActual.color || card.number === cardActual.number
    );

    if (filterCards.length === 0) {
      console.log("cpu no tiene cartas para lanzar");
      const newCard = takeCard();
      console.log(`Tomaste una carta: ${newCard?.color ?? ""} ${newCard?.number ?? ""}`);
      playersCards[0].cards.push(newCard);
      takePlayerTurn();
    }

    const cardEscogida = filterCards[Math.floor(Math.random() * filterCards.length)];

    if (cardEscogida?.color === cardActual?.color || cardEscogida?.number === cardActual?.number) {
      console.log("\n");
      console.log(`************ cpu lanza carta ${playersCards[1].cards.length} ************`);
      console.log(cardEscogida);
      console.log("*****************************************\n");
      cardActual = cardEscogida;
      const cardEscogidaIndex = playersCards[1].cards.indexOf(cardEscogida);
      playersCards[1].cards.splice(cardEscogidaIndex, 1);
      takePlayerTurn();
    } else {
      console.log("CPU no puedes lanzar esa carta");
      takeCpuTurn();
    }
  }

  takePlayerTurn();
}

const takeCard = () => {
  const deck = createDeck2();
  return deck[Math.floor(Math.random() * deck.length)];
};

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

// Function to create the deck of cards
function createDeck2() {
  const cards = Array(players.length * (numberOfCards + 3))
    .fill(null)
    .map((_, i) => {
      const cardsSpecial = randomCardSpecial();
      if (false) {
        return cardsSpecial;
      }

      return {
        color: colors[i % colors.length],
        number: i % 10,
        special: false,
        specialType: null,
      };
    });
  return cards.sort(() => Math.random() - 0.5);
}

const randomCardSpecial = () => {
  const probabilityCardSpecial = Math.random();
  if (probabilityCardSpecial > 0.75) {
    const specialCardsKeys = Object.keys(specialCards);
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

startGame();
