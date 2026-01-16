// auth-guard.js
// Guardião global de autenticação + autorização por grupo (baseado em config/grupos)

(function () {

  const esperarFirebase = setInterval(() => {
    if (window.firebase && firebase.auth && firebase.firestore) {
      clearInterval(esperarFirebase);
      iniciar();
    }
  }, 50);

  function iniciar() {

    const auth = firebase.auth();
    const db = firebase.firestore();

    auth.onAuthStateChanged(async (user) => {

      // ❌ NÃO LOGADO
      if (!user) {
        redirecionarLogin();
        return;
      }

      try {
        // 🔹 BUSCA USUÁRIO
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

        const grupoUsuario = dadosUsuario.grupo;
        if (!grupoUsuario) {
          await bloquear("Grupo de usuário não definido.");
          return;
        }

        // 🔹 BUSCA CONFIG DE GRUPOS
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

        // 🔐 VALIDA PERMISSÃO DA PÁGINA (SE DEFINIDA)
        if (window.PERMISSAO_PAGINA) {

          const { area, chave } = window.PERMISSAO_PAGINA;

          if (!area || !chave) {
            console.warn("PERMISSAO_PAGINA mal definida.");
          } else {
            const permitido =
              grupoConfig.permissoes &&
              grupoConfig.permissoes[area] &&
              grupoConfig.permissoes[area][chave] === true;

            if (!permitido) {
              await bloquear("Você não tem permissão para acessar esta página.");
              return;
            }
          }
        }

        // ✅ OK — USUÁRIO AUTORIZADO
        window.USUARIO_ATUAL = {
          uid: user.uid,
          email: user.email,
          grupo: grupoUsuario,
          dados: dadosUsuario
        };

        // Atualiza último login (sem travar fluxo)
        refUser.update({
          ultimo_login: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(() => {});

        // 🔁 SE ESTIVER NO LOGIN → INDEX
        if (location.pathname.includes("/login/")) {
          location.replace("../app/index.html");
        }

      } catch (e) {
        console.error(e);
        await bloquear("Erro ao verificar permissões.");
      }
    });
  }

  function redirecionarLogin() {
    if (!location.pathname.includes("/login/")) {
      location.replace("../login/login.html");
    }
  }

  async function bloquear(msg) {
    alert(msg);
    try {
      await firebase.auth().signOut();
    } catch (e) {}
    location.replace("../login/login.html");
  }

})();