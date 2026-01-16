// logout.js
document.addEventListener("DOMContentLoaded", () => {
  const btnLogout = document.getElementById("btnLogout");

  if (!btnLogout) return;

  btnLogout.addEventListener("click", async (e) => {
    e.preventDefault();

    try{
      await firebase.auth().signOut();
      location.replace("../login/login.html");
    }catch(err){
      alert("Erro ao sair.");
      console.error(err);
    }
  });
});
