import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

//////////////////////////////////////////////////
// ELEMENTOS
//////////////////////////////////////////////////

const nomeEl = document.getElementById("nomePerfil");
const bioEl = document.getElementById("bioPerfil");
const listaAmigos = document.getElementById("listaAmigos");
const listaComunidades = document.getElementById("listaComunidades");

//////////////////////////////////////////////////
// VARIÁVEIS
//////////////////////////////////////////////////

let usuarioAtual;
let perfilUid;

//////////////////////////////////////////////////
// PEGAR UID DA URL
//////////////////////////////////////////////////

function getPerfilUid(){
  const params = new URLSearchParams(window.location.search);
  return params.get("uid");
}

//////////////////////////////////////////////////
// AUTH
//////////////////////////////////////////////////

auth.onAuthStateChanged(async user => {

  if(!user){
    window.location.href = "login.html";
    return;
  }

  usuarioAtual = user;
  perfilUid = getPerfilUid() || user.uid;

  await carregarPerfil();
  await carregarAmigos();
  await carregarComunidades();
});

//////////////////////////////////////////////////
// CARREGAR PERFIL
//////////////////////////////////////////////////

async function carregarPerfil(){

  const snap = await getDoc(doc(db,"users",perfilUid));

  if(!snap.exists()) return;

  const data = snap.data();

  nomeEl.textContent = data.nome || "Usuário";
  bioEl.textContent = data.bio || "Sem bio";
}

//////////////////////////////////////////////////
// AMIGOS
//////////////////////////////////////////////////

async function carregarAmigos(){

  listaAmigos.innerHTML = "";

  const snap = await getDocs(
    query(collection(db,"friends"),
    where("users","array-contains",perfilUid))
  );

  for(const docSnap of snap.docs){

    const data = docSnap.data();
    const outroUid = data.users.find(u => u !== perfilUid);

    const userSnap = await getDoc(doc(db,"users",outroUid));
    const nome = userSnap.data()?.nome || "Usuário";

    const li = document.createElement("li");
    li.textContent = nome;

    listaAmigos.appendChild(li);
  }
}

//////////////////////////////////////////////////
// CRIAR COMUNIDADE
//////////////////////////////////////////////////

window.criarComunidade = async function(){

  const nome = document.getElementById("nomeComunidadeInput").value.trim();
  const descricao = document.getElementById("descricaoComunidadeInput").value.trim();
  const tema = document.getElementById("temaComunidadeInput").value.trim();

  if(!nome || !descricao) return alert("Preencha nome e descrição");

  const docRef = await addDoc(collection(db,"communities"),{
    name: nome,
    description: descricao,
    theme: tema || "Geral",
    owner: usuarioAtual.uid,
    createdAt: serverTimestamp()
  });

  // Criador já entra como membro
  await addDoc(collection(db,"communityMembers"),{
    communityId: docRef.id,
    userId: usuarioAtual.uid,
    role: "owner"
  });

  document.getElementById("nomeComunidadeInput").value="";
  document.getElementById("descricaoComunidadeInput").value="";
  document.getElementById("temaComunidadeInput").value="";

  carregarComunidades();
};

//////////////////////////////////////////////////
// LISTAR COMUNIDADES COMO BOTÕES
//////////////////////////////////////////////////

async function carregarComunidades(){

  listaComunidades.innerHTML = "";

  const snap = await getDocs(collection(db,"communityMembers"));

  for(const docSnap of snap.docs){

    const data = docSnap.data();

    if(data.userId === perfilUid){

      const commSnap = await getDoc(doc(db,"communities",data.communityId));
      if(!commSnap.exists()) continue;

      const comm = commSnap.data();

      const btn = document.createElement("button");
      btn.textContent = comm.name;
      btn.classList.add("botaoComunidade");

      btn.onclick = ()=>{
        window.location.href = "comunidade.html?id=" + data.communityId;
      };

      listaComunidades.appendChild(btn);
    }
  }

  if(listaComunidades.innerHTML === ""){
    listaComunidades.innerHTML = "<p>Sem comunidades ainda.</p>";
  }
}
