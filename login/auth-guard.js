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
        location.replace("../login/login.html");
        return;
      }

      /* ================= PERMISSAO DA PAGINA ================= */
      if (!window.PERMISSAO_PAGINA) {
        location.replace("../login/login.html");
        return;
      }

      try {
        /* ================= USUARIO ================= */
        const snapUser = await db.collection("usuarios").doc(user.uid).get();
        if (!snapUser.exists) {
          location.replace("../login/login.html");
          return;
        }

        const grupoId = snapUser.data().papel;
        if (!grupoId) {
          location.replace("../login/login.html");
          return;
        }

        /* ================= GRUPO ================= */
        const snapGrp = await db.collection("config").doc("grupos").get();
        if (!snapGrp.exists) {
          location.replace("../login/login.html");
          return;
        }

        const grupo = snapGrp.data().lista.find(g => g.id === grupoId);
        if (!grupo) {
          location.replace("../login/login.html");
          return;
        }

        /* ================= PERMISSOES ================= */
        const permissoes = grupo.permissoes || {};
        window.PERMISSOES_USUARIO = permissoes;

        const { area, chave } = window.PERMISSAO_PAGINA;

        const permitido =
          permissoes[area]?.tudo === true ||
          permissoes[area]?.[chave] === true;

        if (!permitido) {
          location.replace("../app/index.html");
          return;
        }

        /* ================= OK ================= */
        document.body.style.display = "block";

        /* EVENTO PARA MENU */
        document.dispatchEvent(new Event("permissoes-carregadas"));

      } catch (err) {
        console.error("Erro no auth-guard:", err);
        location.replace("../login/login.html");
      }
    });
  }

})();