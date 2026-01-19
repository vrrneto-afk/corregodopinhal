/* ======================================================
   CONTROLE DE PERMISSÕES DO MENU (APP)
   ====================================================== */

(async function(){

  const auth = firebase.auth();
  const db   = firebase.firestore();

  auth.onAuthStateChanged(async user=>{
    if(!user){
      ocultarTudo();
      return;
    }

    try{
      const snapUser = await db.collection("usuarios").doc(user.uid).get();
      if(!snapUser.exists){
        ocultarTudo();
        return;
      }

      const grupoId = snapUser.data().papel;

      const snapCfg = await db.collection("config").doc("grupos").get();
      if(!snapCfg.exists){
        ocultarTudo();
        return;
      }

      const grupo = snapCfg.data().lista.find(g => g.id === grupoId);
      if(!grupo){
        ocultarTudo();
        return;
      }

      document.querySelectorAll(".menu-link[data-area]").forEach(link=>{
        const area  = link.dataset.area;
        const chave = link.dataset.chave;

        const permitido =
          grupo.permissoes?.[area]?.[chave] === true ||
          grupo.permissoes?.config?.tudo === true;

        if(!permitido){
          link.style.display = "none";
        }
      });

    }catch(err){
      console.error("Erro ao aplicar permissões do menu:", err);
      ocultarTudo();
    }
  });

  function ocultarTudo(){
    document.querySelectorAll(".menu-link").forEach(l=>{
      if(!l.classList.contains("sair")){
        l.style.display = "none";
      }
    });
  }

})();