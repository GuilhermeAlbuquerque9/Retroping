import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

import {
  updateEmail,
  updatePassword
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";


auth.onAuthStateChanged(async user=>{
  if(user){

    novoEmail.value = user.email;

    const snap = await getDoc(doc(db,"users",user.uid));
    const data = snap.data();

    if(data){
      novoNome.value = data.nome || "";
      novaDescricao.value = data.descricao || "";
    }
  }
});


window.salvarTudo = async () => {

  const user = auth.currentUser;

  try{

    // Atualiza Firestore
    await updateDoc(doc(db,"users",user.uid),{
      nome: novoNome.value,
      descricao: novaDescricao.value
    });

    // Atualiza email se mudou
    if(novoEmail.value !== user.email){
      await updateEmail(user, novoEmail.value);
    }

    // Atualiza senha se digitada
    if(novaSenha.value.trim() !== ""){
      await updatePassword(user, novaSenha.value);
    }

    alert("Configurações atualizadas com sucesso!");

  } catch(error){
    alert("Pode ser necessário fazer login novamente para alterar email/senha.");
  }

};
