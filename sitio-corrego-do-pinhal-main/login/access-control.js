// access-control.js
// Verificação de permissão por área e página
// Assume que o auth-guard já validou login

(function () {

  const auth = firebase.auth();
  const db = firebase.firestore();

  window.verificarAcesso = async function (area, pagina) {

    const user = auth.currentUser;
    if (!user) {
      window.location.replace("/login/login.html");
      return;
    }

    const uid = user.uid;

    const usuariosSnap = await db.collection("config").doc("usuarios").get();
    if (!usuariosSnap.exists) {
      alert("Configuração de usuários não encontrada.");
      window.location.replace("/login/login.html");
      return;
    }

    const usuarios = usuariosSnap.data().lista || [];
    const usuario = usuarios.find(u => u.uid === uid);

    if (!usuario || usuario.ativo !== true) {
      alert("Usuário sem acesso.");
      window.location.replace("/login/login.html");
      return;
    }

    const gruposSnap = await db.collection("config").doc("grupos").get();
    if (!gruposSnap.exists) {
      alert("Configuração de grupos não encontrada.");
      window.location.replace("/login/login.html");
      return;
    }

    const grupos = gruposSnap.data().lista || [];
    const grupo = grupos.find(g => g.id === usuario.grupo);

    if (!grupo) {
      alert("Grupo do usuário não encontrado.");
      window.location.replace("/login/login.html");
      return;
    }

    const permissaoArea = grupo.permissoes?.[area];

    if (!permissaoArea) {
      alert("Acesso não permitido.");
      window.location.replace("/app/index.html");
      return;
    }

    if (permissaoArea.tudo === true) return true;
    if (permissaoArea[pagina] === true) return true;

    alert("Você não tem permissão para acessar esta página.");
    window.location.replace("/app/index.html");
  };

})();
