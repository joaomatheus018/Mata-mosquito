let altura = 0;
let largura = 0;
let vidas = 1;
let tempo = 15;
let pontos = 0;

let criaMosquitoTempo = 1500;
let criaMosquitoIntervalo = null;
let cronometro = null;

let fundos = [
    "url('img/Fundo 1.png')",
    "url('img/fundo 2.png')",
    "url('img/fundo 3.png')",
    "url('img/fundo 4.png')"
];

let fundoIndex = 0;

function ajustaTamanhoPalcoJogo() {
    altura = window.innerHeight;
    largura = window.innerWidth;
}

function iniciarJogo() {
    ajustaTamanhoPalcoJogo();

    pontos = 0;
    vidas = 1;
    tempo = 15;
    criaMosquitoTempo = 1500;
    fundoIndex = 0;

    document.body.style.backgroundImage = fundos[0];

    document.getElementById("score-display").textContent = "0";
    document.getElementById("lives-display").textContent = "❤️";

    clearInterval(criaMosquitoIntervalo);
    clearInterval(cronometro);

    // Cria o primeiro mosquito imediatamente
    posicaoRandomica();

    // Começa a criação dos mosquitos
    reiniciarIntervaloMosquito();

    // Cronômetro
    cronometro = setInterval(function () {
        tempo--;

        if (tempo <= 0) {
            clearInterval(cronometro);
            clearInterval(criaMosquitoIntervalo);

            removerMosquito();

            alert("Você venceu!");
        }
    }, 1000);
}

function reiniciarIntervaloMosquito() {
    clearInterval(criaMosquitoIntervalo);

    criaMosquitoIntervalo = setInterval(function () {
        posicaoRandomica();
    }, criaMosquitoTempo);
}

function posicaoRandomica() {
    removerMosquito();

    ajustaTamanhoPalcoJogo();

    const mosquito = document.createElement("img");

    mosquito.src = "img/mosquito.png";
    mosquito.id = "mosquito";
    mosquito.className = tamanhoAleatorio() + " " + ladoAleatorio();

    const posicaoX = Math.random() * (largura - 100);
    const posicaoY = Math.random() * (altura - 150);

    mosquito.style.position = "fixed";
    mosquito.style.left = Math.max(0, posicaoX) + "px";
    mosquito.style.top = Math.max(80, posicaoY) + "px";
    mosquito.style.zIndex = "9999";
    mosquito.style.cursor = "pointer";

    mosquito.onclick = function () {
        pontos++;

        document.getElementById("score-display").textContent = pontos;

        this.remove();

        // Troca o fundo a cada 25 pontos
        if (pontos % 25 === 0) {
            fundoIndex++;

            if (fundoIndex >= fundos.length) {
                fundoIndex = 0;
            }

            document.body.style.backgroundImage = fundos[fundoIndex];

            // Aumenta a dificuldade
            if (criaMosquitoTempo > 300) {
                criaMosquitoTempo -= 200;
                reiniciarIntervaloMosquito();
            }
        }
    };

    document.body.appendChild(mosquito);
}

function removerMosquito() {
    const mosquitoAtual = document.getElementById("mosquito");

    if (mosquitoAtual) {
        mosquitoAtual.remove();
    }
}

function tamanhoAleatorio() {
    const tamanho = Math.floor(Math.random() * 3);

    if (tamanho === 0) return "mosquito1";
    if (tamanho === 1) return "mosquito2";
    return "mosquito3";
}

function ladoAleatorio() {
    return Math.floor(Math.random() * 2) === 0
        ? "ladoA"
        : "ladoB";
}

window.addEventListener("resize", ajustaTamanhoPalcoJogo);