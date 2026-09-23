var vidas = 3;
var pontos = 0;
var nivel = 1;
var tempo = 60;
var recorde = localStorage.getItem('mosquito_recorde') || 0;

var criaMosquitoTempo = 1500;
var criaMosquitoIntervalo = null;
var cronometroIntervalo = null;
var jogoAtivo = false; // Garante que o jogo só roda ao clicar em jogar

// Caminhos das imagens na pasta img/
var fundos = [
  'url("img/Fundo 1.png")',
  'url("img/fundo 2.png")',
  'url("img/fundo 3.png")',
  'url("img/fundo 4.png")'
];

document.addEventListener('DOMContentLoaded', function () {
  var elemHigh = document.getElementById('highscore-display');
  if (elemHigh) elemHigh.innerText = recorde;
});

// Chame esta função ao clicar em "JOGAR AGORA"
function jogar() {
  document.getElementById('lobby-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  
  iniciarJogo();
}

function iniciarJogo() {
  // Limpa intervalos antigos para não acumular
  clearInterval(cronometroIntervalo);
  clearInterval(criaMosquitoIntervalo);

  // Reseta variáveis do jogo
  vidas = 3;
  pontos = 0;
  nivel = 1;
  tempo = 60;
  criaMosquitoTempo = 1500;
  jogoAtivo = true;

  atualizarHUD();
  document.body.style.backgroundImage = fundos[0];

  // Esconde o menu de game over se estiver aberto
  var overlay = document.getElementById('game-overlay');
  if (overlay) overlay.classList.add('hidden');

  // Inicia os timers
  iniciarCronometro();
  reiniciarIntervaloMosquito();
  posicaoRandomica();
}

function iniciarCronometro() {
  cronometroIntervalo = setInterval(function () {
    if (!jogoAtivo) return;

    tempo -= 1;

    var elemTempo = document.getElementById('time-display');
    if (elemTempo) elemTempo.innerText = tempo;

    if (tempo <= 0) {
      finalizarJogo('FIM DE TEMPO!', 'O seu tempo acabou!');
    }
  }, 1000);
}

function posicaoRandomica() {
  if (!jogoAtivo) return;

  // Tira vida se o mosquito anterior sumiu sem ser clicado
  if (document.getElementById('mosquito')) {
    document.getElementById('mosquito').remove();

    vidas--;
    atualizarHUD();

    if (vidas <= 0) {
      finalizarJogo('GAME OVER', 'Você perdeu todas as suas vidas!');
      return;
    }
  }

  // Calcula posição mantendo o mosquito visível na tela
  var largura = window.innerWidth - 120;
  var altura = window.innerHeight - 120;

  var posicaoX = Math.floor(Math.random() * (largura > 0 ? largura : 300));
  var posicaoY = Math.floor(Math.random() * (altura > 0 ? altura : 300));

  posicaoX = posicaoX < 10 ? 10 : posicaoX;
  posicaoY = posicaoY < 100 ? 100 : posicaoY; // evita a barra superior (HUD)

  // Cria a imagem do mosquito
  var mosquito = document.createElement('img');
  mosquito.src = 'img/mosquito.png';
  mosquito.className = tamanhoAleatorio() + ' ' + ladoAleatorio();
  mosquito.style.left = posicaoX + 'px';
  mosquito.style.top = posicaoY + 'px';
  mosquito.style.position = 'absolute';
  mosquito.style.cursor = 'pointer';
  mosquito.id = 'mosquito';

  mosquito.onclick = function () {
    this.remove();
    atualizarPontuacao();
  };

  document.body.appendChild(mosquito);
}

function atualizarPontuacao() {
  if (!jogoAtivo) return;

  pontos += 1;

  // Atualiza recorde
  if (pontos > recorde) {
    recorde = pontos;
    localStorage.setItem('mosquito_recorde', recorde);
  }

  // A cada 25 pontos: Muda fundo, aumenta +30s e acelera
  if (pontos % 25 === 0) {
    nivel += 1;
    tempo += 30; // +30 Segundos por fase

    // Troca de fundo
    var fundoIndex = (nivel - 1) % fundos.length;
    document.body.style.backgroundImage = fundos[fundoIndex];

    // Aumenta a velocidade
    if (criaMosquitoTempo > 300) {
      criaMosquitoTempo -= 150;
      reiniciarIntervaloMosquito();
    }
  }

  atualizarHUD();
}

function atualizarHUD() {
  var elemScore = document.getElementById('score-display');
  var elemHigh = document.getElementById('highscore-display');
  var elemLevel = document.getElementById('level-display');
  var elemLives = document.getElementById('lives-display');
  var elemTime = document.getElementById('time-display');

  if (elemScore) elemScore.innerText = pontos;
  if (elemHigh) elemHigh.innerText = recorde;
  if (elemLevel) elemLevel.innerText = nivel;
  if (elemTime) elemTime.innerText = tempo;

  if (elemLives) {
    var coracoes = '';
    for (var i = 0; i < vidas; i++) {
      coracoes += '❤️';
    }
    elemLives.innerText = coracoes || '💔';
  }
}

function reiniciarIntervaloMosquito() {
  clearInterval(criaMosquitoIntervalo);
  criaMosquitoIntervalo = setInterval(function () {
    posicaoRandomica();
  }, criaMosquitoTempo);
}

function tamanhoAleatorio() {
  var classe = Math.floor(Math.random() * 3);
  switch (classe) {
    case 0: return 'mosquito1';
    case 1: return 'mosquito2';
    case 2: return 'mosquito3';
  }
}

function ladoAleatorio() {
  var classe = Math.floor(Math.random() * 2);
  switch (classe) {
    case 0: return 'ladoA';
    case 1: return 'ladoB';
  }
}

function finalizarJogo(titulo, mensagem) {
  jogoAtivo = false;
  clearInterval(cronometroIntervalo);
  clearInterval(criaMosquitoIntervalo);

  if (document.getElementById('mosquito')) {
    document.getElementById('mosquito').remove();
  }

  var overlay = document.getElementById('game-overlay');
  var titleElem = document.getElementById('overlay-title');
  var msgElem = document.getElementById('overlay-msg');

  if (titleElem) titleElem.innerText = titulo;
  if (msgElem) msgElem.innerText = mensagem;
  if (overlay) overlay.classList.remove('hidden');
}

function reiniciarJogo() {
  iniciarJogo();
}

function voltarAoMenu() {
  jogoAtivo = false;
  clearInterval(cronometroIntervalo);
  clearInterval(criaMosquitoIntervalo);

  if (document.getElementById('mosquito')) {
    document.getElementById('mosquito').remove();
  }

  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('lobby-screen').classList.remove('hidden');
}