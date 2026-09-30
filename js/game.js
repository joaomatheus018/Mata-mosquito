/* =========================================================
   MATA MOSQUITO
   GAME.JS
========================================================= */


/* =========================================================
   VARIÁVEIS DO JOGO
========================================================= */

let vidas = 3;
let pontos = 0;
let nivel = 1;
let tempo = 60;

let jogoAtivo = false;

let mosquitoAtual = null;

let mosquitoTimer = null;
let cronometroTimer = null;


/*
=========================================================
TEMPO DO MOSQUITO
=========================================================

O valor é o tempo que cada mosquito permanece
na tela antes de fugir.

Agora o tempo pertence ao mosquito atual.
Isso evita o bug de um timer antigo matar
o mosquito seguinte.
*/

let tempoMosquito = 1800;


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

    /*
    Cancela timers antigos.
    */

    clearTimeout(mosquitoTimer);
    clearInterval(cronometroTimer);

    mosquitoTimer = null;
    cronometroTimer = null;


    /*
    Remove mosquito antigo.
    */

    if (mosquitoAtual) {

        mosquitoAtual.remove();

        mosquitoAtual = null;
    }


    /*
    Reinicia câmera/mão.
    */

    if (
        typeof pararControleMao ===
        "function"
    ) {

        try {

            pararControleMao();

        } catch (erro) {

            console.warn(
                "Erro ao parar controle da mão:",
                erro
            );
        }
    }


    /*
    Reinicia valores.
    */

    vidas = 3;
    pontos = 0;
    nivel = 1;
    tempo = 60;

    /*
    DIFICULDADE MAIS FÁCIL
    */

    tempoMosquito = 1800;

    jogoAtivo = true;


    /*
    Elementos do HTML.
    */

    const lobby =
        document.getElementById(
            "lobby-screen"
        );

    const game =
        document.getElementById(
            "game-screen"
        );


    /*
    Esconde lobby.
    */

    if (lobby) {

        lobby.classList.add(
            "hidden"
        );
    }


    /*
    Mostra jogo.
    */

    if (game) {

        game.classList.remove(
            "hidden"
        );
    }


    /*
    Começa com o primeiro fundo.
    */

    document.body.style.backgroundImage =
        fundos[0];


    /*
    Esconde tela de game over.
    */

    esconderOverlay();


    /*
    Atualiza HUD.
    */

    atualizarHUD();


    /*
    Inicia contador de 60 segundos.
    */

    iniciarCronometro();


    /*
    Cria o primeiro mosquito.
    */

    criarMosquito();


    /*
    =====================================================
       MODO MÃO
    =====================================================
    */

    const camera =
        document.getElementById(
            "camera-container"
        );

    const cursor =
        document.getElementById(
            "hand-cursor"
        );


    if (
        typeof modoControle !==
        "undefined" &&
        modoControle ===
        "mao"
    ) {

        if (camera) {

            camera.classList.remove(
                "hidden"
            );
        }


        if (cursor) {

            cursor.classList.remove(
                "hidden"
            );
        }


        if (
            typeof iniciarControleMao ===
            "function"
        ) {

            iniciarControleMao();
        }


    } else {

        if (camera) {

            camera.classList.add(
                "hidden"
            );
        }


        if (cursor) {

            cursor.classList.add(
                "hidden"
            );
        }
    }
}


/* =========================================================
   CRONÔMETRO DO JOGO
========================================================= */

function iniciarCronometro() {

    clearInterval(
        cronometroTimer
    );


    cronometroTimer =
        setInterval(
            function () {

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

            },
            1000
        );
}


/* =========================================================
   TIMER DO MOSQUITO
========================================================= */

/*
IMPORTANTE:

Antes o jogo usava setInterval() para controlar
todos os mosquitos.

Isso fazia o timer continuar correndo mesmo depois
que o mosquito era capturado.

Agora usamos um setTimeout() separado para cada
mosquito.

Quando ele é capturado, esse timeout é cancelado.

Isso corrige o bug de:

"clicar no mosquito -> mosquito some -> perde vida"
*/

function criarIntervaloMosquito() {

    /*
    Cancela timer anterior.
    */

    clearTimeout(
        mosquitoTimer
    );

    mosquitoTimer = null;


    if (!jogoAtivo) {

        return;
    }


    /*
    Define tempo do mosquito.
    */

    let tempoAtual =
        tempoMosquito;


    /*
    No modo mão damos mais tempo.
    */

    if (
        typeof modoControle !==
        "undefined" &&
        modoControle ===
        "mao"
    ) {

        tempoAtual =
            tempoMosquito * 1.8;
    }


    /*
    Cria um ÚNICO timer para
    o mosquito atual.
    */

    mosquitoTimer =
        setTimeout(
            function () {

                /*
                Se o jogo acabou,
                não faz nada.
                */

                if (!jogoAtivo) {

                    return;
                }


                /*
                Se não existe mosquito,
                não perde vida.
                */

                if (!mosquitoAtual) {

                    return;
                }


                /*
                Guarda referência.
                */

                const mosquitoQueFugiu =
                    mosquitoAtual;


                /*
                IMPORTANTE:

                Primeiro tira a referência.
                */

                mosquitoAtual = null;


                /*
                Remove o mosquito.
                */

                if (
                    mosquitoQueFugiu.parentNode
                ) {

                    mosquitoQueFugiu.remove();
                }


                /*
                Perde uma vida.
                */

                perderVida();


                /*
                Se ainda estiver jogando,
                cria outro.
                */

                if (jogoAtivo) {

                    criarMosquito();
                }

            },
            tempoAtual
        );
}


/* =========================================================
   CRIAR MOSQUITO
========================================================= */

function criarMosquito() {

    if (!jogoAtivo) {

        return;
    }


    /*
    Remove qualquer mosquito anterior.
    */

    if (mosquitoAtual) {

        mosquitoAtual.remove();

        mosquitoAtual = null;
    }


    /*
    Cancela qualquer timer antigo.
    */

    clearTimeout(
        mosquitoTimer
    );

    mosquitoTimer = null;


    /*
    Cria imagem.
    */

    const mosquito =
        document.createElement(
            "img"
        );


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


    /*
    Dificuldade gradual:

    Nível 1  = 110px
    Nível 3  = 105px
    Nível 5  = 100px
    Nível 8  = 95px
    Nível 12 = 90px
    Nível 16 = 85px
    Nível 20 = 80px
    */


    if (nivel >= 3) {

        tamanho = 105;
    }


    if (nivel >= 5) {

        tamanho = 100;
    }


    if (nivel >= 8) {

        tamanho = 95;
    }


    if (nivel >= 12) {

        tamanho = 90;
    }


    if (nivel >= 16) {

        tamanho = 85;
    }


    if (nivel >= 20) {

        tamanho = 80;
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
        Math.max(
            100,
            window.innerWidth -
            tamanho -
            margemX
        );


    const altura =
        Math.max(
            100,
            window.innerHeight -
            tamanho -
            margemTopo -
            margemBaixo
        );


    const x =
        margemX +
        Math.random() *
        largura;


    const y =
        margemTopo +
        Math.random() *
        altura;


    mosquito.style.left =
        Math.min(
            x,
            window.innerWidth -
            tamanho -
            10
        ) + "px";


    mosquito.style.top =
        Math.min(
            y,
            window.innerHeight -
            tamanho -
            10
        ) + "px";


    /* =====================================================
       DIREÇÃO
    ===================================================== */

    if (
        Math.random() >
        0.5
    ) {

        mosquito.style.transform =
            "scaleX(-1)";
    }


    /* =====================================================
       CLIQUE DO MOUSE
    ===================================================== */

    mosquito.addEventListener(
        "click",
        function (evento) {

            evento.stopPropagation();


            if (
                modoControle ===
                "mouse"
            ) {

                capturarMosquito();
            }

        }
    );


    /* =====================================================
       ÁREA DO JOGO
    ===================================================== */

    const area =
        document.getElementById(
            "game-area"
        );


    if (!area) {

        return;
    }


    /*
    Coloca o mosquito na tela.
    */

    area.appendChild(
        mosquito
    );


    /*
    Define como mosquito atual.
    */

    mosquitoAtual =
        mosquito;


    /*
    =====================================================
       COMEÇA UM NOVO TIMER
    =====================================================

    Cada mosquito começa seu próprio contador.
    */

    criarIntervaloMosquito();
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


    /*
    =====================================================
    CORREÇÃO DO BUG
    =====================================================

    Cancela IMEDIATAMENTE o timer do mosquito.

    Assim, depois do clique, esse mosquito não
    pode mais disparar perderVida().
    */

    clearTimeout(
        mosquitoTimer
    );

    mosquitoTimer = null;


    /*
    Guarda o mosquito capturado.
    */

    const mosquitoCapturado =
        mosquitoAtual;


    /*
    Remove a referência atual.
    */

    mosquitoAtual = null;


    /*
    Animação de morte.
    */

    mosquitoCapturado.classList.add(
        "dead"
    );


    /*
    Soma ponto.
    */

    pontos++;


    /* =====================================================
       RECORDE
    ===================================================== */

    if (
        pontos >
        recordeLocal
    ) {

        recordeLocal =
            pontos;


        localStorage.setItem(
            "mosquito_recorde",
            recordeLocal
        );
    }


    /*
    Atualiza nível.
    */

    atualizarNivel();


    /*
    Atualiza HUD.
    */

    atualizarHUD();


    /*
    Remove mosquito morto
    depois da animação.
    */

    setTimeout(
        function () {

            if (
                mosquitoCapturado &&
                mosquitoCapturado.parentNode
            ) {

                mosquitoCapturado.remove();
            }

        },
        150
    );


    /*
    Cria o próximo mosquito.

    O novo mosquito vai ganhar
    um NOVO timer.
    */

    setTimeout(
        function () {

            if (
                jogoAtivo &&
                !mosquitoAtual
            ) {

                criarMosquito();
            }

        },
        120
    );
}


/* =========================================================
   ATUALIZAR NÍVEL
========================================================= */

function atualizarNivel() {

    /*
    A cada 25 pontos sobe um nível.

    0-24   = nível 1
    25-49  = nível 2
    50-74  = nível 3
    75-99  = nível 4
    */

    const novoNivel =
        Math.floor(
            pontos / 25
        ) + 1;


    if (
        novoNivel <= nivel
    ) {

        return;
    }


    nivel =
        novoNivel;


    /*
    =====================================================
    MUDA O FUNDO
    =====================================================

    A cada 25 pontos.
    */

    mudarFundo();


    /*
    =====================================================
    DIFICULDADE
    =====================================================

    Nível 1 = 1800ms
    Nível 2 = 1700ms
    Nível 3 = 1600ms
    Nível 4 = 1500ms
    Nível 5 = 1400ms
    ...
    Mínimo = 1000ms
    */

    tempoMosquito =
        Math.max(
            1000,
            1800 -
            (
                (nivel - 1) *
                100
            )
        );


    /*
    O próximo mosquito já usará
    o novo tempo.
    */

    mostrarNivel();
}


/* =========================================================
   MUDAR FUNDO
========================================================= */

function mudarFundo() {

    /*
    Fundo 1:
    0-24 pontos

    Fundo 2:
    25-49 pontos

    Fundo 3:
    50-74 pontos

    Fundo 4:
    75-99 pontos

    Depois reinicia.
    */

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
        document.createElement(
            "div"
        );


    aviso.className =
        "level-up-message";


    aviso.textContent =
        "NÍVEL " +
        nivel;


    document.body.appendChild(
        aviso
    );


    setTimeout(
        function () {

            if (
                aviso.parentNode
            ) {

                aviso.remove();
            }

        },
        1500
    );
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


    if (
        vidas <= 0
    ) {

        finalizarJogo(
            "GAME OVER",
            "Você perdeu todas as suas vidas!"
        );
    }
}


/* =========================================================
   ATUALIZAR HUD
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


    /*
    Pontos
    */

    if (score) {

        score.textContent =
            pontos;
    }


    /*
    Recorde
    */

    if (highscore) {

        highscore.textContent =
            recordeLocal;
    }


    /*
    Nível
    */

    if (level) {

        level.textContent =
            nivel;
    }


    /*
    Tempo
    */

    if (time) {

        time.textContent =
            tempo;
    }


    /*
    Vidas
    */

    if (lives) {

        let coracoes = "";


        for (
            let i = 0;
            i < vidas;
            i++
        ) {

            coracoes +=
                "❤️";
        }


        lives.textContent =
            coracoes ||
            "💔";
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


    /*
    Cancela todos os timers.
    */

    clearTimeout(
        mosquitoTimer
    );


    clearInterval(
        cronometroTimer
    );


    mosquitoTimer = null;
    cronometroTimer = null;


    /*
    Remove mosquito.
    */

    if (mosquitoAtual) {

        mosquitoAtual.remove();

        mosquitoAtual = null;
    }


    /*
    Para câmera/mão.
    */

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


    /*
    Esconde câmera e cursor.
    */

    const camera =
        document.getElementById(
            "camera-container"
        );


    const cursor =
        document.getElementById(
            "hand-cursor"
        );


    if (camera) {

        camera.classList.add(
            "hidden"
        );
    }


    if (cursor) {

        cursor.classList.add(
            "hidden"
        );
    }


    /*
    Overlay.
    */

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


    /*
    =====================================================
    RECORDE
    =====================================================
    */

    const recordMessage =
        document.getElementById(
            "record-message"
        );


    if (recordMessage) {

        if (
            pontos ===
            recordeLocal &&
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


    /*
    Mostra overlay.
    */

    if (overlay) {

        overlay.classList.remove(
            "hidden"
        );
    }


    /*
    Salva ranking.
    */

    if (
        typeof salvarPontuacaoOnline ===
        "function"
    ) {

        salvarPontuacaoOnline();
    }
}


/* =========================================================
   REINICIAR JOGO
========================================================= */

function reiniciarJogo() {

    /*
    Desliga jogo antigo.
    */

    jogoAtivo = false;


    /*
    Cancela timers.
    */

    clearTimeout(
        mosquitoTimer
    );


    clearInterval(
        cronometroTimer
    );


    mosquitoTimer = null;
    cronometroTimer = null;


    /*
    Remove mosquito.
    */

    if (mosquitoAtual) {

        mosquitoAtual.remove();

        mosquitoAtual = null;
    }


    /*
    Para câmera.
    */

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


    /*
    Esconde overlay.
    */

    esconderOverlay();


    /*
    Reinicia com pequeno intervalo.
    */

    setTimeout(
        function () {

            iniciarJogo();

        },
        300
    );
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

    /*
    Desliga jogo.
    */

    jogoAtivo = false;


    /*
    Cancela timers.
    */

    clearTimeout(
        mosquitoTimer
    );


    clearInterval(
        cronometroTimer
    );


    mosquitoTimer = null;
    cronometroTimer = null;


    /*
    Remove mosquito.
    */

    if (mosquitoAtual) {

        mosquitoAtual.remove();

        mosquitoAtual = null;
    }


    /*
    Para câmera.
    */

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


    /*
    Elementos.
    */

    const game =
        document.getElementById(
            "game-screen"
        );


    const lobby =
        document.getElementById(
            "lobby-screen"
        );


    /*
    Esconde jogo.
    */

    if (game) {

        game.classList.add(
            "hidden"
        );
    }


    /*
    Mostra lobby.
    */

    if (lobby) {

        lobby.classList.remove(
            "hidden"
        );
    }


    /*
    Volta para imagem do lobby.
    */

    document.body.style.backgroundImage =
        'url("img/lobby.png")';


    /*
    Esconde overlay.
    */

    esconderOverlay();


    /*
    Atualiza ranking.
    */

    if (
        typeof carregarRankingOnline ===
        "function"
    ) {

        carregarRankingOnline();
    }
}