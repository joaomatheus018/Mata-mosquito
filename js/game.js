/* =========================================================
   VARIÁVEIS
========================================================= */

let vidas = 3;
let pontos = 0;
let nivel = 1;
let tempo = 60;

let jogoAtivo = false;

let mosquitoAtual = null;

let mosquitoTimer = null;
let cronometroTimer = null;

let tempoMosquito = 1500;

let recordeLocal = Number(
    localStorage.getItem("mosquito_recorde") || 0
);


/* =========================================================
   FUNDOS
========================================================= */

const fundos = [
    'url("img/Fundo 1.png")',
    'url("img/fundo 2.png")',
    'url("img/fundo 3.png")',
    'url("img/fundo 4.png")'
];


/* =========================================================
   INICIAR JOGO
========================================================= */

function iniciarJogo() {

    clearInterval(mosquitoTimer);
    clearInterval(cronometroTimer);

    mosquitoTimer = null;
    cronometroTimer = null;

    if (mosquitoAtual) {
        mosquitoAtual.remove();
        mosquitoAtual = null;
    }

    if (typeof pararControleMao === "function") {
        try {
            pararControleMao();
        } catch (erro) {
            console.warn("Erro ao parar controle da mão:", erro);
        }
    }

    vidas = 3;
    pontos = 0;
    nivel = 1;
    tempo = 60;
    tempoMosquito = 1500;

    jogoAtivo = true;

    const lobby =
        document.getElementById("lobby-screen");

    const game =
        document.getElementById("game-screen");

    if (lobby) {
        lobby.classList.add("hidden");
    }

    if (game) {
        game.classList.remove("hidden");
    }

    document.body.style.backgroundImage =
        fundos[0];

    esconderOverlay();

    atualizarHUD();

    iniciarCronometro();

    criarIntervaloMosquito();

    criarMosquito();


    /* =====================================================
       MODO MÃO
    ===================================================== */

    const camera =
        document.getElementById("camera-container");

    const cursor =
        document.getElementById("hand-cursor");

    if (
        typeof modoControle !== "undefined" &&
        modoControle === "mao"
    ) {

        if (camera) {
            camera.classList.remove("hidden");
        }

        if (cursor) {
            cursor.classList.remove("hidden");
        }

        if (typeof iniciarControleMao === "function") {
            iniciarControleMao();
        }

    } else {

        if (camera) {
            camera.classList.add("hidden");
        }

        if (cursor) {
            cursor.classList.add("hidden");
        }
    }
}


/* =========================================================
   CRONÔMETRO
========================================================= */

function iniciarCronometro() {

    clearInterval(cronometroTimer);

    cronometroTimer = setInterval(function () {

        if (!jogoAtivo) {
            return;
        }

        tempo--;

        atualizarHUD();

        if (tempo <= 0) {

            finalizarJogo(
                "TEMPO ESGOTADO",
                "O seu tempo acabou!"
            );
        }

    }, 1000);
}


/* =========================================================
   INTERVALO DO MOSQUITO
========================================================= */

function criarIntervaloMosquito() {

    clearInterval(mosquitoTimer);

    let tempoAtual = tempoMosquito;

    /*
    No modo mão o mosquito fica
    1.8x mais tempo na tela.
    */

    if (
        typeof modoControle !== "undefined" &&
        modoControle === "mao"
    ) {

        tempoAtual =
            tempoMosquito * 1.8;
    }

    mosquitoTimer = setInterval(function () {

        if (!jogoAtivo) {
            return;
        }

        if (mosquitoAtual) {

            mosquitoAtual.remove();

            mosquitoAtual = null;

            perderVida();

            if (!jogoAtivo) {
                return;
            }
        }

        criarMosquito();

    }, tempoAtual);
}


/* =========================================================
   CRIAR MOSQUITO
========================================================= */

function criarMosquito() {

    if (!jogoAtivo) {
        return;
    }

    if (mosquitoAtual) {

        mosquitoAtual.remove();

        mosquitoAtual = null;
    }

    const mosquito =
        document.createElement("img");

    mosquito.src =
        "img/mosquito.png";

    mosquito.className =
        "mosquito";

    mosquito.id =
        "mosquito";


    /* =====================================================
       TAMANHO
    ===================================================== */

    let tamanho = 110;

    if (nivel >= 2) {
        tamanho = 100;
    }

    if (nivel >= 3) {
        tamanho = 90;
    }

    if (nivel >= 4) {
        tamanho = 80;
    }

    if (nivel >= 5) {
        tamanho = 70;
    }

    if (nivel >= 7) {
        tamanho = 60;
    }

    if (nivel >= 10) {
        tamanho = 50;
    }

    mosquito.style.width =
        tamanho + "px";


    /* =====================================================
       POSIÇÃO
    ===================================================== */

    const margemX = 40;
    const margemTopo = 110;
    const margemBaixo = 40;

    const largura =
        window.innerWidth -
        tamanho -
        margemX;

    const altura =
        window.innerHeight -
        tamanho -
        margemTopo -
        margemBaixo;

    const x =
        Math.max(
            margemX,
            Math.random() *
            Math.max(largura, 100)
        );

    const y =
        margemTopo +
        Math.random() *
        Math.max(altura, 100);

    mosquito.style.left =
        x + "px";

    mosquito.style.top =
        y + "px";


    /* =====================================================
       DIREÇÃO
    ===================================================== */

    if (Math.random() > 0.5) {

        mosquito.style.transform =
            "scaleX(-1)";
    }


    /* =====================================================
       MOUSE
    ===================================================== */

    mosquito.addEventListener(
        "click",
        function (evento) {

            evento.stopPropagation();

            if (modoControle === "mouse") {
                capturarMosquito();
            }
        }
    );


    const area =
        document.getElementById("game-area");

    if (!area) {
        return;
    }

    area.appendChild(mosquito);

    mosquitoAtual =
        mosquito;
}


/* =========================================================
   CAPTURAR MOSQUITO
========================================================= */

function capturarMosquito() {

    if (!jogoAtivo) {
        return;
    }

    if (!mosquitoAtual) {
        return;
    }

    const mosquitoCapturado =
        mosquitoAtual;

    mosquitoAtual = null;

    mosquitoCapturado.classList.add("dead");

    pontos++;


    /* =====================================================
       RECORDE
    ===================================================== */

    if (pontos > recordeLocal) {

        recordeLocal =
            pontos;

        localStorage.setItem(
            "mosquito_recorde",
            recordeLocal
        );
    }


    atualizarNivel();

    atualizarHUD();


    setTimeout(function () {

        if (
            mosquitoCapturado &&
            mosquitoCapturado.parentNode
        ) {

            mosquitoCapturado.remove();
        }

    }, 150);


    setTimeout(function () {

        if (jogoAtivo) {
            criarMosquito();
        }

    }, 100);
}


/* =========================================================
   NÍVEL / DIFICULDADE
========================================================= */

function atualizarNivel() {

    /*
    A cada 25 pontos sobe um nível.
    */

    const novoNivel =
        Math.floor(pontos / 25) + 1;

    if (novoNivel <= nivel) {
        return;
    }

    nivel =
        novoNivel;


    /* Troca o fundo */

    mudarFundo();


    /* Aumenta dificuldade */

    tempoMosquito =
        Math.max(
            350,
            1500 -
            ((nivel - 1) * 180)
        );


    criarIntervaloMosquito();

    mostrarNivel();
}


/* =========================================================
   MUDAR FUNDO
========================================================= */

function mudarFundo() {

    const indice =
        (nivel - 1) %
        fundos.length;

    document.body.style.backgroundImage =
        fundos[indice];
}


/* =========================================================
   AVISO DE NÍVEL
========================================================= */

function mostrarNivel() {

    const aviso =
        document.createElement("div");

    aviso.className =
        "level-up-message";

    aviso.textContent =
        "NÍVEL " + nivel;

    document.body.appendChild(
        aviso
    );

    setTimeout(function () {

        if (aviso.parentNode) {
            aviso.remove();
        }

    }, 1500);
}


/* =========================================================
   PERDER VIDA
========================================================= */

function perderVida() {

    if (!jogoAtivo) {
        return;
    }

    vidas--;

    atualizarHUD();

    if (vidas <= 0) {

        finalizarJogo(
            "GAME OVER",
            "Você perdeu todas as suas vidas!"
        );
    }
}


/* =========================================================
   HUD
========================================================= */

function atualizarHUD() {

    const score =
        document.getElementById(
            "score-display"
        );

    const highscore =
        document.getElementById(
            "highscore-display"
        );

    const level =
        document.getElementById(
            "level-display"
        );

    const lives =
        document.getElementById(
            "lives-display"
        );

    const time =
        document.getElementById(
            "time-display"
        );


    if (score) {
        score.textContent =
            pontos;
    }

    if (highscore) {
        highscore.textContent =
            recordeLocal;
    }

    if (level) {
        level.textContent =
            nivel;
    }

    if (time) {
        time.textContent =
            tempo;
    }

    if (lives) {

        let coracoes = "";

        for (
            let i = 0;
            i < vidas;
            i++
        ) {

            coracoes += "❤️";
        }

        lives.textContent =
            coracoes || "💔";
    }
}


/* =========================================================
   FINALIZAR JOGO
========================================================= */

function finalizarJogo(
    titulo,
    mensagem
) {

    if (!jogoAtivo) {
        return;
    }

    jogoAtivo = false;

    clearInterval(
        cronometroTimer
    );

    clearInterval(
        mosquitoTimer
    );

    cronometroTimer = null;
    mosquitoTimer = null;


    if (mosquitoAtual) {

        mosquitoAtual.remove();

        mosquitoAtual = null;
    }


    if (
        typeof pararControleMao ===
        "function"
    ) {

        try {
            pararControleMao();
        } catch (erro) {
            console.warn(
                "Erro ao parar câmera:",
                erro
            );
        }
    }


    const camera =
        document.getElementById(
            "camera-container"
        );

    const cursor =
        document.getElementById(
            "hand-cursor"
        );

    if (camera) {
        camera.classList.add("hidden");
    }

    if (cursor) {
        cursor.classList.add("hidden");
    }


    const overlay =
        document.getElementById(
            "game-overlay"
        );

    const title =
        document.getElementById(
            "overlay-title"
        );

    const msg =
        document.getElementById(
            "overlay-msg"
        );

    const finalScore =
        document.getElementById(
            "final-score"
        );


    if (title) {
        title.textContent =
            titulo;
    }

    if (msg) {
        msg.textContent =
            mensagem;
    }

    if (finalScore) {
        finalScore.textContent =
            pontos;
    }


    const recordMessage =
        document.getElementById(
            "record-message"
        );

    if (recordMessage) {

        if (
            pontos === recordeLocal &&
            pontos > 0
        ) {

            recordMessage.classList.remove(
                "hidden"
            );

        } else {

            recordMessage.classList.add(
                "hidden"
            );
        }
    }


    if (overlay) {
        overlay.classList.remove(
            "hidden"
        );
    }


    if (
        typeof salvarPontuacaoOnline ===
        "function"
    ) {

        salvarPontuacaoOnline();
    }
}


/* =========================================================
   REINICIAR
========================================================= */

function reiniciarJogo() {

    jogoAtivo = false;

    clearInterval(
        cronometroTimer
    );

    clearInterval(
        mosquitoTimer
    );

    cronometroTimer = null;
    mosquitoTimer = null;


    if (mosquitoAtual) {

        mosquitoAtual.remove();

        mosquitoAtual = null;
    }


    if (
        typeof pararControleMao ===
        "function"
    ) {

        try {
            pararControleMao();
        } catch (erro) {
            console.warn(
                "Erro ao reiniciar câmera:",
                erro
            );
        }
    }


    esconderOverlay();


    setTimeout(function () {

        iniciarJogo();

    }, 300);
}


/* =========================================================
   ESCONDER OVERLAY
========================================================= */

function esconderOverlay() {

    const overlay =
        document.getElementById(
            "game-overlay"
        );

    if (overlay) {

        overlay.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   VOLTAR AO MENU
========================================================= */

function voltarAoMenu() {

    jogoAtivo = false;

    clearInterval(
        cronometroTimer
    );

    clearInterval(
        mosquitoTimer
    );

    cronometroTimer = null;
    mosquitoTimer = null;


    if (mosquitoAtual) {

        mosquitoAtual.remove();

        mosquitoAtual = null;
    }


    if (
        typeof pararControleMao ===
        "function"
    ) {

        try {
            pararControleMao();
        } catch (erro) {
            console.warn(
                "Erro ao parar câmera:",
                erro
            );
        }
    }


    const game =
        document.getElementById(
            "game-screen"
        );

    const lobby =
        document.getElementById(
            "lobby-screen"
        );


    if (game) {
        game.classList.add("hidden");
    }

    if (lobby) {
        lobby.classList.remove("hidden");
    }


    document.body.style.backgroundImage =
        'url("img/lobby.png")';


    esconderOverlay();


    if (
        typeof carregarRankingOnline ===
        "function"
    ) {

        carregarRankingOnline();
    }
}