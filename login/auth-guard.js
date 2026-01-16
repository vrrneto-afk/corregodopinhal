// auth-guard.js
// Controle global de autenticação e permissões

(function(){

  function esperarFirebase(){
    return new Promise(resolve=>{
      const i=setInterval(()=>{
        if(window.firebase && firebase.auth && firebase.firestore){
          clearInterval(i);
          resolve();
        }
      },50);
    });
  }

  (async()=>{

    await esperarFirebase();

    if(!firebase.apps.length){
      firebase.initializeApp({
        apiKey:"AIzaSyCW-CuFDrOLO-dteckl_GrPTocmyS-IrzY",
        authDomain:"sitio-corrego-do-pinhal.firebaseapp.com",
        projectId:"sitio-corrego-do-pinhal"
      });
    }

    const auth=firebase.auth();
    const db=firebase.firestore();

    auth.onAuthStateChanged(async user=>{

      const estaNoLogin = location.pathname.includes("/login/");

      // ❌ NÃO LOGADO
      if(!user){
        if(!estaNoLogin){
          location.replace("../login/login.html");
        }
        return;
      }

      const email = user.email;

      // 🔎 BUSCA USUÁRIO NO FIRESTORE
      const ref=db.collection("config").doc("usuarios");
      const snap=await ref.get();

      const lista = snap.exists ? snap.data().lista || [] : [];
      const usuario = lista.find(u=>u.email===email);

      // 🚫 NÃO CADASTRADO PELO ADM
      if(!usuario){
        alert("Usuário não cadastrado. Procure o administrador.");
        await auth.signOut();
        location.replace("../login/login.html");
        return;
      }

      // 🚫 INATIVO
      if(usuario.ativo!==true){
        alert("Usuário desativado.");
        await auth.signOut();
        location.replace("../login/login.html");
        return;
      }

      // ✅ USUÁRIO VÁLIDO
      window.USUARIO_ATUAL = usuario;

      // 🔁 LOGIN → APP
      if(estaNoLogin){
        location.replace("../app/index.html");
      }

    });

  })();

})();