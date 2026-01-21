// 📦 BUSCA VERSÃO DO APP NO SERVICE WORKER
if ("serviceWorker" in navigator) {

  navigator.serviceWorker.ready.then(reg => {
    if (reg.active) {
      reg.active.postMessage("GET_VERSION");
    }
  });

  navigator.serviceWorker.addEventListener("message", event => {
    if (event.data && event.data.version) {

      // remove prefixo do cache
      const versao = event.data.version
        .replace("corregodopinhal-", "");

      const el = document.getElementById("appVersao");
      if (el) {
        el.textContent = versao;
      }
    }
  });

}
