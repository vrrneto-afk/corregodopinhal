// 🔒 CARREGA UTIL DE DATA GLOBAL
(function(){
  const s = document.createElement("script");
  s.src = "../utils/date-utils.js";
  document.head.appendChild(s);
})();

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

/* ================= ATALHO ADM (ÍCONE) ================= */
const adminIcon = document.getElementById("menu-admin-icon");

if (
  adminIcon &&
  permissoes?.adm &&
  Object.values(permissoes.adm).some(v => v === true)
) {
  adminIcon.style.display = "flex";
}

      /* ================= LIBERA MENU ================= */
      const wrapper = document.querySelector(".menu-wrapper");
      if (wrapper) {
        wrapper.style.visibility = "visible";
      }

      /* ================= EVENTO GLOBAL ================= */
      window.PERMISSOES_USUARIO = permissoes;
      document.dispatchEvent(new Event("permissoes-carregadas"));

      /* =================================================
         FOOTER GLOBAL – USUÁRIO / SAIR / VERSÃO
         ================================================= */

      // evita duplicar footer
      if (!document.getElementById("footer-global")) {

        const footerContainer = document.createElement("div");
        footerContainer.id = "footer-global";
        document.body.appendChild(footerContainer);

        try {
          const r = await fetch("../menu/footer.html");
          const html = await r.text();
          footerContainer.innerHTML = html;

          /* --- usuário logado --- */
          const elUsuario = document.getElementById("footerUsuario");
          if (elUsuario && snapUser.data().usuario) {
            elUsuario.querySelector("span").textContent =
              `Usuário: ${snapUser.data().usuario}`;
          }

          /* --- logout --- */
          const btnLogout = document.getElementById("footerLogout");
          if (btnLogout) {
            btnLogout.addEventListener("click", (e) => {
              e.preventDefault();
              auth.signOut();
            });
          }

          /* --- versão do app (Service Worker) --- */
          if ("serviceWorker" in navigator) {

            // recebe resposta do SW
            navigator.serviceWorker.addEventListener("message", event => {
              if (event.data && event.data.version) {

                const versao = event.data.version
                  .replace("corregodopinhal-", "");

                const elVersao = document.getElementById("appVersao");
                if (elVersao) {
                  elVersao.textContent = versao;
                }
              }
            });

            // solicita versão
            navigator.serviceWorker.ready.then(reg => {
              if (reg.active) {
                reg.active.postMessage("GET_VERSION");
              }
            });
          }

        } catch (e) {
          console.error("Erro ao carregar footer:", e);
        }
      }

    } catch (err) {
      console.error("Erro em menu-permissoes.js:", err);
    }
  });

})();
