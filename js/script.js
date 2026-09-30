/*
=========================================================
CONTROLE
=========================================================
*/

let modoControle = "mouse";

let cameraMao = null;

let handsMao = null;

let cameraStream = null;

let maoIniciada = false;

let processandoMao = false;

let ultimoCliqueMao = 0;


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

        pararControleMao();

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

        nome =
            nome.substring(0, 16);

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
INICIAR CONTROLE DA MÃO
=========================================================
*/

async function iniciarControleMao() {

    /*
    Se já existir uma câmera,
    encerra antes de iniciar outra.
    */

    pararControleMao();


    if (
        typeof Hands === "undefined" ||
        typeof Camera === "undefined"
    ) {

        console.error(
            "MediaPipe não foi carregado."
        );

        return;

    }


    const video =
        document.getElementById(
            "camera-video"
        );

    const cameraContainer =
        document.getElementById(
            "camera-container"
        );

    const cursor =
        document.getElementById(
            "hand-cursor"
        );

    const status =
        document.getElementById(
            "hand-status"
        );


    if (!video) {
        return;
    }


    try {

        status.textContent =
            "📷 Abrindo câmera...";


        /*
        =============================================
        ACESSO À CÂMERA
        =============================================
        */

        cameraStream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: {

                        width: 640,

                        height: 480,

                        facingMode: "user"

                    },

                    audio: false

                });


        video.srcObject =
            cameraStream;


        await video.play();


        /*
        =============================================
        MEDIAPIPE HANDS
        =============================================
        */

        handsMao =
            new Hands({

                locateFile:
                    function (arquivo) {

                        return (
                            "https://cdn.jsdelivr.net/npm/@mediapipe/hands/" +
                            arquivo
                        );

                    }

            });


        handsMao.setOptions({

            maxNumHands: 1,

            modelComplexity: 1,

            minDetectionConfidence: 0.6,

            minTrackingConfidence: 0.6

        });


        handsMao.onResults(
            processarMao
        );


        /*
        =============================================
        CAMERA MEDIAPIPE
        =============================================
        */

        cameraMao =
            new Camera(
                video,
                {

                    onFrame:
                        async function () {

                            if (
                                handsMao &&
                                jogoAtivo
                            ) {

                                await handsMao.send({
                                    image: video
                                });

                            }

                        },

                    width: 640,

                    height: 480

                }
            );


        cameraMao.start();


        maoIniciada = true;


        cameraContainer.classList.remove(
            "hidden"
        );

        cursor.classList.remove(
            "hidden"
        );


        status.textContent =
            "✋ Mostre sua mão";


    } catch (erro) {

        console.error(
            "Erro ao iniciar câmera:",
            erro
        );


        status.textContent =
            "❌ Não foi possível acessar a câmera.";


        pararControleMao();

    }

}


/*
=========================================================
PROCESSAR MÃO
=========================================================
*/

function processarMao(resultados) {

    if (!jogoAtivo) {
        return;
    }


    if (
        !resultados ||
        !resultados.multiHandLandmarks ||
        resultados.multiHandLandmarks.length === 0
    ) {

        return;

    }


    const pontos =
        resultados.multiHandLandmarks[0];


    /*
    Ponta do dedo indicador
    */

    const indicador =
        pontos[8];


    if (!indicador) {
        return;
    }


    /*
    =============================================
    CONVERTER POSIÇÃO DA CÂMERA
    PARA A TELA
    =============================================
    */

    const x =
        (1 - indicador.x) *
        window.innerWidth;


    const y =
        indicador.y *
        window.innerHeight;


    const cursor =
        document.getElementById(
            "hand-cursor"
        );


    if (cursor) {

        cursor.style.left =
            x + "px";

        cursor.style.top =
            y + "px";

    }


    /*
    =============================================
    VERIFICAR MÃO FECHADA
    =============================================
    */

    const fechada =
        detectarMaoFechada(
            pontos
        );


    if (cursor) {

        if (fechada) {

            cursor.classList.add(
                "closed"
            );

        } else {

            cursor.classList.remove(
                "closed"
            );

        }

    }


    /*
    Só captura quando fecha a mão.
    */

    if (fechada) {

        const agora =
            Date.now();


        /*
        Pequeno intervalo para
        evitar vários cliques seguidos.
        */

        if (
            agora -
            ultimoCliqueMao >
            400
        ) {

            ultimoCliqueMao =
                agora;


            verificarColisaoComMosquito(
                x,
                y
            );

        }

    }

}


/*
=========================================================
DETECTAR MÃO FECHADA
=========================================================
*/

function detectarMaoFechada(
    pontos
) {

    if (
        !pontos ||
        pontos.length < 21
    ) {

        return false;

    }


    let fechados = 0;


    /*
    Indicador
    */

    if (
        pontos[8].y >
        pontos[6].y
    ) {

        fechados++;

    }


    /*
    Médio
    */

    if (
        pontos[12].y >
        pontos[10].y
    ) {

        fechados++;

    }


    /*
    Anelar
    */

    if (
        pontos[16].y >
        pontos[14].y
    ) {

        fechados++;

    }


    /*
    Mindinho
    */

    if (
        pontos[20].y >
        pontos[18].y
    ) {

        fechados++;

    }


    return fechados >= 3;

}


/*
=========================================================
COLISÃO DA MÃO COM MOSQUITO
=========================================================
*/

function verificarColisaoComMosquito(
    x,
    y
) {

    if (!jogoAtivo) {
        return;
    }


    if (!mosquitoAtual) {
        return;
    }


    const rect =
        mosquitoAtual.getBoundingClientRect();


    const margem = 35;


    const dentro =

        x >= rect.left - margem &&

        x <= rect.right + margem &&

        y >= rect.top - margem &&

        y <= rect.bottom + margem;


    if (dentro) {

        capturarMosquito();

    }

}


/*
=========================================================
PARAR CONTROLE DA MÃO
=========================================================
*/

function pararControleMao() {

    maoIniciada = false;

    processandoMao = false;


    /*
    Para MediaPipe Camera
    */

    if (cameraMao) {

        try {

            cameraMao.stop();

        } catch (erro) {

            console.warn(
                "Erro ao parar câmera:",
                erro
            );

        }

    }


    cameraMao = null;


    /*
    Fecha MediaPipe Hands
    */

    if (handsMao) {

        try {

            handsMao.close();

        } catch (erro) {

            console.warn(
                "Erro ao fechar MediaPipe:",
                erro
            );

        }

    }


    handsMao = null;


    /*
    Para câmera do navegador
    */

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                function (track) {

                    track.stop();

                }
            );

    }


    cameraStream = null;


    const video =
        document.getElementById(
            "camera-video"
        );


    if (video) {

        video.pause();

        video.srcObject = null;

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

        camera.classList.add(
            "hidden"
        );

    }


    if (cursor) {

        cursor.classList.add(
            "hidden"
        );

        cursor.classList.remove(
            "closed"
        );

    }

}


/*
=========================================================
REINICIAR JOGO
=========================================================
*/

function reiniciarJogo() {

    /*
    Primeiro encerra completamente
    o jogo anterior.
    */

    jogoAtivo = false;


    clearInterval(
        cronometroTimer
    );


    clearInterval(
        mosquitoTimer
    );


    /*
    Remove mosquito antigo.
    */

    if (mosquitoAtual) {

        mosquitoAtual.remove();

        mosquitoAtual = null;

    }


    /*
    MUITO IMPORTANTE:
    fecha a câmera anterior.
    */

    pararControleMao();


    /*
    Fecha overlay.
    */

    esconderOverlay();


    /*
    Pequeno atraso para garantir
    que a câmera antiga foi liberada.
    */

    setTimeout(
        function () {

            iniciarJogo();

        },
        300
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


    pararControleMao();


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
ESCONDER OVERLAY
=========================================================
*/

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


/*
=========================================================
RANKING LOCAL
=========================================================
*/

function obterRankingLocal() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "mosquito_ranking"
            )
        ) || [];

    } catch (erro) {

        return [];

    }

}


/*
=========================================================
SALVAR PONTUAÇÃO
=========================================================
*/

function salvarPontuacaoOnline() {

    if (pontos <= 0) {
        return;
    }


    const nome =
        window.playerName ||
        "Player";


    let ranking =
        obterRankingLocal();


    ranking.push({

        nome: nome,

        score: pontos,

        nivel: nivel,

        modo: modoControle,

        data: Date.now()

    });


    /*
    Ordena do maior para o menor.
    */

    ranking.sort(
        function (a, b) {

            return b.score -
                a.score;

        }
    );


    /*
    Guarda somente os 10 melhores.
    */

    ranking =
        ranking.slice(
            0,
            10
        );


    localStorage.setItem(
        "mosquito_ranking",
        JSON.stringify(
            ranking
        )
    );


    carregarRankingOnline();

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


    const jogadores =
        obterRankingLocal();


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


/*
=========================================================
SEGURANÇA
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


/*
=========================================================
CARREGAR AO ABRIR
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


        if (
            nomeSalvo &&
            input
        ) {

            input.value =
                nomeSalvo;

        }


        carregarRankingOnline();

    }
);