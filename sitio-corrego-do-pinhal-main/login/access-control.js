// access-control.js
// Controle central de acesso por grupo e página

(async function () {

  // Aguarda Firebase Auth estar disponível
  const auth = firebase.auth();
  const db = firebase.firestore();

  // Função pública
  window.verificarAcesso = async function (area, pagina) {

    return new Promise((resolve, reject) => {

      auth.onAuthStateChanged(async (user) => {

        if (!user) {
          // Não logado
          window.location.href = "login.html";
          return;
        }

        const uid = user.uid;
        const email = user.email || "";

        // 🔹 Busca usuários
        const usuariosRef = db.collection("config").doc("usuarios");
        const usuariosSnap = await usuariosRef.get();

        let usuarios = [];
        if (usuariosSnap.exists) {
          usuarios = usuariosSnap.data().lista || [];
        }

        let usuario = usuarios.find(u => u.uid === uid);

        // 🔹 AUTO-REGISTRO (primeiro login)
        if (!usuario) {
          usuario = {
            uid,
            nome: email.split("@")[0] || "Usuário",
            email,
            grupo: "leitor",
            ativo: false,
            criado_em: firebase.firestore.FieldValue.serverTimestamp()
          };

          usuarios.push(usuario);
          await usuariosRef.set({ lista: usuarios }, { merge: true });

          alert(
            "Seu acesso foi registrado, mas ainda não foi liberado.\n" +
            "Aguarde o administrador."
          );

          window.location.href = "index.html";
          return;
        }

        // 🔹 Usuário inativo
        if (usuario.ativo !== true) {
          alert("Acesso bloqueado. Usuário desativado.");
          window.location.href = "index.html";
          return;
        }

        // 🔹 Busca grupos
        const gruposSnap = await db.collection("config").doc("grupos").get();
        if (!gruposSnap.exists) {
          alert("Configuração de grupos não encontrada.");
          window.location.href = "index.html";
          return;
        }

        const grupos = gruposSnap.data().lista || [];
        const grupo = grupos.find(g => g.id === usuario.grupo);

        if (!grupo) {
          alert("Grupo do usuário não encontrado.");
          window.location.href = "index.html";
          return;
        }

        // 🔹 Permissões
        const permissoesArea = grupo.permissoes?.[area];

        if (!permissoesArea) {
          alert("Acesso não permitido.");
          window.location.href = "index.html";
          return;
        }

        // 🔹 Permissão total
        if (permissoesArea.tudo === true) {
          resolve(true);
          return;
        }

        // 🔹 Permissão específica
        if (permissoesArea[pagina] === true) {
          resolve(true);
          return;
        }

        // ❌ Sem permissão
        alert("Você não tem permissão para acessar esta página.");
        window.location.href = "index.html";
      });
    });
  };

})();
