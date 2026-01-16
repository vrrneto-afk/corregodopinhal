// auth-guard.js
// Guardião global de autenticação e vínculo com Firestore
// RESPONSÁVEL POR:
// - impedir acesso sem login
// - criar UID no Firestore
// - redirecionar login → app
// - bloquear usuários inativos

(function () {

  // ⏳ Aguarda Firebase + Auth + Firestore existirem
  function aguardarFirebase() {
    return new Promise(resolve => {
      const i = setInterval(() => {
        if (
          window.firebase &&
          firebase.apps &&
          firebase.apps.length &&
          firebase.auth &&
          firebase.firestore
        ) {
          clearInterval(i);
          resolve();
        }
      }, 50);
    });
  }

  (async () => {

    await aguardarFirebase();

    const auth = firebase.auth();
    const db   = firebase.firestore();

    auth.onAuthStateChanged(async (user) => {

      const estaNoLogin = location.pathname.includes("/login/");

      // ❌ NÃO LOGADO
      if (!user) {
        if (!estaNoLogin) {
          location.replace("../login/login.html");
        }
        return;
      }

      const uid   = user.uid;
      const email = user.email || "";

      // 🔹 Documento config/usuarios
      const ref  = db.collection("config").doc("usuarios");
      const snap = await ref.get();

      let lista = [];
      if (snap.exists) {
        lista = snap.data().lista || [];
      }

      let usuario = lista.find(u => u.uid === uid);

      // 🆕 PRIMEIRO LOGIN → REGISTRA USUÁRIO
      if (!usuario) {

        usuario = {
          uid,
          nome: user.displayName || email.split("@")[0] || "Usuário",
          email,
          grupo: "leitor",
          ativo: false,
          criado_em: firebase.firestore.FieldValue.serverTimestamp()
        };

        lista.push(usuario);

        await ref.set({ lista }, { merge: true });

        alert(
          "Seu acesso foi registrado, mas ainda não foi liberado.\n" +
          "Aguarde o administrador."
        );

        // mantém no login
        await auth.signOut();
        return;
      }

      // 🚫 USUÁRIO INATIVO
      if (usuario.ativo !== true) {
        alert("Usuário desativado.");
        await auth.signOut();
        location.replace("../login/login.html");
        return;
      }

      // ✅ USUÁRIO ATIVO
      window.USUARIO_ATUAL = usuario;

      // 🔁 SE ESTIVER NO LOGIN → ENTRA NO APP
      if (estaNoLogin) {
        location.replace("../app/index.html");
      }

    });

  })();

})();
