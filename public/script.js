const sudoku =
  document.getElementById("sudoku");

let caseSelectionnee = null;

let numeroJoueur = null;
let codePartieActuelle = null;

let score = 0;
let casesCorrectes = 0;

const zoneChiffres =
  document.getElementById("chiffres");

function cacherJeu() {
  sudoku.style.display = "none";
  zoneChiffres.style.display = "none";
}

function afficherJeu() {
  sudoku.style.display = "grid";
  zoneChiffres.style.display = "flex";
}

let grille =
  new Array(81).fill(0);

let solution =
  new Array(81).fill(0);

let nombreCasesVides = 81;

let partieChargee = false;


const affichageScoreJoueur1 =
  document.getElementById(
    "score-joueur1"
  );

const affichageScoreJoueur2 =
  document.getElementById(
    "score-joueur2"
  );


// ================================
// DIFFICULTÉ
// ================================

const params =
  new URLSearchParams(
    window.location.search
  );

const difficulteChoisie =
  params.get("difficulte") ||
  "facile";

  const affichageDifficulte =
  document.getElementById("difficulte-actuelle");

function afficherDifficulte(difficulte) {

  affichageDifficulte.textContent =
    "Difficulté : " +
    difficulte.charAt(0).toUpperCase() +
    difficulte.slice(1);

  document
    .querySelectorAll("#difficulte button")
    .forEach((bouton) => {

      bouton.classList.toggle(
        "actif",
        bouton.dataset.difficulte === difficulte
      );

    });
}

afficherDifficulte(difficulteChoisie);

// ================================
// SURBRILLANCE
// ================================

function surlignerChiffre(chiffre) {

  const cases =
    document.querySelectorAll(".case");

  cases.forEach(
    (caseSudoku) => {

      caseSudoku.classList.remove(
        "meme-chiffre"
      );

      if (
        chiffre !== "" &&
        caseSudoku.textContent === chiffre
      ) {

        caseSudoku.classList.add(
          "meme-chiffre"
        );

      }

    }
  );

}


// ================================
// CRÉATION DES 81 CASES
// ================================

for (let i = 0; i < 81; i++) {

  const caseSudoku =
    document.createElement("div");

  caseSudoku.classList.add("case");

  caseSudoku.dataset.index = i;


  caseSudoku.addEventListener(
    "click",
    () => {

      surlignerChiffre(
        caseSudoku.textContent
      );

      if (!partieChargee) {
        return;
      }

      if (
        caseSudoku.classList.contains(
          "fixe"
        ) ||
        caseSudoku.classList.contains(
          "verrouillee"
        )
      ) {
        return;
      }

      if (caseSelectionnee) {

        caseSelectionnee.classList.remove(
          "selectionnee"
        );

      }

      caseSudoku.classList.add(
        "selectionnee"
      );

      caseSelectionnee =
        caseSudoku;

    }
  );


  sudoku.appendChild(
    caseSudoku
  );

}


// ================================
// CHARGER UNE GRILLE
// ================================

function chargerPartie(
  nouvelleGrille,
  nouvelleSolution
) {

  grille =
    [...nouvelleGrille];

  solution =
    [...nouvelleSolution];

  nombreCasesVides =
    grille.filter(
      nombre => nombre === 0
    ).length;

  score = 0;
  casesCorrectes = 0;

  caseSelectionnee = null;

  partieChargee = true;

  affichageScoreJoueur1.textContent = 0;
  affichageScoreJoueur2.textContent = 0;

  const cases =
    document.querySelectorAll(".case");


  cases.forEach(
    (caseSudoku, index) => {

      caseSudoku.textContent = "";

      caseSudoku.classList.remove(
        "fixe",
        "verrouillee",
        "correcte",
        "faux",
        "selectionnee",
        "joueur1",
        "joueur2",
        "meme-chiffre"
      );

      if (grille[index] !== 0) {

        caseSudoku.textContent =
          grille[index];

        caseSudoku.classList.add(
          "fixe"
        );

      }

    }
  );

}


// ================================
// CHIFFRES 1 À 9
// ================================

const boutonsChiffres =
  document.querySelectorAll(
    "#chiffres button"
  );


boutonsChiffres.forEach(
  (bouton) => {

    bouton.addEventListener(
      "click",
      () => {

        if (!caseSelectionnee) {
          return;
        }

        const index =
          Number(
            caseSelectionnee.dataset.index
          );


        if (
          bouton.id === "effacer"
        ) {

          caseSelectionnee.textContent =
            "";

          caseSelectionnee.classList.remove(
            "faux"
          );

          return;
        }


        const chiffre =
          Number(
            bouton.textContent
          );

        caseSelectionnee.textContent =
          chiffre;


        // BONNE RÉPONSE
        if (
          chiffre === solution[index]
        ) {

          score++;
          casesCorrectes++;


          if (
            codePartieActuelle
          ) {

            socket.emit(
              "score-change",
              {
                joueur:
                  numeroJoueur,

                score:
                  score
              }
            );

          }


          if (
            numeroJoueur === 2
          ) {

            affichageScoreJoueur2
              .textContent =
              score;

          } else {

            affichageScoreJoueur1
              .textContent =
              score;

          }


          caseSelectionnee
            .classList
            .remove("faux");

          caseSelectionnee
            .classList
            .add("correcte");

          caseSelectionnee
            .classList
            .add("verrouillee");


          if (
            numeroJoueur === 1
          ) {

            caseSelectionnee
              .classList
              .add("joueur1");

          }

          if (
            numeroJoueur === 2
          ) {

            caseSelectionnee
              .classList
              .add("joueur2");

          }


          if (
            codePartieActuelle
          ) {

            socket.emit(
              "jouer-case",
              {
                index: index,
                chiffre: chiffre,
                joueur:
                  numeroJoueur
              }
            );

          }


          

          caseSelectionnee = null;

        }

        // MAUVAISE RÉPONSE
        else {

          score--;


          if (
            codePartieActuelle
          ) {

            socket.emit(
              "score-change",
              {
                joueur:
                  numeroJoueur,

                score:
                  score
              }
            );

          }


          if (
            numeroJoueur === 2
          ) {

            affichageScoreJoueur2
              .textContent =
              score;

          } else {

            affichageScoreJoueur1
              .textContent =
              score;

          }


          caseSelectionnee
            .classList
            .add("faux");

        }

      }
    );

  }
);


// ================================
// NOUVELLE PARTIE
// ================================

const boutonNouvellePartie =
  document.getElementById(
    "nouvelle-partie"
  );

boutonNouvellePartie.addEventListener(
  "click",
  () => {

    location.reload();

  }
);


// ================================
// BOUTONS DIFFICULTÉ
// ================================

const boutonsDifficulte =
  document.querySelectorAll(
    "#difficulte button"
  );


boutonsDifficulte.forEach(
  (bouton) => {

    bouton.addEventListener(
      "click",
      () => {

        const difficulte =
          bouton.dataset.difficulte;

        window.location.search =
          "?difficulte=" +
          difficulte;

      }
    );

  }
);


// ================================
// SOCKET.IO
// ================================

const socket = io();


const boutonCreerPartie =
  document.getElementById(
    "creer-partie"
  );

const boutonRejoindrePartie =
  document.getElementById(
    "rejoindre-partie"
  );

const champCodePartie =
  document.getElementById(
    "code-partie"
  );

const infoPartie =
  document.getElementById(
    "info-partie"
  );


// CRÉER
boutonCreerPartie.addEventListener(
  "click",
  () => {

    infoPartie.textContent =
      "Création du Sudoku...";

    socket.emit(
      "creer-partie",
      {
        difficulte:
          difficulteChoisie
      },
      (reponse) => {

        numeroJoueur = 1;

        codePartieActuelle =
          reponse.code;

        chargerPartie(
          reponse.grille,
          reponse.solution
        );

        cacherJeu();
        infoPartie.textContent =
  "⏳ En attente du Joueur 2... Code : " +
  reponse.code;

        infoPartie.textContent =
          "Vous êtes Joueur 1 — Code : " +
          reponse.code +
          " — En attente du joueur 2...";

      }
    );

  }
);


// REJOINDRE
boutonRejoindrePartie.addEventListener(
  "click",
  () => {

    const code =
      champCodePartie
        .value
        .trim();

    if (code === "") {
      return;
    }


    socket.emit(
      "rejoindre-partie",
      code,
      (reponse) => {

        if (
          reponse.succes
        ) {

          numeroJoueur = 2;

          codePartieActuelle =
            code.toUpperCase();

          chargerPartie(
            reponse.grille,
            reponse.solution
          );

          afficherJeu();

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


// ================================
// DEUX JOUEURS CONNECTÉS
// ================================

socket.on(
  "joueurs-connectes",
  (nombre) => {

    if (nombre === 2) {

       afficherJeu();

      infoPartie.textContent =
        "🟢 Les deux joueurs sont connectés !";

    }

  }
);


// ================================
// FIN DE PARTIE
// ================================


// ================================
// CASE JOUÉE PAR L'AUTRE
// ================================

socket.on(
  "case-jouee",
  (donnees) => {

    const cases =
      document.querySelectorAll(
        ".case"
      );

    const caseRecue =
      cases[donnees.index];


    // Si on avait nous-même
    // sélectionné cette case
    if (
      caseSelectionnee ===
      caseRecue
    ) {

      caseSelectionnee = null;

    }


    caseRecue.textContent =
      donnees.chiffre;

    caseRecue.classList.remove(
      "faux",
      "selectionnee"
    );

    caseRecue.classList.add(
      "correcte",
      "verrouillee"
    );


    if (
      donnees.joueur === 1
    ) {

      caseRecue.classList.add(
        "joueur1"
      );

    }


    if (
      donnees.joueur === 2
    ) {

      caseRecue.classList.add(
        "joueur2"
      );

    }


    

  }
);


// ================================
// SCORE DE L'AUTRE JOUEUR
// ================================

socket.on(
  "score-mis-a-jour",
  (donnees) => {

    if (
      donnees.joueur === 1
    ) {

      affichageScoreJoueur1
        .textContent =
        donnees.score;

    }


    if (
      donnees.joueur === 2
    ) {

      affichageScoreJoueur2
        .textContent =
        donnees.score;

    }

  }
);

socket.on(
  "partie-terminee",
  (donnees) => {

    alert(
      "Sudoku terminé !\n\n" +
      "Joueur 1 : " +
      donnees.scoreJoueur1 +
      " points\n" +
      "Joueur 2 : " +
      donnees.scoreJoueur2 +
      " points"
    );

  }
);
