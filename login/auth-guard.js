// auth-guard.js
// Guardião global de autenticação + autorização por grupo
// VERSÃO DEFINITIVA — LOGIN SEGURO SEM LOOP

(function () {

  const emLogin = location.pathname.includes("/login/");

  // 🔓 LOGIN NÃO DEVE SER BLOQUEADO
  if (emLogin) {
    iniciarLogin();
    return;
  }

  // 🔒 BLOQUEIO VISUAL IMEDIATO (APENAS FORA DO LOGIN)
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
    location.replace("../login/login.html");
  }

  async function bloquear(msg) {
    alert(msg);
    try { await firebase.auth().signOut(); } catch (e) {}
    redirecionarLogin();
  }

  const esperarFirebase = setInterval(() => {
    if (window.firebase && firebase.auth && firebase.firestore) {
      clearInterval(esperarFirebase);
      iniciarApp();
    }
  }, 50);

  function iniciarApp() {

    const auth = firebase.auth();
    const db   = firebase.firestore();

    // 🔐 VERIFICA IMEDIATA
    if (!auth.currentUser) {
      redirecionarLogin();
      return;
    }

    auth.onAuthStateChanged(async (user) => {

      if (!user) {
        redirecionarLogin();
        return;
      }

      try {
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
          await bloquear("Grupo não definido.");
          return;
        }

        const snapGrupos = await db.collection("config").doc("grupos").get();
        if (!snapGrupos.exists) {
          await bloquear("Configuração de grupos ausente.");
          return;
        }

        const grupos = snapGrupos.data().lista || [];
        const grupoConfig = grupos.find(g => g.id === grupoUsuario);

        if (!grupoConfig) {
          await bloquear("Grupo inválido.");
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

        // ✅ OK
        window.USUARIO_ATUAL = {
          uid: user.uid,
          email: user.email,
          grupo: grupoUsuario,
          dados: dadosUsuario
        };

        refUser.update({
          ultimo_login: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(()=>{});

        liberarTela();

      } catch (e) {
        console.error(e);
        await bloquear("Erro ao validar acesso.");
      }
    });
  }

  // 🔓 LOGIN: APENAS REDIRECIONA SE JÁ LOGADO
  function iniciarLogin() {
    const esperar = setInterval(() => {
      if (window.firebase && firebase.auth) {
        clearInterval(esperar);
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            location.replace("../app/index.html");
          }
        });
      }
    }, 50);
  }

})();