// 🔐 AUTH GUARD GLOBAL – VERSÃO FINAL
(function () {

  const wait = setInterval(() => {
    if (
      window.firebase &&
      firebase.auth &&
      firebase.firestore
    ) {
      clearInterval(wait);
      iniciar();
    }
  }, 50);

  function iniciar() {
    const auth = firebase.auth();

    auth.onAuthStateChanged(async (user) => {

      /* ================= NÃO LOGADO ================= */
      if (!user) {
        location.replace("../login/login.html");
        return;
      }

      /* ================= IDENTIFICAÇÃO DA PÁGINA ================= */
      if (!window.PERMISSAO_PAGINA) {
        console.error("PERMISSAO_PAGINA não definida.");
        location.replace("../login/login.html");
        return;
      }

      /* ================= AGUARDA PERMISSÕES ================= */
      if (!window.PERMISSOES_USUARIO) {
        await new Promise(resolve => {
          document.addEventListener(
            "permissoes-carregadas",
            resolve,
            { once: true }
          );
        });
      }

      const { area, chave } = window.PERMISSAO_PAGINA;

      const permitido =
        window.PERMISSOES_USUARIO?.[area]?.tudo === true ||
        window.PERMISSOES_USUARIO?.[area]?.[chave] === true;

      if (!permitido) {
        location.replace("../app/index.html");
        return;
      }

      /* ================= OK ================= */
      document.body.style.display = "block";
    });
  }

})();