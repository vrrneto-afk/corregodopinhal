// 🔐 AUTH GUARD GLOBAL – DEFINITIVO
(function () {

  const wait = setInterval(() => {
    if (window.firebase && firebase.auth && firebase.firestore) {
      clearInterval(wait);
      iniciar();
    }
  }, 50);

  function iniciar() {
    const auth = firebase.auth();
    const db   = firebase.firestore();

    auth.onAuthStateChanged(async (user) => {

      /* ================= NÃO LOGADO ================= */
      if (!user) {
        return location.replace("../login/login.html");
      }

      /* ================= PERMISSAO DA PAGINA ================= */
      if (!window.PERMISSAO_PAGINA) {
        await auth.signOut();
        return location.replace("../login/login.html");
      }

      try {
        /* ================= USUARIO ================= */
        const snapUser = await db.collection("usuarios").doc(user.uid).get();
        if (!snapUser.exists) {
          await auth.signOut();
          return location.replace("../login/login.html");
        }

        const grupoId = snapUser.data().papel;
        if (!grupoId) {
          await auth.signOut();
          return location.replace("../login/login.html");
        }

        /* ================= GRUPO ================= */
        const snapGrp = await db.collection("config").doc("grupos").get();
        if (!snapGrp.exists) {
          await auth.signOut();
          return location.replace("../login/login.html");
        }

        const grupo = snapGrp.data().lista.find(g => g.id === grupoId);
        if (!grupo) {
          await auth.signOut();
          return location.replace("../login/login.html");
        }

        /* ================= PERMISSOES ================= */
        const permissoes = grupo.permissoes || {};
        window.PERMISSOES_USUARIO = permissoes;

        const { area, chave } = window.PERMISSAO_PAGINA;

        const permitido =
          permissoes[area]?.tudo === true ||
          permissoes[area]?.[chave] === true;

        if (!permitido) {
          return location.replace("../app/index.html");
        }

        /* ================= OK ================= */
        document.body.style.display = "block";

        document.dispatchEvent(
          new Event("permissoes-carregadas")
        );

      } catch (err) {
        console.error("Erro no auth-guard:", err);
        await auth.signOut();
        location.replace("../login/login.html");
      }
    });
  }

})();
