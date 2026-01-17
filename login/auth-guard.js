// auth-guard.js
// USO EXCLUSIVO EM /app

(function(){

  const esperar = setInterval(()=>{
    if(window.firebase && firebase.auth && firebase.firestore){
      clearInterval(esperar);
      iniciar();
    }
  },50);

  function iniciar(){
    const auth = firebase.auth();
    const db   = firebase.firestore();

    auth.onAuthStateChanged(async user=>{
      if(!user){
        location.replace("../login/login.html");
        return;
      }

      try{
        const snapUser = await db.collection("usuarios").doc(user.uid).get();
        if(!snapUser.exists || snapUser.data().ativo !== true){
          await auth.signOut();
          location.replace("../login/login.html");
          return;
        }

        const grupo = snapUser.data().papel;
        const snapGrupos = await db.collection("config").doc("grupos").get();
        const grupoCfg = snapGrupos.data().lista.find(g=>g.id===grupo);

        if(window.PERMISSAO_PAGINA){
          const {area,chave} = window.PERMISSAO_PAGINA;
          if(!grupoCfg?.permissoes?.[area]?.[chave]){
            alert("Sem permissão.");
            await auth.signOut();
            location.replace("../login/login.html");
            return;
          }
        }

        window.USUARIO_ATUAL = {uid:user.uid, grupo};

      }catch(e){
        console.error(e);
        await auth.signOut();
        location.replace("../login/login.html");
      }
    });
  }

})();