function jogar() {
    const lobby = document.getElementById("lobby-screen");
    const game = document.getElementById("game-screen");

    if (lobby) {
        lobby.classList.add("hidden");
    }

    if (game) {
        game.classList.remove("hidden");
    }

    // Inicia o jogo
    if (typeof iniciarJogo === "function") {
        iniciarJogo();
    } else if (typeof reiniciarIntervaloMosquito === "function") {
        reiniciarIntervaloMosquito();
    }
}