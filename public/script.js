const sudoku = document.getElementById("sudoku");
let caseSelectionnee = null;
let numeroJoueur = null;
let codePartieActuelle = null;

let score = 0;
let casesCorrectes = 0;


const affichageScoreJoueur1 =
  document.getElementById("score-joueur1");

const affichageScoreJoueur2 =
  document.getElementById("score-joueur2");

const parties = [
  {
    difficulte: "facile",

    grille: [
      5,3,0, 0,7,0, 0,0,0,
      6,0,0, 1,9,5, 0,0,0,
      0,9,8, 0,0,0, 0,6,0,

      8,0,0, 0,6,0, 0,0,3,
      4,0,0, 8,0,3, 0,0,1,
      7,0,0, 0,2,0, 0,0,6,

      0,6,0, 0,0,0, 2,8,0,
      0,0,0, 4,1,9, 0,0,5,
      0,0,0, 0,8,0, 0,7,9
    ],

    solution: [
      5,3,4, 6,7,8, 9,1,2,
      6,7,2, 1,9,5, 3,4,8,
      1,9,8, 3,4,2, 5,6,7,

      8,5,9, 7,6,1, 4,2,3,
      4,2,6, 8,5,3, 7,9,1,
      7,1,3, 9,2,4, 8,5,6,

      9,6,1, 5,3,7, 2,8,4,
      2,8,7, 4,1,9, 6,3,5,
      3,4,5, 2,8,6, 1,7,9
    ]
  },

  {
    difficulte: "moyen",
    grille: [
      0,0,0, 2,6,0, 7,0,1,
      6,8,0, 0,7,0, 0,9,0,
      1,9,0, 0,0,4, 5,0,0,

      8,2,0, 1,0,0, 0,4,0,
      0,0,4, 6,0,2, 9,0,0,
      0,5,0, 0,0,3, 0,2,8,

      0,0,9, 3,0,0, 0,7,4,
      0,4,0, 0,5,0, 0,3,6,
      7,0,3, 0,1,8, 0,0,0
    ],

    solution: [
      4,3,5, 2,6,9, 7,8,1,
      6,8,2, 5,7,1, 4,9,3,
      1,9,7, 8,3,4, 5,6,2,

      8,2,6, 1,9,5, 3,4,7,
      3,7,4, 6,8,2, 9,1,5,
      9,5,1, 7,4,3, 6,2,8,

      5,1,9, 3,2,6, 8,7,4,
      2,4,8, 9,5,7, 1,3,6,
      7,6,3, 4,1,8, 2,5,9
    ]
  }

  ,
{
  difficulte: "difficile",

  grille: [
    1,0,0, 0,0,7, 0,9,0,
    0,3,0, 0,2,0, 0,0,8,
    0,0,9, 6,0,0, 5,0,0,

    0,0,5, 3,0,0, 9,0,0,
    0,1,0, 0,8,0, 0,0,2,
    6,0,0, 0,0,4, 0,0,0,

    3,0,0, 0,0,0, 0,1,0,
    0,4,0, 0,0,0, 0,0,7,
    0,0,7, 0,0,0, 3,0,0
  ],

  solution: [
    1,6,2, 8,5,7, 4,9,3,
    5,3,4, 1,2,9, 6,7,8,
    7,8,9, 6,4,3, 5,2,1,

    4,7,5, 3,1,2, 9,8,6,
    9,1,3, 5,8,6, 7,4,2,
    6,2,8, 7,9,4, 1,3,5,

    3,5,6, 4,7,8, 2,1,9,
    2,4,1, 9,3,5, 8,6,7,
    8,9,7, 2,6,1, 3,5,4
  ]
}
];

const params = new URLSearchParams(window.location.search);

const difficulteChoisie =
  params.get("difficulte") || "facile";

const partiesFiltrees = parties.filter(
  partie => partie.difficulte === difficulteChoisie
);

const partieChoisie =
  partiesFiltrees[Math.floor(Math.random() * partiesFiltrees.length)];

let grille = partieChoisie.grille;
let solution = partieChoisie.solution;

let nombreCasesVides =
  grille.filter(nombre => nombre === 0).length;

  function surlignerChiffre(chiffre) {

  const cases = document.querySelectorAll(".case");

  cases.forEach((caseSudoku) => {

    caseSudoku.classList.remove("meme-chiffre");

    if (
      chiffre !== "" &&
      caseSudoku.textContent === chiffre
    ) {
      caseSudoku.classList.add("meme-chiffre");
    }

  });

}

for (let i = 0; i < 81; i++) {

  const caseSudoku = document.createElement("div");

  caseSudoku.classList.add("case");
  caseSudoku.dataset.index = i;

  if (grille[i] !== 0) {
    caseSudoku.textContent = grille[i];
    caseSudoku.classList.add("fixe");
  }

  caseSudoku.addEventListener("click", () => {

  surlignerChiffre(caseSudoku.textContent);

  if (
    caseSudoku.classList.contains("fixe") ||
    caseSudoku.classList.contains("verrouillee")
  ) return;

    if (caseSelectionnee) {
      caseSelectionnee.classList.remove("selectionnee");
    }

    caseSudoku.classList.add("selectionnee");
    caseSelectionnee = caseSudoku;
  });

  sudoku.appendChild(caseSudoku);
}

function chargerPartie(indexPartie) {

  const nouvellePartie = parties[indexPartie];

  grille = nouvellePartie.grille;
  solution = nouvellePartie.solution;

  nombreCasesVides =
    grille.filter(nombre => nombre === 0).length;

  score = 0;
  casesCorrectes = 0;
  caseSelectionnee = null;

  affichageScoreJoueur1.textContent = 0;
  affichageScoreJoueur2.textContent = 0;

  const cases = document.querySelectorAll(".case");

  cases.forEach((caseSudoku, index) => {

    caseSudoku.textContent = "";

    caseSudoku.classList.remove(
      "fixe",
      "verrouillee",
      "correcte",
      "faux",
      "selectionnee",
      "joueur1",
      "joueur2"
    );

    if (grille[index] !== 0) {
      caseSudoku.textContent = grille[index];
      caseSudoku.classList.add("fixe");
    }

  });
}

const boutonsChiffres = document.querySelectorAll("#chiffres button");

boutonsChiffres.forEach((bouton) => {

  bouton.addEventListener("click", () => {

    if (!caseSelectionnee) return;

    const index = Number(caseSelectionnee.dataset.index);

    if (bouton.id === "effacer") {

      caseSelectionnee.textContent = "";
      caseSelectionnee.classList.remove("faux");

    } else {

      const chiffre = Number(bouton.textContent);

      caseSelectionnee.textContent = chiffre;

      if (chiffre === solution[index]) {

  score++;
  casesCorrectes++;
  if (codePartieActuelle) {
  socket.emit("score-change", {
    joueur: numeroJoueur,
    score: score
  });
}
  if (numeroJoueur === 2) {
  affichageScoreJoueur2.textContent = score;
} else {
  affichageScoreJoueur1.textContent = score;
}

  caseSelectionnee.classList.remove("faux");
  caseSelectionnee.classList.add("correcte");
  caseSelectionnee.classList.add("verrouillee");
verifierFinPartie();
if (codePartieActuelle) {
  socket.emit("jouer-case", {
    index: index,
    chiffre: chiffre,
    joueur: numeroJoueur
  });
}
if (numeroJoueur === 1) {
  caseSelectionnee.classList.add("joueur1");
}

if (numeroJoueur === 2) {
  caseSelectionnee.classList.add("joueur2");
}

  caseSelectionnee = null;

} else {

  score--;
  if (codePartieActuelle) {
  socket.emit("score-change", {
    joueur: numeroJoueur,
    score: score
  });
}
  if (numeroJoueur === 2) {
  affichageScoreJoueur2.textContent = score;
} else {
  affichageScoreJoueur1.textContent = score;
}

  caseSelectionnee.classList.add("faux");

}

    }

  });

});

const boutonNouvellePartie = document.getElementById("nouvelle-partie");

boutonNouvellePartie.addEventListener("click", () => {
  location.reload();
});

const boutonsDifficulte =
  document.querySelectorAll("#difficulte button");

boutonsDifficulte.forEach((bouton) => {

  bouton.addEventListener("click", () => {

    const difficulte = bouton.dataset.difficulte;

    window.location.search =
      "?difficulte=" + difficulte;

  });

});

const socket = io();

const boutonCreerPartie =
  document.getElementById("creer-partie");

const boutonRejoindrePartie =
  document.getElementById("rejoindre-partie");

const champCodePartie =
  document.getElementById("code-partie");

const infoPartie =
  document.getElementById("info-partie");


boutonCreerPartie.addEventListener("click", () => {

  socket.emit(
  "creer-partie",
  {
    partieIndex: parties.indexOf(partieChoisie)
  },
  (reponse) => {

    numeroJoueur = 1;
codePartieActuelle = reponse.code;

  infoPartie.textContent =
    "Vous êtes Joueur 1 — Code : " +
    reponse.code +
    " — En attente du joueur 2...";

});

});


boutonRejoindrePartie.addEventListener("click", () => {

  const code = champCodePartie.value.trim();

  if (code === "") return;

  socket.emit(
    "rejoindre-partie",
    code,
    (reponse) => {

      if (reponse.succes) {
        chargerPartie(reponse.partieIndex);

        numeroJoueur = 2;
codePartieActuelle = code.toUpperCase();

  infoPartie.textContent =
    "Vous êtes Joueur 2 — Partie rejointe !";

}
 else {

        infoPartie.textContent =
          reponse.message;

      }

    }
  );

  }
);


socket.on("joueurs-connectes", (nombre) => {

  if (nombre === 2) {
    infoPartie.textContent =
      "🟢 Les deux joueurs sont connectés !";
  }

});

function verifierFinPartie() {

  const casesRemplies =
    document.querySelectorAll(".verrouillee").length;

  if (casesRemplies === nombreCasesVides) {

    const scoreJoueur1 =
      document.getElementById("score-joueur1").textContent;

    const scoreJoueur2 =
      document.getElementById("score-joueur2").textContent;

    alert(
      "Sudoku terminé !\n\n" +
      "Joueur 1 : " + scoreJoueur1 + " points\n" +
      "Joueur 2 : " + scoreJoueur2 + " points"
    );

  }

}

socket.on("case-jouee", (donnees) => {


  const cases = document.querySelectorAll(".case");
  const caseRecue = cases[donnees.index];

  caseRecue.textContent = donnees.chiffre;
  caseRecue.classList.remove("faux");
  caseRecue.classList.add("correcte");
  caseRecue.classList.add("verrouillee");
if (donnees.joueur === 1) {
  caseRecue.classList.add("joueur1");
}

if (donnees.joueur === 2) {
  caseRecue.classList.add("joueur2");
}
});

socket.on("score-mis-a-jour", (donnees) => {

  if (donnees.joueur === 1) {
    affichageScoreJoueur1.textContent = donnees.score;
  }

  if (donnees.joueur === 2) {
    affichageScoreJoueur2.textContent = donnees.score;
  }

});
