import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const lista = document.getElementById("listaPosts");

window.criarPost = async () => {
  const texto = mensagem.value;
  const user = auth.currentUser;

  await addDoc(collection(db,"posts"),{
    uid: user.uid,
    nome: user.email.split("@")[0],
    mensagem: texto,
    likes: [],
    dislikes: [],
    criadoEm: new Date()
  });

  mensagem.value = "";
  carregarPosts();
};

window.toggleLike = async (id) => {
  const user = auth.currentUser;
  const ref = doc(db,"posts",id);
  const snap = await getDoc(ref);
  const data = snap.data();

  let likes = data.likes || [];
  let dislikes = data.dislikes || [];

  if (likes.includes(user.uid)) {
    likes = likes.filter(u => u !== user.uid);
  } else {
    likes.push(user.uid);
    dislikes = dislikes.filter(u => u !== user.uid);
  }

  await updateDoc(ref,{ likes, dislikes });
  carregarPosts();
};

window.toggleDislike = async (id) => {
  const user = auth.currentUser;
  const ref = doc(db,"posts",id);
  const snap = await getDoc(ref);
  const data = snap.data();

  let likes = data.likes || [];
  let dislikes = data.dislikes || [];

  if (dislikes.includes(user.uid)) {
    dislikes = dislikes.filter(u => u !== user.uid);
  } else {
    dislikes.push(user.uid);
    likes = likes.filter(u => u !== user.uid);
  }

  await updateDoc(ref,{ likes, dislikes });
  carregarPosts();
};

async function carregarPosts(){
  lista.innerHTML = "";
  const query = await getDocs(collection(db,"posts"));

  query.forEach(docSnap=>{
    const p = docSnap.data();
    lista.innerHTML += `
      <div class="post">
        <h3>${p.nome}</h3>
        <p>${p.mensagem}</p>
        <button onclick="toggleLike('${docSnap.id}')">
          👍 ${p.likes?.length || 0}
        </button>
        <button onclick="toggleDislike('${docSnap.id}')">
          👎 ${p.dislikes?.length || 0}
        </button>
      </div>
    `;
  });
}

carregarPosts();
