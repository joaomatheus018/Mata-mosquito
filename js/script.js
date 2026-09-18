// alert("Ola mundo")

// alert(window.innerWidth)
// alert(window.innerHeight)


const w = document.querySelector("#largura")
const h = document.querySelector("#altura")
const imgMosquito = document.querySelector(".img-Mosquito")


function mudarPosicaoMosquito()
{
imgMosquito.style.top = Math.ceil(Math.random() * window.innerHeight) + "px"
imgMosquito.style.left = Math.ceil(Math.random() * window.innerWidth) + "px"
}

setInterval(mudarPosicaoMosquito, 1000)

imgMosquito.addEventListener("click", function(){
    alert("Você clicou!")
})

w.textContent = window.innerWidth
h.textContent = window.innerHeight