import { auth, db } from "./firebase.js";
import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, arrayUnion } 
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

let currentUser;

onAuthStateChanged(auth,user=>{
  if(!user) location="index.html";
  currentUser=user;
  carregar();
});

window.postar = async ()=>{
  await addDoc(collection(db,"postagens"),{
    autor:currentUser.uid,
    texto:texto.value,
    criadoEm:new Date(),
    likes:[],
    dislikes:[],
    ocultadoPor:[]
  });
  texto.value="";
  carregar();
};

async function carregar(){
  const q=query(collection(db,"postagens"),orderBy("criadoEm","desc"));
  const snap=await getDocs(q);
  feed.innerHTML="";
  snap.forEach(docSnap=>{
    const d=docSnap.data();
    if(d.ocultadoPor.includes(currentUser.uid)) return;
    feed.innerHTML+=`
    <div class="post">
    <p>${d.texto}</p>
    <button onclick="like('${docSnap.id}')">👍 ${d.likes.length}</button>
    <button onclick="dislike('${docSnap.id}')">👎 ${d.dislikes.length}</button>
    <button onclick="ocultar('${docSnap.id}')">🚫</button>
    </div>`;
  });
}

window.like = async id=>{
  await updateDoc(doc(db,"postagens",id),{
    likes:arrayUnion(currentUser.uid)
  });
  carregar();
};

window.dislike = async id=>{
  await updateDoc(doc(db,"postagens",id),{
    dislikes:arrayUnion(currentUser.uid)
  });
  carregar();
};

window.ocultar = async id=>{
  await updateDoc(doc(db,"postagens",id),{
    ocultadoPor:arrayUnion(currentUser.uid)
  });
  carregar();
};