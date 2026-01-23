// app-bootstrap.js
// ====================================
// BOOTSTRAP GLOBAL DO APP
// ====================================

(function () {

  const App = {
    cache: {
      get(key) {
        try {
          const data = sessionStorage.getItem(key);
          return data ? JSON.parse(data) : null;
        } catch {
          return null;
        }
      },
      set(key, value) {
        sessionStorage.setItem(key, JSON.stringify(value));
      },
      clear() {
        sessionStorage.clear();
      }
    }
  };

  window.App = App;

  // ================================
  // ESPERA FIREBASE
  // ================================
  document.addEventListener("firebase-ready", initApp);

  function initApp() {

    // ================================
    // AUTH
    // ================================
    auth.onAuthStateChanged(async (user) => {

      // NÃO LOGADO
      if (!user) {
        location.replace("../login/login.html");
        return;
      }

      // PERFIL EM CACHE
      let perfil = App.cache.get("perfil");

      if (!perfil) {
        const snap = await db.collection("usuarios").doc(user.uid).get();
        if (!snap.exists) {
          await auth.signOut();
          location.replace("../login/login.html");
          return;
        }

        perfil = snap.data();
        App.cache.set("perfil", perfil);
      }

      window.USUARIO_ATUAL = perfil;

      document.dispatchEvent(new Event("app-ready"));
    });
  }

})();
