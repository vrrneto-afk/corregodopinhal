// auth-guard.js
// GUARD GLOBAL – APP / ADM / CONFIG

(function () {

  const wait = setInterval(() => {
    if (
      window.firebase &&
      firebase.auth
    ) {
      clearInterval(wait);
      iniciar();
    }
  }, 50);

  async function iniciar() {
    const auth = firebase.auth();

    auth.onAuthStateChanged(async (user) => {

      /* ================= NÃO LOGADO ================= */
      if (!user) {
        location.replace("../login/login.html");
        return;
      }

      /* ================= SEM IDENTIFICAÇÃO DA PÁGINA ================= */
      if (!window.PERMISSAO_PAGINA) {
        console.error("PERMISSAO_PAGINA não definida.");
        await auth.signOut();
        location.replace("../login/login.html");
        return;
      }

      /* ================= FIRESTORE OBRIGATÓRIO ================= */
      if (!firebase.firestore) {
        console.error("Firestore não carregado.");
        await auth.signOut();
        location.replace("../login/login.html");
        return;
      }

      const db = firebase.firestore();

      try {

        /* ================= USUÁRIO ================= */
        const snapUser = await db.collection("usuarios").doc(user.uid).get();

        if (!snapUser.exists || snapUser.data().ativo !== true) {
          await auth.signOut();
          location.replace("../login/login.html");
          return;
        }

        const papel = snapUser.data().papel;

        /* ================= GRUPOS ================= */
        const snapGrupos = await db.collection("config").doc("grupos").get();

        if (!snapGrupos.exists) {
          throw new Error("Config grupos não encontrada");
        }

        const grupoCfg = snapGrupos.data().lista.find(g => g.id === papel);

        if (!grupoCfg) {
          throw new Error("Grupo do usuário não existe");
        }

        /* ================= PERMISSÃO ================= */
        const { area, chave } = window.PERMISSAO_PAGINA;

        const permitido =
          grupoCfg.permissoes?.[area]?.[chave] === true ||
          grupoCfg.permissoes?.[area]?.["tudo"] === true;

        if (!permitido) {
          alert("Você não tem permissão para acessar esta área.");
          await auth.signOut();
          location.replace("../login/login.html");
          return;
        }

        /* ================= OK ================= */
        window.USUARIO_ATUAL = {
          uid: user.uid,
          papel,
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