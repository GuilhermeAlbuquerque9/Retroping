import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

window.cadastrar = async () => {
  const email = cadEmail.value;
  const senha = cadSenha.value;

  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    window.location.href = "postagens.html";
  } catch (error) {
    alert(error.message);
  }
};

window.entrar = async () => {
  const email = loginEmail.value;
  const senha = loginSenha.value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    window.location.href = "postagens.html";
  } catch (error) {
    alert("Email ou senha inválidos.");
  }
};

window.sair = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};

onAuthStateChanged(auth, (user) => {
  const pagina = location.pathname.split("/").pop();
  const protegidas = ["postagens.html","perfil.html","config.html"];

  if (!user && protegidas.includes(pagina)) {
    window.location.href = "index.html";
  }

  if (user && pagina === "index.html") {
    window.location.href = "postagens.html";
  }
});
