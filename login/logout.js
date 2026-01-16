// logout.js
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("#btnLogout");
  if (!btn) return;

  e.preventDefault();

  try {
    await firebase.auth().signOut();
    location.replace("../login/login.html");
  } catch (err) {
    alert("Erro ao sair.");
    console.error(err);
  }
});