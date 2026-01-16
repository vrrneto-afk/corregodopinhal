// auth-adm.js — UTILIDADES ADM (SEM GUARD)

(function () {

  const auth = firebase.auth();

  // Logout global
  window.logout = function () {
    auth.signOut().then(() => {
      window.location.replace("login.html");
    });
  };

})();
