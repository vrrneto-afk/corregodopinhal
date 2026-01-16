// auth-adm.js — utilidades administrativas

(function () {

  const auth = firebase.auth();

  window.logout = function () {
    auth.signOut().then(() => {
      window.location.replace("/login/login.html");
    });
  };

})();
