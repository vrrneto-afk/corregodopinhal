if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyCW-CuFDrOLO-dteckl_GrPTocmyS-IrzY",
    authDomain: "sitio-corrego-do-pinhal.firebaseapp.com",
    projectId: "sitio-corrego-do-pinhal"
  });
}

const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }

  try {
    const uid = user.uid;
    const ref = db.collection("usuarios").doc(uid);
    const doc = await ref.get();

    // 🟡 PRIMEIRO LOGIN → CRIA PERFIL SE NÃO EXISTIR
    if (!doc.exists) {
      await ref.set({
        nome: user.displayName || "",
        email: user.email,
        papel: "leitura",
        ativo: true,
        pendente: true,
        criado_em: firebase.firestore.FieldValue.serverTimestamp(),
        ultimo_login: firebase.firestore.FieldValue.serverTimestamp()
      });
      return; // deixa entrar, perfil já existe agora
    }

    const perfil = doc.data();

    if (!perfil.ativo) {
      alert("Usuário desativado.");
      await auth.signOut();
      window.location.replace("login.html");
      return;
    }

    // Controle de papel
    if (window.PERMISSAO_MINIMA) {
      const hierarquia = { admin: 3, operador: 2, leitura: 1 };
      if ((hierarquia[perfil.papel] || 0) < hierarquia[window.PERMISSAO_MINIMA]) {
        alert("Você não tem permissão para acessar esta página.");
        window.location.replace("index.html");
        return;
      }
    }

    // Atualiza último login
    await ref.update({
      ultimo_login: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log("Acesso liberado:", perfil.nome, perfil.papel);

  } catch (e) {
    console.error("Erro no auth-guard:", e);
    await auth.signOut();
    window.location.replace("login.html");
  }
});
