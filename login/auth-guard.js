// auth-guard.js
// Guardião global de autenticação + autorização por grupo
// VERSÃO DEFINITIVA — BLOQUEIO IMEDIATO

(function () {

  // 🔒 BLOQUEIA A TELA IMEDIATAMENTE
  const bloqueio = document.createElement("div");
  bloqueio.style.position = "fixed";
  bloqueio.style.top = 0;
  bloqueio.style.left = 0;
  bloqueio.style.width = "100vw";
  bloqueio.style.height = "100vh";
  bloqueio.style.background = "#f6efe7";
  bloqueio.style.zIndex = 99999;
  document.documentElement.appendChild(bloqueio);

  function liberarTela() {
    bloqueio.remove();
  }

  function redirecionarLogin() {
    if (!location.pathname.includes("/login/")) {
      location.replace("../login/login.html");
    }
  }

  async function bloquear(msg) {
    alert(msg);
    try { await firebase.auth().signOut(); } catch (e) {}
    redirecionarLogin();
  }

  const esperarFirebase = setInterval(() => {
    if (window.firebase && firebase.auth && firebase.firestore) {
      clearInterval(esperarFirebase);
      iniciar();
    }
  }, 50);

  function iniciar() {

    const auth = firebase.auth();
    const db   = firebase.firestore();

    // 🔐 VERIFICA IMEDIATA
    const userAtual = auth.currentUser;
    if (!userAtual) {
      redirecionarLogin();
      return;
    }

    auth.onAuthStateChanged(async (user) => {

      if (!user) {
        redirecionarLogin();
        return;
      }

      try {
        // 🔹 USUÁRIO
        const refUser = db.collection("usuarios").doc(user.uid);
        const snapUser = await refUser.get();

        if (!snapUser.exists) {
          await bloquear("Usuário não autorizado.");
          return;
        }

        const dadosUsuario = snapUser.data();

        if (dadosUsuario.ativo !== true) {
          await bloquear("Usuário desativado.");
          return;
        }

        const grupoUsuario = dadosUsuario.papel;
        if (!grupoUsuario) {
          await bloquear("Grupo de usuário não definido.");
          return;
        }

        // 🔹 CONFIG GRUPOS
        const snapGrupos = await db.collection("config").doc("grupos").get();
        if (!snapGrupos.exists) {
          await bloquear("Configuração de grupos não encontrada.");
          return;
        }

        const grupos = snapGrupos.data().lista || [];
        const grupoConfig = grupos.find(g => g.id === grupoUsuario);

        if (!grupoConfig) {
          await bloquear("Grupo de usuário inválido.");
          return;
        }

        // 🔐 PERMISSÃO DA PÁGINA
        if (window.PERMISSAO_PAGINA) {
          const { area, chave } = window.PERMISSAO_PAGINA;

          const permitido =
            grupoConfig.permissoes?.[area]?.[chave] === true;

          if (!permitido) {
            await bloquear("Você não tem permissão para acessar esta página.");
            return;
          }
        }

        // ✅ USUÁRIO AUTORIZADO
        window.USUARIO_ATUAL = {
          uid: user.uid,
          email: user.email,
          grupo: grupoUsuario,
          dados: dadosUsuario
        };

        // Atualiza último login (sem travar)
        refUser.update({
          ultimo_login: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(() => {});

        // 🔓 LIBERA A TELA
        liberarTela();

        // 🔁 LOGIN → INDEX
        if (location.pathname.includes("/login/")) {
          location.replace("../app/index.html");
        }

      } catch (e) {
        console.error(e);
        await bloquear("Erro ao verificar permissões.");
      }
    });
  }

})();