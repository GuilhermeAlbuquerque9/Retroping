import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

//////////////////////////////////////////////////
// ELEMENTOS DO HTML
//////////////////////////////////////////////////

const nomeEl = document.getElementById("perfilNome");
const bioEl = document.getElementById("perfilDescricao");
const btnAmizade = document.getElementById("btnAmizade");
const areaPedidosRecebidos = document.getElementById("areaPedidosRecebidos");
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

auth.onAuthStateChanged(async (user) => {

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
  bioEl.textContent = data.descricao || "Sem descrição";

  // Não mostrar botão se for o próprio perfil
  if(perfilUid === usuarioAtual.uid){
    btnAmizade.style.display = "none";
    return;
  }

  btnAmizade.style.display = "inline-block";

  verificarAmizade();
}

//////////////////////////////////////////////////
// VERIFICAR AMIZADE
//////////////////////////////////////////////////

async function verificarAmizade(){

  const q = query(
    collection(db,"friends"),
    where("users","array-contains",usuarioAtual.uid)
  );

  const snap = await getDocs(q);

  let jaEhAmigo = false;
  let docId = null;

  snap.forEach(d => {
    const data = d.data();
    if(data.users.includes(perfilUid)){
      jaEhAmigo = true;
      docId = d.id;
    }
  });

  if(jaEhAmigo){
    btnAmizade.textContent = "Remover amigo";
    btnAmizade.onclick = async () => {
      await deleteDoc(doc(db,"friends",docId));
      carregarAmigos();
      verificarAmizade();
    };
  } else {
    btnAmizade.textContent = "Adicionar amigo";
    btnAmizade.onclick = async () => {
      await addDoc(collection(db,"friends"),{
        users:[usuarioAtual.uid, perfilUid],
        createdAt: serverTimestamp()
      });
      carregarAmigos();
      verificarAmizade();
    };
  }
}

//////////////////////////////////////////////////
// CARREGAR AMIGOS
//////////////////////////////////////////////////

async function carregarAmigos(){

  listaAmigos.innerHTML = "";

  const q = query(
    collection(db,"friends"),
    where("users","array-contains",perfilUid)
  );

  const snap = await getDocs(q);

  for(const d of snap.docs){

    const data = d.data();
    const outroUid = data.users.find(u => u !== perfilUid);

    const userSnap = await getDoc(doc(db,"users",outroUid));
    if(!userSnap.exists()) continue;

    const nome = userSnap.data().nome || "Usuário";

    const link = document.createElement("a");
    link.href = "perfil.html?uid=" + outroUid;
    link.textContent = nome;

    const div = document.createElement("div");
    div.appendChild(link);

    listaAmigos.appendChild(div);
  }

  if(listaAmigos.innerHTML === ""){
    listaAmigos.innerHTML = "Sem amigos ainda.";
  }
}

//////////////////////////////////////////////////
// CRIAR COMUNIDADE
//////////////////////////////////////////////////

window.criarComunidade = async function(){

  const nome = document.getElementById("nomeComunidade").value.trim();
  const descricao = document.getElementById("descricaoComunidade").value.trim();

  if(!nome || !descricao){
    alert("Preencha todos os campos");
    return;
  }

  const docRef = await addDoc(collection(db,"communities"),{
    name: nome,
    description: descricao,
    owner: usuarioAtual.uid,
    createdAt: serverTimestamp()
  });

  // Criador já entra como membro
  await addDoc(collection(db,"communityMembers"),{
    communityId: docRef.id,
    userId: usuarioAtual.uid,
    role: "owner"
  });

  document.getElementById("nomeComunidade").value = "";
  document.getElementById("descricaoComunidade").value = "";

  carregarComunidades();
};

//////////////////////////////////////////////////
// LISTAR COMUNIDADES
//////////////////////////////////////////////////

async function carregarComunidades(){

  listaComunidades.innerHTML = "";

  const snap = await getDocs(collection(db,"communityMembers"));

  for(const d of snap.docs){

    const data = d.data();

    if(data.userId === perfilUid){

      const commSnap = await getDoc(doc(db,"communities",data.communityId));
      if(!commSnap.exists()) continue;

      const comm = commSnap.data();

      const btn = document.createElement("button");
      btn.textContent = comm.name;

      btn.onclick = ()=>{
        window.location.href = "comunidade.html?id=" + data.communityId;
      };

      listaComunidades.appendChild(btn);
    }
  }

  if(listaComunidades.innerHTML === ""){
    listaComunidades.innerHTML = "Sem comunidades ainda.";
  }
}
