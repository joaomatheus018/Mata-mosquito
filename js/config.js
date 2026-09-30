/*
=========================================================
FIREBASE
=========================================================
*/

const firebaseConfig = {

    apiKey:
        "COLE_SUA_API_KEY_AQUI",

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

window.firebaseDB =
    null;


try {

    if (
        typeof firebase !==
        "undefined"
    ) {

        firebase.initializeApp(
            firebaseConfig
        );


        window.firebaseDB =
            firebase.database();


        console.log(
            "Firebase conectado."
        );

    }

} catch (erro) {

    console.warn(
        "Firebase ainda não configurado. O ranking local continuará funcionando."
    );

    window.firebaseDB =
        null;

}