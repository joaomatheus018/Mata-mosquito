/*
=========================================================
FIREBASE
=========================================================

COLOQUE AQUI OS DADOS DO SEU PROJETO FIREBASE.

Depois de criar o projeto, o Firebase fornece esse objeto.
*/

const firebaseConfig = {

    apiKey: "COLE_SUA_API_KEY_AQUI",

    authDomain:
        "SEU-PROJETO.firebaseapp.com",

    databaseURL:
        "https://SEU-PROJETO-default-rtdb.firebaseio.com",

    projectId:
        "SEU-PROJETO",

    storageBucket:
        "SEU-PROJETO.firebasestorage.app",

    messagingSenderId:
        "SEU_MESSAGING_SENDER_ID",

    appId:
        "SEU_APP_ID"
};


/*
=========================================================
INICIALIZAÇÃO
=========================================================
*/

let firebaseOnline = false;

try {

    firebase.initializeApp(firebaseConfig);

    window.firebaseDB =
        firebase.database();

    firebaseOnline = true;

    console.log(
        "Firebase conectado."
    );

} catch (erro) {

    console.warn(
        "Firebase não configurado.",
        erro
    );

    window.firebaseDB = null;

}