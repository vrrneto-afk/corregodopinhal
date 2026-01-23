// firebase-init.js
// ================================
// INICIALIZAÇÃO ÚNICA DO FIREBASE
// ================================

(function () {

  if (window.__FIREBASE_READY__) return;

  const waitFirebase = setInterval(() => {
    if (window.firebase && firebase.initializeApp) {
      clearInterval(waitFirebase);
      initFirebase();
    }
  }, 20);

  function initFirebase() {

    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyCW-CuFDrOLO-dteckl_GrPTocmyS-IrzY",
        authDomain: "sitio-corrego-do-pinhal.firebaseapp.com",
        projectId: "sitio-corrego-do-pinhal"
      });
    }

    // Atalhos globais (performance)
    window.auth = firebase.auth();
    window.db   = firebase.firestore();

    window.__FIREBASE_READY__ = true;

    // Evento para quem quiser escutar
    document.dispatchEvent(new Event("firebase-ready"));
  }

})();
