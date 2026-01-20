(async function(){

  const auth = firebase.auth();
  const db   = firebase.firestore();

  auth.onAuthStateChanged(async user=>{
    if(!user) return;

    const snapUser = await db.collection("usuarios").doc(user.uid).get();
    if(!snapUser.exists) return;

    const grupoId = snapUser.data().papel;
    if(!grupoId) return;

    const snapCfg = await db.collection("config").doc("grupos").get();
    if(!snapCfg.exists) return;

    const grupo = snapCfg.data().lista.find(g => g.id === grupoId);
    if(!grupo) return;

    const permissoes = grupo.permissoes || {};

    document.querySelectorAll(".menu-link[data-area]").forEach(link=>{
      const area  = link.dataset.area;
      const chave = link.dataset.chave;

      let permitido = false;

      /* 🔑 REGRA 1 — permissão direta (relatórios, app, etc) */
      if (permissoes[chave] === true) {
        permitido = true;
      }

      /* 🔑 REGRA 2 — estrutura por área (legado / config) */
      else if (
        permissoes[area]?.[chave] === true
      ) {
        permitido = true;
      }

      /* 🔑 REGRA 3 — config tudo */
      else if (
        area === "config" &&
        permissoes.config?.tudo === true
      ) {
        permitido = true;
      }

      if(!permitido){
        link.remove();
      }
    });

    /* 🔓 LIBERA MENU */
    const wrapper = document.querySelector(".menu-wrapper");
    if(wrapper){
      wrapper.style.visibility = "visible";
    }
  });

})();
