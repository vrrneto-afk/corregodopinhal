// auth-guard.js
// GUARD GLOBAL – APP / ADM / CONFIG

// ⛔ NÃO EXECUTA NA TELA DE LOGIN
if (location.pathname.includes("/login/")) {
  console.log("Auth-guard ignorado na tela de login");
} else {

(function () {

  const wait = setInterval(() => {
    if (window.firebase && firebase.auth && firebase.firestore) {
      clearInterval(wait);
      iniciar();
    }
  }, 50);

  async function iniciar() {
    const auth = firebase.auth();
    const db   = firebase.firestore();

    auth.onAuthStateChanged(async (user) => {

      /* ================= NÃO LOGADO ================= */
      if (!user) {
        location.replace("../login/login.html");
        return;
      }

      /* ================= PÁGINA SEM CONTROLE (EX: INDEX) ================= */
      if (!window.PERMISSAO_PAGINA) {
        document.body.style.display = "block";
        return;
      }

      try {

        /* ================= USUÁRIO (MODELO NOVO) ================= */
        const snapUser = await db
          .collection("config")
          .doc("usuarios")
          .collection("lista")
          .doc(user.uid)
          .get();

        if (!snapUser.exists) {
          alert("Usuário não autorizado no sistema.");
          await auth.signOut();
          location.replace("../login/login.html");
          return;
        }

        const dadosUser = snapUser.data();

        if (dadosUser.ativo !== true) {
          alert("Usuário inativo. Acesso bloqueado.");
          await auth.signOut();
          location.replace("../login/login.html");
          return;
        }

        const papel = dadosUser.papel;

        /* ================= GRUPOS ================= */
        const snapGrupos = await db.collection("config").doc("grupos").get();

        if (!snapGrupos.exists) {
          throw new Error("Configuração de grupos não encontrada.");
        }

        const grupoCfg = snapGrupos
          .data()
          .lista
          .find(g => g.id === papel);

        if (!grupoCfg) {
          throw new Error("Grupo do usuário não existe.");
        }

        /* ================= PERMISSÃO ================= */
        const { area, chave } = window.PERMISSAO_PAGINA;

        const permitido =
          grupoCfg.permissoes?.[area]?.[chave] === true ||
          grupoCfg.permissoes?.[area]?.["tudo"] === true;

        if (!permitido) {
          alert("Você não tem permissão para acessar esta área.");
          location.replace("../app/index.html");
          return;
        }

        /* ================= OK ================= */
        window.USUARIO_ATUAL = {
          uid: user.uid,
          nome: dadosUser.nome,
          email: dadosUser.email,
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
}