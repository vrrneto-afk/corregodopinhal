// 🔐 AUTH GUARD GLOBAL – APP / ADM / CONFIG
(function () {

  const MAX_WAIT = 5000;
  const start = Date.now();

  const wait = setInterval(() => {
    if (
      window.firebase &&
      firebase.auth &&
      firebase.firestore &&
      typeof window.temPermissao === "function"
    ) {
      clearInterval(wait);
      iniciar();
    }

    if (Date.now() - start > MAX_WAIT) {
      clearInterval(wait);
      console.error("Timeout aguardando dependências do auth-guard.");
      location.replace("../login/login.html");
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

      const { area, chave } = window.PERMISSAO_PAGINA;

      /* ================= AGUARDA PERMISSÕES ================= */
      if (!window.PERMISSOES_USUARIO) {
        await new Promise(resolve => {
          document.addEventListener("permissoes-carregadas", resolve, { once: true });
        });
      }

      /* ================= VALIDA PERMISSÃO ================= */
      const permitido = window.temPermissao(`${area}.${chave}`);

      if (!permitido) {
        console.warn(`Acesso negado: ${area}.${chave}`);
        location.replace("../app/index.html");
        return;
      }

      /* ================= OK ================= */
      window.USUARIO_ATUAL = {
        uid: user.uid,
        area,
        chave
      };

      document.body.style.display = "block";
    });
  }

})();