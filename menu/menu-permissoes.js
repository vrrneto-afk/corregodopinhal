(async function(){

  const auth = firebase.auth();
  const db   = firebase.firestore();

  auth.onAuthStateChanged(async user=>{
    if(!user) return;

    const snapUser = await db.collection("usuarios").doc(user.uid).get();
    if(!snapUser.exists) return;

    const grupoId = snapUser.data().papel;

    const snapCfg = await db.collection("config").doc("grupos").get();
    if(!snapCfg.exists) return;

    const grupo = snapCfg.data().lista.find(g => g.id === grupoId);
    if(!grupo) return;

    document.querySelectorAll(".menu-link[data-area]").forEach(link=>{
      const area  = link.dataset.area;
      const chave = link.dataset.chave;

      const permitido =
        grupo.permissoes?.[area]?.[chave] === true ||
        grupo.permissoes?.config?.tudo === true;

      if(!permitido){
        link.remove();
      }
    });

    const wrapper = document.querySelector(".menu-wrapper");
    if(wrapper){
      wrapper.style.visibility = "visible";
    }
  });

})();