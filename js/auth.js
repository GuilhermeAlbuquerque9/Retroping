import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";


// ===============================
// CRIAR CONTA
// ===============================
window.cadastrar = async () => {
  try {

    const email = document.getElementById("cadEmail").value;
    const senha = document.getElementById("cadSenha").value;

    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      nome: email.split("@")[0],
      email: email,
      descricao: "Sou novo no Retroping™!",
      privado: false,
      criadoEm: new Date()
    });

    alert("Conta criada com sucesso!");
    window.location.href = "postagens.html";

  } catch (error) {

    if (error.code === "auth/email-already-in-use") {
      alert("Esse email já está cadastrado.");
    }
    else if (error.code === "auth/weak-password") {
      alert("A senha precisa ter no mínimo 6 caracteres.");
    }
    else {
      alert("Erro: " + error.message);
    }

  }
};


// ===============================
// LOGIN
// ===============================
window.entrar = async () => {
  try {

    const email = document.getElementById("loginEmail").value;
    const senha = document.getElementById("loginSenha").value;

    await signInWithEmailAndPassword(auth, email, senha);

    window.location.href = "postagens.html";

  } catch (error) {
    alert("Email ou senha inválidos.");
  }
};


// ===============================
// LOGOUT
// ===============================
window.sair = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};


// ===============================
// CONTROLE DE ACESSO AUTOMÁTICO
// ===============================
onAuthStateChanged(auth, (user) => {

  const pagina = window.location.pathname.split("/").pop();

  const paginasProtegidas = [
    "postagens.html",
    "perfil.html",
    "config.html"
  ];

  if (!user && paginasProtegidas.includes(pagina)) {
    window.location.href = "index.html";
  }

  if (user && pagina === "index.html") {
    window.location.href = "postagens.html";
  }

});