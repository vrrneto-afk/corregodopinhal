// auth-guard.js
// Guardião global de autenticação e autorização

(function(){

  const esperarFirebase = setInterval(() => {
    if (window.firebase && firebase.auth && firebase.firestore) {
      clearInterval(esperarFirebase);
      iniciar();
    }
  }, 50);

  function iniciar(){

    const auth = firebase.auth();
    const db = firebase.firestore();

    auth.onAuthStateChanged(async (user) => {

      // ❌ NÃO LOGADO → LOGIN
      if (!user) {
        if (!location.pathname.includes("/login/")) {
          location.replace("../login/login.html");
        }
        return;
      }

      const uid = user.uid;

      try{
        const ref = db.collection("usuarios").doc(uid);
        const snap = await ref.get();

        // 🚫 NÃO CADASTRADO NO FIRESTORE
        if (!snap.exists) {
          alert("Usuário não autorizado.");
          await auth.signOut();
          location.replace("../login/login.html");
          return;
        }

        const dados = snap.data();

        // 🚫 INATIVO
        if (dados.ativo !== true) {
          alert("Usuário desativado.");
          await auth.signOut();
          location.replace("../login/login.html");
          return;
        }

        // ✅ OK
        await ref.update({
          ultimo_login: firebase.firestore.FieldValue.serverTimestamp()
        });

        window.USUARIO_ATUAL = dados;

        // 🔁 SE ESTIVER NO LOGIN → INDEX
        if (location.pathname.includes("/login/")) {
          location.replace("../app/index.html");
        }

      }catch(e){
        console.error(e);
        alert("Erro de verificação de acesso.");
        await auth.signOut();
        location.replace("../login/login.html");
      }
    });
  }

})();
