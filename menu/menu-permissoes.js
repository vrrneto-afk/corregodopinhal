// 🔐 MENU PERMISSÕES – VERSÃO DEFINITIVA
(async function () {

  const auth = firebase.auth();
  const db   = firebase.firestore();

  auth.onAuthStateChanged(async user => {
    if (!user) return;

    try {

      /* ================= USUÁRIO ================= */
      const snapUser = await db.collection("usuarios").doc(user.uid).get();
      if (!snapUser.exists) return;

      const grupoId = snapUser.data().papel;
      if (!grupoId) return;

      /* ================= GRUPO ================= */
      const snapCfg = await db.collection("config").doc("grupos").get();
      if (!snapCfg.exists) return;

      const grupo = snapCfg.data().lista.find(g => g.id === grupoId);
      if (!grupo) return;

      const permissoes = grupo.permissoes || {};

      /* ================= FILTRA LINKS ================= */
      document.querySelectorAll(".menu-link[data-area][data-chave]").forEach(link => {

        const area  = link.dataset.area;
        const chave = link.dataset.chave;

        const permitido =
          permissoes[area]?.tudo === true ||
          permissoes[area]?.[chave] === true;

        if (!permitido) {
          link.remove();
        }
      });

      /* ================= LIBERA MENU ================= */
      const wrapper = document.querySelector(".menu-wrapper");
      if (wrapper) {
        wrapper.style.visibility = "visible";
      }

      /* ================= EVENTO GLOBAL ================= */
      window.PERMISSOES_USUARIO = permissoes;
      document.dispatchEvent(new Event("permissoes-carregadas"));

    } catch (err) {
      console.error("Erro em menu-permissoes.js:", err);
    }
  });

})();