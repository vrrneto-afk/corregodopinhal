// auth-guard.js
// Guardião FINAL de autenticação e vínculo com Firestore

(function () {

  const aguardar = setInterval(() => {
    if (window.firebase && firebase.auth && firebase.firestore) {
      clearInterval(aguardar);
      iniciar();
    }
  }, 50);

  function iniciar(){

    const auth = firebase.auth();
    const db   = firebase.firestore();

    auth.onAuthStateChanged(async (user) => {

      /* ❌ NÃO LOGADO */
      if (!user) {
        if (!location.pathname.includes("/login/")) {
          location.replace("../login/login.html");
        }
        return;
      }

      const uid   = user.uid;
      const email = user.email || "";

      const ref  = db.collection("usuarios").doc(uid);
      const snap = await ref.get();

      /* 🆕 PRIMEIRO LOGIN → CRIA PERFIL */
      if (!snap.exists) {
        await ref.set({
          nome: user.displayName || email.split("@")[0],
          email: email,
          papel: "leitor",
          ativo: true,
          pendente: false,
          criado_em: firebase.firestore.FieldValue.serverTimestamp(),
          ultimo_login: firebase.firestore.FieldValue.serverTimestamp()
        });

        location.replace("../app/index.html");
        return;
      }

      const perfil = snap.data();

      /* 🚫 BLOQUEIOS */
      if (perfil.ativo !== true) {
        alert("Usuário desativado.");
        await auth.signOut();
        location.replace("../login/login.html");
        return;
      }

      if (perfil.pendente === true) {
        alert("Acesso pendente de liberação.");
        await auth.signOut();
        location.replace("../login/login.html");
        return;
      }

      /* 🔄 ATUALIZA ÚLTIMO LOGIN */
      await ref.update({
        ultimo_login: firebase.firestore.FieldValue.serverTimestamp()
      });

      /* ✅ USUÁRIO VÁLIDO */
      window.USUARIO_ATUAL = perfil;

      /* 🔁 SE ESTIVER NO LOGIN → ENTRA NO APP */
      if (location.pathname.includes("/login/")) {
        location.replace("../app/index.html");
      }

    });
  }

})();
