const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const serveur = http.createServer(app);
const io = new Server(serveur);

app.use(express.static("public"));

const parties = {};


// ================================
// CRÉATION DU CODE DE PARTIE
// ================================

function creerCode() {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += caracteres[
      Math.floor(Math.random() * caracteres.length)
    ];
  }

  return code;
}


// ================================
// GÉNÉRATEUR DE SUDOKU
// ================================

function melanger(tableau) {

  const copie = [...tableau];

  for (let i = copie.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [copie[i], copie[j]] =
      [copie[j], copie[i]];
  }

  return copie;
}


function nombreValide(grille, index, nombre) {

  const ligne = Math.floor(index / 9);
  const colonne = index % 9;

  // Ligne
  for (let c = 0; c < 9; c++) {

    if (grille[ligne * 9 + c] === nombre) {
      return false;
    }

  }

  // Colonne
  for (let l = 0; l < 9; l++) {

    if (grille[l * 9 + colonne] === nombre) {
      return false;
    }

  }

  // Bloc 3x3
  const debutLigne =
    Math.floor(ligne / 3) * 3;

  const debutColonne =
    Math.floor(colonne / 3) * 3;

  for (let l = 0; l < 3; l++) {

    for (let c = 0; c < 3; c++) {

      const position =
        (debutLigne + l) * 9 +
        debutColonne + c;

      if (grille[position] === nombre) {
        return false;
      }

    }

  }

  return true;
}


function remplirSolution(grille) {

  const index =
    grille.findIndex(nombre => nombre === 0);

  if (index === -1) {
    return true;
  }

  const nombres =
    melanger([1,2,3,4,5,6,7,8,9]);

  for (const nombre of nombres) {

    if (nombreValide(grille, index, nombre)) {

      grille[index] = nombre;

      if (remplirSolution(grille)) {
        return true;
      }

      grille[index] = 0;
    }

  }

  return false;
}


// Compte jusqu'à 2 solutions.
// Dès qu'il en trouve 2, on sait que la grille
// n'a pas une solution unique.
function compterSolutions(grille, limite = 2) {

  let meilleurIndex = -1;
  let meilleursCandidats = null;

  for (let index = 0; index < 81; index++) {

    if (grille[index] !== 0) {
      continue;
    }

    const candidats = [];

    for (let nombre = 1; nombre <= 9; nombre++) {

      if (nombreValide(grille, index, nombre)) {
        candidats.push(nombre);
      }

    }

    if (candidats.length === 0) {
      return 0;
    }

    if (
      meilleursCandidats === null ||
      candidats.length < meilleursCandidats.length
    ) {

      meilleurIndex = index;
      meilleursCandidats = candidats;

      if (candidats.length === 1) {
        break;
      }

    }

  }

  if (meilleurIndex === -1) {
    return 1;
  }

  let total = 0;

  for (const nombre of meilleursCandidats) {

    grille[meilleurIndex] = nombre;

    total += compterSolutions(
      grille,
      limite - total
    );

    grille[meilleurIndex] = 0;

    if (total >= limite) {
      return total;
    }

  }

  return total;
}


function genererSudoku(difficulte) {

  const nombresDonnes = {
    facile: 40,
    moyen: 34,
    difficile: 29
  };

  const objectif =
    nombresDonnes[difficulte] || 40;

  let meilleureGrille = null;
  let meilleureSolution = null;
  let meilleurNombre = 81;

  // Plusieurs essais permettent d'obtenir
  // plus facilement le nombre de cases souhaité.
  for (let tentative = 0; tentative < 4; tentative++) {

    const solution =
      new Array(81).fill(0);

    remplirSolution(solution);

    const grille = [...solution];

    const positions =
      melanger(
        Array.from({ length: 81 }, (_, i) => i)
      );

    let casesRestantes = 81;

    for (const position of positions) {

      if (casesRestantes <= objectif) {
        break;
      }

      const ancienNombre =
        grille[position];

      grille[position] = 0;

      const copie = [...grille];

      const nombreSolutions =
        compterSolutions(copie, 2);

      if (nombreSolutions !== 1) {

        grille[position] =
          ancienNombre;

      } else {

        casesRestantes--;

      }

    }

    if (casesRestantes < meilleurNombre) {

      meilleurNombre =
        casesRestantes;

      meilleureGrille =
        [...grille];

      meilleureSolution =
        [...solution];
    }

    if (casesRestantes <= objectif) {
      break;
    }

  }

  return {
    grille: meilleureGrille,
    solution: meilleureSolution
  };
}


// ================================
// MULTIJOUEUR
// ================================

io.on("connection", (socket) => {

  console.log("Un joueur est connecté");


  socket.on(
    "creer-partie",
    (donnees, callback) => {

      let code = creerCode();

      while (parties[code]) {
        code = creerCode();
      }

      const difficultesAutorisees =
        ["facile", "moyen", "difficile"];

      const difficulte =
        difficultesAutorisees.includes(
          donnees.difficulte
        )
          ? donnees.difficulte
          : "facile";

      const sudoku =
        genererSudoku(difficulte);

      parties[code] = {
  joueurs: 1,
  difficulte: difficulte,
  grille: sudoku.grille,
  solution: sudoku.solution,

  casesTrouvees: new Set(),

  scores: {
    1: 0,
    2: 0
  }
};

      socket.join(code);

      socket.data.codePartie = code;

      callback({
        code: code,
        joueur: 1,
        difficulte: difficulte,
        grille: sudoku.grille,
        solution: sudoku.solution
      });

      console.log(
        "Partie créée :",
        code,
        difficulte
      );

    }
  );


  socket.on(
    "rejoindre-partie",
    (code, callback) => {

      code =
        code.toUpperCase();

      if (!parties[code]) {

        callback({
          succes: false,
          message:
            "Cette partie n'existe pas."
        });

        return;
      }

      if (parties[code].joueurs >= 2) {

        callback({
          succes: false,
          message:
            "Cette partie est déjà complète."
        });

        return;
      }

      parties[code].joueurs++;

      socket.join(code);

      socket.data.codePartie = code;

      callback({
        succes: true,
        joueur: 2,
        difficulte:
          parties[code].difficulte,

        grille:
          parties[code].grille,

        solution:
          parties[code].solution
      });

      io.to(code).emit(
        "joueurs-connectes",
        parties[code].joueurs
      );

      console.log(
        "Joueur 2 rejoint :",
        code
      );

    }
  );


  socket.on("jouer-case", (donnees) => {

  const code =
    socket.data.codePartie;

  if (!code || !parties[code]) return;

  const partie =
    parties[code];

  partie.casesTrouvees.add(
    donnees.index
  );

  socket.to(code).emit(
    "case-jouee",
    donnees
  );

  const nombreCasesVides =
    partie.grille.filter(
      nombre => nombre === 0
    ).length;

  if (
    partie.casesTrouvees.size ===
    nombreCasesVides
  ) {

    io.to(code).emit(
      "partie-terminee",
      {
        scoreJoueur1:
          partie.scores[1],

        scoreJoueur2:
          partie.scores[2]
      }
    );

  }

});


socket.on("score-change", (donnees) => {

  const code =
    socket.data.codePartie;

  if (!code || !parties[code]) return;

  parties[code].scores[donnees.joueur] =
    donnees.score;

  io.to(code).emit(
    "score-mis-a-jour",
    donnees
  );

});

  socket.on("disconnect", () => {

    const code =
      socket.data.codePartie;

    if (
      code &&
      parties[code]
    ) {

      parties[code].joueurs--;

      if (
        parties[code].joueurs <= 0
      ) {

        delete parties[code];

      } else {

        io.to(code).emit(
          "joueurs-connectes",
          parties[code].joueurs
        );

      }

    }

  });

});


const PORT =
  process.env.PORT || 3000;

serveur.listen(PORT, () => {

  console.log(
    "Serveur lancé sur le port " + PORT
  );

});
