const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const serveur = http.createServer(app);
const io = new Server(serveur);

app.use(express.static("public"));

const parties = {};

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

io.on("connection", (socket) => {

  console.log("Un joueur est connecté");

  

  socket.on("creer-partie", (donnees, callback) => {

    let code = creerCode();

    while (parties[code]) {
      code = creerCode();
    }

    parties[code] = {
  joueurs: 1,
  partieIndex: donnees.partieIndex
};

    socket.join(code);
    socket.data.codePartie = code;

    callback({
  code: code,
  joueur: 1
});
    console.log("Partie créée :", code);
  });

  socket.on("rejoindre-partie", (code, callback) => {

    code = code.toUpperCase();

    if (!parties[code]) {
      callback({
        succes: false,
        message: "Cette partie n'existe pas."
      });

      return;
    }

    if (parties[code].joueurs >= 2) {
      callback({
        succes: false,
        message: "Cette partie est déjà complète."
      });

      return;
    }

    parties[code].joueurs++;

    socket.join(code);
    socket.data.codePartie = code;

    callback({
  succes: true,
  joueur: 2,
  partieIndex: parties[code].partieIndex
});

    io.to(code).emit(
      "joueurs-connectes",
      parties[code].joueurs
    );

    console.log("Joueur 2 rejoint :", code);
  });

  socket.on("jouer-case", (donnees) => {

  const code = socket.data.codePartie;

  if (!code) return;

  socket.to(code).emit("case-jouee", donnees);

});

socket.on("score-change", (donnees) => {

  const code = socket.data.codePartie;

  if (!code) return;

  io.to(code).emit("score-mis-a-jour", donnees);

});

  socket.on("disconnect", () => {

    const code = socket.data.codePartie;

    if (code && parties[code]) {

      parties[code].joueurs--;

      if (parties[code].joueurs <= 0) {
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

const PORT = process.env.PORT || 3000;

serveur.listen(PORT, () => {
  console.log("Serveur lancé sur le port " + PORT);
});