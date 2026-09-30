/*
=========================================================
CONFIGURAÇÃO DO LOBBY
=========================================================
*/

let modoControle = "mouse";


/*
=========================================================
ESCOLHER MODO
=========================================================
*/

function selecionarModo(modo) {

    modoControle = modo;

    const mouse =
        document.getElementById("mouse-mode");

    const mao =
        document.getElementById("hand-mode");


    mouse.classList.remove("selected");

    mao.classList.remove("selected");


    if (modo === "mouse") {

        mouse.classList.add("selected");

    } else {

        mao.classList.add("selected");

    }

}


/*
=========================================================
JOGAR
=========================================================
*/

function jogar() {

    const nomeInput =
        document.getElementById("player-name");

    let nome =
        nomeInput.value.trim();


    if (!nome) {

        nome = "Player";

    }


    if (nome.length > 16) {

        nome = nome.substring(0, 16);

    }


    window.playerName = nome;


    localStorage.setItem(
        "mosquito_nome",
        nome
    );


    iniciarJogo();

}


/*
=========================================================
CARREGAR NOME SALVO
=========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const nomeSalvo =
            localStorage.getItem(
                "mosquito_nome"
            );

        const input =
            document.getElementById(
                "player-name"
            );


        if (nomeSalvo && input) {

            input.value =
                nomeSalvo;

        }


        carregarRankingOnline();

    }
);