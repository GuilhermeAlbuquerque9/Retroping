import { auth, db } from "./firebase.js";
import { onAuthStateChanged, deleteUser } 
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { doc, updateDoc, getDoc, deleteDoc } 
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

let currentUser;

onAuthStateChanged(auth,user=>{
  if(!user) location="index.html";
  currentUser=user;
});

window.salvar = async ()=>{
  await updateDoc(doc(db,"users",currentUser.uid),{
    nome:novoNome.value,
    descricao:novaDescricao.value
  });
  alert("Atualizado!");
};

window.alternarPrivacidade = async ()=>{
  const snap=await getDoc(doc(db,"users",currentUser.uid));
  await updateDoc(doc(db,"users",currentUser.uid),{
    privado:!snap.data().privado
  });
  alert("Privacidade alterada!");
};

window.excluirConta = async ()=>{
  await deleteDoc(doc(db,"users",currentUser.uid));
  await deleteUser(currentUser);
  location="index.html";
};