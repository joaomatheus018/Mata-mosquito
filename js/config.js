/* =========================================================
   CONFIGURAÇÃO DO FIREBASE
========================================================= */

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


/* =========================================================
   INICIALIZAÇÃO DO FIREBASE
========================================================= */

let firebaseOnline = false;

window.firebaseDB = null;


const firebaseNaoConfigurado =
    !firebaseConfig.apiKey ||
    firebaseConfig.apiKey ===
        "COLE_SUA_API_KEY_AQUI" ||

    firebaseConfig.authDomain.includes(
        "SEU-PROJETO"
    ) ||

    firebaseConfig.databaseURL.includes(
        "SEU-PROJETO"
    ) ||

    firebaseConfig.projectId ===
        "SEU-PROJETO" ||

    firebaseConfig.messagingSenderId ===
        "SEU_MESSAGING_SENDER_ID" ||

    firebaseConfig.appId ===
        "SEU_APP_ID";


if (
    !firebaseNaoConfigurado &&
    typeof firebase !== "undefined"
) {

    try {

        if (
            !firebase.apps ||
            firebase.apps.length === 0
        ) {

            firebase.initializeApp(
                firebaseConfig
            );
        }


        window.firebaseDB =
            firebase.database();


        firebaseOnline = true;


        console.log(
            "Firebase conectado com sucesso."
        );


    } catch (erro) {

        firebaseOnline = false;

        window.firebaseDB = null;


        console.warn(
            "Não foi possível conectar ao Firebase.",
            erro
        );
    }

} else {

    firebaseOnline = false;

    window.firebaseDB = null;


    console.log(
        "Firebase ainda não configurado."
    );
}