// auth-guard.js
// Guard global de autenticação e vínculo com config/usuarios

(function () {

  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: "AIzaSyCW-CuFDrOLO-dteckl_GrPTocmyS-IrzY",
      authDomain: "sitio-corrego-do-pinhal.firebaseapp.com",
      projectId: "sitio-corrego-do-pinhal"
    });
  }

  const auth = firebase.auth();
  const db = firebase.firestore();

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.replace("/login/login.html");
      return;
    }

    try {
      const uid = user.uid;
      const email = user.email || "";

      const usuariosRef = db.collection("config").doc("usuarios");
      const usuariosSnap = await usuariosRef.get();

      let lista = usuariosSnap.exists ? (usuariosSnap.data().lista || []) : [];

      // 🔎 procura por uid
      let usuario = lista.find(u => u.uid === uid);

      // 🔎 fallback: procura por email (usuários antigos)
      if (!usuario && email) {
        usuario = lista.find(u => u.email === email);

        if (usuario) {
          // preenche uid automaticamente
          usuario.uid = uid;
          await usuariosRef.set({ lista }, { merge: true });
        }
      }

      // 🟡 primeiro login → cria INATIVO
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
        await usuariosRef.set({ lista }, { merge: true });

        alert(
          "Seu acesso foi registrado, mas ainda não foi liberado.\n" +
          "Aguarde o administrador."
        );

        await auth.signOut();
        window.location.replace("/login/login.html");
        return;
      }

      // 🚫 usuário inativo
      if (usuario.ativo !== true) {
        alert("Acesso bloqueado. Usuário desativado.");
        await auth.signOut();
        window.location.replace("/login/login.html");
        return;
      }

      // ✅ usuário válido
      console.log("Usuário autenticado:", usuario.nome, usuario.grupo);
      // Se está na tela de login, redireciona para o app
      if (window.location.pathname.includes("/login/")) {
      window.location.replace("../app/index.html");
    }


    } catch (e) {
      console.error("Erro no auth-guard:", e);
      await auth.signOut();
      window.location.replace("/login/login.html");
    }
  });

})();
