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
        document.getElementById(
            "mouse-mode"
        );

    const mao =
        document.getElementById(
            "hand-mode"
        );


    if (mouse) {

        mouse.classList.remove(
            "selected"
        );

    }


    if (mao) {

        mao.classList.remove(
            "selected"
        );

    }


    if (modo === "mouse") {

        if (mouse) {

            mouse.classList.add(
                "selected"
            );

        }


        pararControleMao();

    } else {

        if (mao) {

            mao.classList.add(
                "selected"
            );

        }

    }

}


/*
=========================================================
JOGAR
=========================================================
*/

function jogar() {

    const nomeInput =
        document.getElementById(
            "player-name"
        );


    let nome =
        nomeInput
            ? nomeInput.value.trim()
            : "";


    if (!nome) {

        nome = "Player";

    }


    if (nome.length > 16) {

        nome =
            nome.substring(
                0,
                16
            );

    }


    window.playerName =
        nome;


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
    Evita duas câmeras
    ao mesmo tempo.
    */

    pararControleMao();


    if (
        typeof Hands === "undefined" ||
        typeof Camera === "undefined"
    ) {

        console.error(
            "MediaPipe não foi carregado."
        );


        atualizarStatusCamera(
            "❌ MediaPipe não carregou."
        );

        return;

    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        atualizarStatusCamera(
            "❌ Seu navegador não permite câmera."
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


    if (!video) {
        return;
    }


    try {

        atualizarStatusCamera(
            "📷 Abrindo câmera..."
        );


        /*
        =================================================
        CÂMERA
        =================================================
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
        =================================================
        MEDIAPIPE
        =================================================
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
        =================================================
        CAMERA MEDIAPIPE
        =================================================
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

                                try {

                                    await handsMao.send({
                                        image: video
                                    });

                                } catch (erro) {

                                    console.warn(
                                        "Erro no processamento da mão:",
                                        erro
                                    );

                                }

                            }

                        },

                    width: 640,

                    height: 480

                }
            );


        cameraMao.start();


        maoIniciada =
            true;


        if (cameraContainer) {

            cameraContainer.classList.remove(
                "hidden"
            );

        }


        if (cursor) {

            cursor.classList.remove(
                "hidden"
            );

        }


        atualizarStatusCamera(
            "✋ Mostre sua mão"
        );


    } catch (erro) {

        console.error(
            "Erro ao iniciar câmera:",
            erro
        );


        atualizarStatusCamera(
            "❌ Não foi possível acessar a câmera."
        );


        pararControleMao();

    }

}


/*
=========================================================
STATUS DA CÂMERA
=========================================================
*/

function atualizarStatusCamera(
    mensagem
) {

    const status =
        document.getElementById(
            "hand-status"
        );


    if (status) {

        status.textContent =
            mensagem;

    }

}


/*
=========================================================
PROCESSAR MÃO
=========================================================
*/

function processarMao(
    resultados
) {

    if (!jogoAtivo) {
        return;
    }


    if (
        !resultados ||
        !resultados.multiHandLandmarks ||
        resultados.multiHandLandmarks.length === 0
    ) {

        atualizarStatusCamera(
            "✋ Mostre sua mão"
        );

        return;

    }


    const pontos =
        resultados
            .multiHandLandmarks[0];


    const indicador =
        pontos[8];


    if (!indicador) {
        return;
    }


    /*
    =====================================================
    POSIÇÃO DO INDICADOR
    =====================================================
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
    =====================================================
    DETECTAR MÃO FECHADA
    =====================================================
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


    atualizarStatusCamera(
        fechada
            ? "✊ PEGAR!"
            : "☝️ Aponte para o mosquito"
    );


    /*
    =====================================================
    CAPTURA
    =====================================================
    */

    if (fechada) {

        const agora =
            Date.now();


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
    INDICADOR
    */

    if (
        pontos[8].y >
        pontos[6].y
    ) {

        fechados++;

    }


    /*
    MÉDIO
    */

    if (
        pontos[12].y >
        pontos[10].y
    ) {

        fechados++;

    }


    /*
    ANELAR
    */

    if (
        pontos[16].y >
        pontos[14].y
    ) {

        fechados++;

    }


    /*
    MINDINHO
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
COLISÃO MÃO + MOSQUITO
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
        mosquitoAtual
            .getBoundingClientRect();


    /*
    Margem extra para facilitar
    a captura com a mão.
    */

    const margem =
        35;


    const dentro =

        x >=
        rect.left -
        margem &&

        x <=
        rect.right +
        margem &&

        y >=
        rect.top -
        margem &&

        y <=
        rect.bottom +
        margem;


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

    maoIniciada =
        false;


    processandoMao =
        false;


    ultimoCliqueMao =
        0;


    /*
    =====================================================
    MEDIAPIPE CAMERA
    =====================================================
    */

    if (cameraMao) {

        try {

            cameraMao.stop();

        } catch (erro) {

            console.warn(
                "Erro ao parar Camera:",
                erro
            );

        }

    }


    cameraMao =
        null;


    /*
    =====================================================
    HANDS
    =====================================================
    */

    if (handsMao) {

        try {

            handsMao.close();

        } catch (erro) {

            console.warn(
                "Erro ao fechar Hands:",
                erro
            );

        }

    }


    handsMao =
        null;


    /*
    =====================================================
    STREAM
    =====================================================
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


    cameraStream =
        null;


    /*
    =====================================================
    VÍDEO
    =====================================================
    */

    const video =
        document.getElementById(
            "camera-video"
        );


    if (video) {

        try {

            video.pause();

        } catch (erro) {}

        video.srcObject =
            null;

    }


    /*
    =====================================================
    ELEMENTOS
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
RANKING LOCAL
=========================================================
*/

function obterRankingLocal() {

    try {

        const dados =
            localStorage.getItem(
                "mosquito_ranking"
            );


        if (!dados) {

            return [];

        }


        const ranking =
            JSON.parse(
                dados
            );


        return Array.isArray(
            ranking
        )
            ? ranking
            : [];


    } catch (erro) {

        return [];

    }

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


    lista.innerHTML =
        "";


    jogadores
        .slice(0, 10)
        .forEach(
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

function escaparHTML(
    texto
) {

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