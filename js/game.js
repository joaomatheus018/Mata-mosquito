/*
=========================================================
VARIÁVEIS
=========================================================
*/

let vidas = 3;

let pontos = 0;

let nivel = 1;

let tempo = 60;

let jogoAtivo = false;

let mosquitoAtual = null;

let mosquitoTimer = null;

let cronometroTimer = null;

let tempoMosquito = 1500;

let recordeLocal =
    Number(
        localStorage.getItem(
            "mosquito_recorde"
        ) || 0
    );


/*
=========================================================
FUNDOS
=========================================================
*/

const fundos = [

    'url("img/Fundo 1.png")',

    'url("img/fundo 2.png")',

    'url("img/fundo 3.png")',

    'url("img/fundo 4.png")'

];


/*
=========================================================
INICIAR
=========================================================
*/

function iniciarJogo() {

    clearInterval(
        mosquitoTimer
    );

    clearInterval(
        cronometroTimer
    );


    vidas = 3;

    pontos = 0;

    nivel = 1;

    tempo = 60;

    tempoMosquito = 1500;

    jogoAtivo = true;


    const lobby =
        document.getElementById(
            "lobby-screen"
        );

    const game =
        document.getElementById(
            "game-screen"
        );


    lobby.classList.add(
        "hidden"
    );

    game.classList.remove(
        "hidden"
    );


    document.body.style.backgroundImage =
        fundos[0];


    esconderOverlay();


    atualizarHUD();


    iniciarCronometro();


    criarIntervaloMosquito();


    criarMosquito();


    /*
    =============================================
    MODO MÃO
    =============================================
    */

    if (
        typeof modoControle !==
        "undefined" &&
        modoControle === "mao"
    ) {

        document
            .getElementById(
                "camera-container"
            )
            .classList.remove(
                "hidden"
            );

        document
            .getElementById(
                "hand-cursor"
            )
            .classList.remove(
                "hidden"
            );


        if (
            typeof iniciarControleMao ===
            "function"
        ) {

            iniciarControleMao();

        }

    }

}


/*
=========================================================
CRONÔMETRO
=========================================================
*/

function iniciarCronometro() {

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


/*
=========================================================
CRIAR INTERVALO
=========================================================
*/

function criarIntervaloMosquito() {

    clearInterval(
        mosquitoTimer
    );


    mosquitoTimer =
        setInterval(
            function () {

                if (!jogoAtivo) {
                    return;
                }


                /*
                Se o mosquito antigo ainda
                estiver na tela, o jogador
                não conseguiu pegá-lo.
                */

                if (mosquitoAtual) {

                    mosquitoAtual.remove();

                    mosquitoAtual =
                        null;


                    perderVida();

                    if (!jogoAtivo) {
                        return;
                    }

                }


                criarMosquito();

            },
            tempoMosquito
        );

}


/*
=========================================================
CRIAR MOSQUITO
=========================================================
*/

function criarMosquito() {

    if (!jogoAtivo) {
        return;
    }


    if (mosquitoAtual) {

        mosquitoAtual.remove();

        mosquitoAtual = null;

    }


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


    /*
    =============================================
    TAMANHO
    =============================================
    */

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


    mosquito.style.width =
        tamanho + "px";


    /*
    =============================================
    POSIÇÃO
    =============================================
    */

    const margemX =
        40;

    const margemTopo =
        110;

    const margemBaixo =
        40;


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
            Math.max(
                largura,
                100
            )
        );


    const y =
        margemTopo +
        Math.random() *
        Math.max(
            altura,
            100
        );


    mosquito.style.left =
        x + "px";


    mosquito.style.top =
        y + "px";


    /*
    =============================================
    DIREÇÃO
    =============================================
    */

    if (
        Math.random() > 0.5
    ) {

        mosquito.style.transform =
            "scaleX(-1)";

    }


    /*
    =============================================
    MOUSE
    =============================================
    */

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


    document
        .getElementById(
            "game-area"
        )
        .appendChild(
            mosquito
        );


    mosquitoAtual =
        mosquito;

}


/*
=========================================================
CAPTURAR MOSQUITO
=========================================================
*/

function capturarMosquito() {

    if (!jogoAtivo) {
        return;
    }


    if (!mosquitoAtual) {
        return;
    }


    mosquitoAtual.classList.add(
        "dead"
    );


    const mosquitoCapturado =
        mosquitoAtual;


    mosquitoAtual = null;


    pontos++;


    /*
    =============================================
    RECORD LOCAL
    =============================================
    */

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


    atualizarNivel();


    atualizarHUD();


    /*
    Remove o mosquito depois
    da animação.
    */

    setTimeout(
        function () {

            if (
                mosquitoCapturado
                .parentNode
            ) {

                mosquitoCapturado
                    .remove();

            }

        },
        150
    );


    /*
    Cria outro imediatamente.
    */

    setTimeout(
        function () {

            if (jogoAtivo) {

                criarMosquito();

            }

        },
        100
    );

}


/*
=========================================================
NÍVEL / DIFICULDADE
=========================================================
*/

function atualizarNivel() {

    /*
    A cada 25 pontos:
    sobe um nível.
    */

    const novoNivel =
        Math.floor(
            pontos / 25
        ) + 1;


    if (
        novoNivel >
        nivel
    ) {

        nivel =
            novoNivel;


        mudarFundo();


        /*
        Mais dificuldade.
        */

        tempoMosquito =
            Math.max(
                350,
                1500 -
                ((nivel - 1) * 180)
            );


        criarIntervaloMosquito();


        mostrarNivel();

    }

}


/*
=========================================================
MUDAR FUNDO
=========================================================
*/

function mudarFundo() {

    const indice =
        (nivel - 1) %
        fundos.length;


    document.body.style.backgroundImage =
        fundos[indice];

}


/*
=========================================================
AVISO DE NÍVEL
=========================================================
*/

function mostrarNivel() {

    const aviso =
        document.createElement(
            "div"
        );


    aviso.className =
        "level-up-message";


    aviso.textContent =
        "NÍVEL " + nivel;


    document.body.appendChild(
        aviso
    );


    setTimeout(
        function () {

            aviso.remove();

        },
        1500
    );

}


/*
=========================================================
PERDER VIDA
=========================================================
*/

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


/*
=========================================================
HUD
=========================================================
*/

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

            coracoes +=
                "❤️";

        }


        lives.textContent =
            coracoes || "💔";

    }

}


/*
=========================================================
FINALIZAR JOGO
=========================================================
*/

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

        pararControleMao();

    }


    const camera =
        document.getElementById(
            "camera-container"
        );

    const cursor =
        document.getElementById(
            "hand-cursor"
        );


    camera.classList.add(
        "hidden"
    );

    cursor.classList.add(
        "hidden"
    );


    /*
    =============================================
    OVERLAY
    =============================================
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


    title.textContent =
        titulo;

    msg.textContent =
        mensagem;

    finalScore.textContent =
        pontos;


    /*
    =============================================
    NOVO RECORDE
    =============================================
    */

    const recordMessage =
        document.getElementById(
            "record-message"
        );


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


    overlay.classList.remove(
        "hidden"
    );


    /*
    =============================================
    ENVIA PARA RANKING
    =============================================
    */

    salvarPontuacaoOnline();

}


/*
=========================================================
REINICIAR
=========================================================
*/

function reiniciarJogo() {

    esconderOverlay();

    iniciarJogo();

}


/*
=========================================================
ESCONDER OVERLAY
=========================================================
*/

function esconderOverlay() {

    const overlay =
        document.getElementById(
            "game-overlay"
        );


    overlay.classList.add(
        "hidden"
    );

}


/*
=========================================================
VOLTAR AO MENU
=========================================================
*/

function voltarAoMenu() {

    jogoAtivo = false;


    clearInterval(
        cronometroTimer
    );

    clearInterval(
        mosquitoTimer
    );


    if (mosquitoAtual) {

        mosquitoAtual.remove();

        mosquitoAtual = null;

    }


    if (
        typeof pararControleMao ===
        "function"
    ) {

        pararControleMao();

    }


    document
        .getElementById(
            "game-screen"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "lobby-screen"
        )
        .classList.remove(
            "hidden"
        );


    document.body.style.backgroundImage =
        'url("img/lobby.png")';


    esconderOverlay();


    carregarRankingOnline();

}


/*
=========================================================
RANKING ONLINE
=========================================================
*/

function salvarPontuacaoOnline() {

    if (
        !window.firebaseDB
    ) {

        console.warn(
            "Firebase não configurado."
        );

        return;

    }


    if (pontos <= 0) {
        return;
    }


    const nome =
        window.playerName ||
        "Player";


    const referencia =
        window.firebaseDB
            .ref("ranking")
            .push();


    referencia
        .set({

            nome: nome,

            score: pontos,

            nivel: nivel,

            modo:
                modoControle,

            data:
                Date.now()

        })
        .then(
            function () {

                console.log(
                    "Pontuação enviada."
                );

                carregarRankingOnline();

            }
        )
        .catch(
            function (erro) {

                console.error(
                    "Erro ao salvar:",
                    erro
                );

            }
        );

}


/*
=========================================================
CARREGAR RANKING
=========================================================
*/

function carregarRankingOnline() {

    const lista =
        document.getElementById(
            "ranking-list"
        );


    if (!lista) {
        return;
    }


    if (
        !window.firebaseDB
    ) {

        lista.innerHTML = `

            <div class="ranking-loading">
                Ranking online não configurado
            </div>

        `;

        return;

    }


    const referencia =
        window.firebaseDB
            .ref("ranking")
            .orderByChild("score")
            .limitToLast(10);


    referencia.on(
        "value",
        function (snapshot) {

            const jogadores = [];


            snapshot.forEach(
                function (item) {

                    jogadores.push(
                        item.val()
                    );

                }
            );


            jogadores.sort(
                function (a, b) {

                    return b.score -
                        a.score;

                }
            );


            jogadores.splice(
                10
            );


            if (
                jogadores.length === 0
            ) {

                lista.innerHTML = `

                    <div class="ranking-loading">
                        Ainda não há pontuações.
                    </div>

                `;

                return;

            }


            lista.innerHTML = "";


            jogadores.forEach(
                function (
                    jogador,
                    index
                ) {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "ranking-row";


                    row.innerHTML = `

                        <div class="ranking-position">
                            ${index + 1}
                        </div>

                        <div class="ranking-name">
                            ${escaparHTML(
                                jogador.nome ||
                                "Player"
                            )}
                        </div>

                        <div class="ranking-score">
                            ${Number(
                                jogador.score ||
                                0
                            )} pts
                        </div>

                    `;


                    lista.appendChild(
                        row
                    );

                }
            );

        }
    );

}


/*
=========================================================
SEGURANÇA DO TEXTO DO RANKING
=========================================================
*/

function escaparHTML(texto) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        texto;


    return div.innerHTML;

}