// auth-guard.js
// 🔐 GUARD GLOBAL – APP / ADM / CONFIG
(function () {

  /**
   * Aguarda Firebase + função de permissão
   */
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
        await auth.signOut();
        location.replace("../login/login.html");
        return;
      }

      try {

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
          alert("Você não tem permissão para acessar esta área.");
          await auth.signOut();
          location.replace("../login/login.html");
          return;
        }

        /* ================= OK ================= */
        window.USUARIO_ATUAL = {
          uid: user.uid,
          area,
          chave
        };

        document.body.style.display = "block";

      } catch (err) {
        console.error("Erro no auth-guard:", err);
        await auth.signOut();
        location.replace("../login/login.html");
      }
    });
  }

})();
