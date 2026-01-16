// auth-guard.js
// Guardião global de autenticação e vínculo com Firestore

(function () {

  // Aguarda o Firebase existir
  const aguardarFirebase = setInterval(() => {
    if (window.firebase && firebase.auth && firebase.firestore) {
      clearInterval(aguardarFirebase);
      iniciarAuth();
    }
  }, 50);

  function iniciarAuth(){

    const auth = firebase.auth();
    const db = firebase.firestore();

    auth.onAuthStateChanged(async (user) => {

      // ❌ NÃO LOGADO → SEMPRE LOGIN
      if (!user) {
        if (!location.pathname.includes("/login/")) {
          location.replace("../login/login.html");
        }
        return;
      }

      const uid = user.uid;
      const email = user.email || "";

      // 🔹 COLEÇÃO PADRÃO
      const ref = db.collection("config").doc("usuarios");
      const snap = await ref.get();

      let lista = [];
      if (snap.exists) {
        lista = snap.data().lista || [];
      }

      let usuario = lista.find(u => u.uid === uid);

      // 🆕 PRIMEIRO LOGIN → CRIA PERFIL
      if (!usuario) {
        usuario = {
          uid,
          nome: user.displayName || email.split("@")[0],
          email,
          grupo: "leitor",
          ativo: false,
          criado_em: firebase.firestore.FieldValue.serverTimestamp()
        };
        lista.push(usuario);
        await ref.set({ lista }, { merge: true });

        alert("Seu acesso foi registrado. Aguarde liberação.");
        return;
      }

      // 🚫 BLOQUEADO
      if (usuario.ativo !== true) {
        alert("Usuário desativado.");
        await auth.signOut();
        location.replace("../login/login.html");
        return;
      }

      // ✅ LOGADO + ATIVO
      window.USUARIO_ATUAL = usuario;

      // 🔁 SE ESTIVER NO LOGIN → ENTRA NO APP
      if (location.pathname.includes("/login/")) {
        location.replace("../app/index.html");
      }
    });
  }

})();
