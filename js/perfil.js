import { auth, db } from "./firebase.js";
import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { doc, getDoc } 
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

onAuthStateChanged(auth,async user=>{
  if(!user) location="index.html";
  const snap=await getDoc(doc(db,"users",user.uid));
  const d=snap.data();

  perfilBox.innerHTML=`
  <p><strong>Nome:</strong> ${d.nome}</p>
  <p><strong>Email:</strong> ${d.email}</p>
  <p><strong>Descrição:</strong> ${d.descricao}</p>
  <p><strong>Privado:</strong> ${d.privado?"Sim":"Não"}</p>
  <p><strong>Amigos:</strong> ${d.amigos.length}</p>
  `;
});