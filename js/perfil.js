import { auth, db } from "./firebase.js";
import {
  doc, getDoc, collection, query, where, getDocs,
  addDoc, deleteDoc, updateDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

let usuarioAtual = null;
let perfilUid = null;

function getUidFromUrl(){
  const params = new URLSearchParams(window.location.search);
  return params.get("uid");
}

auth.onAuthStateChanged(async user=>{
  if(!user) return;

  usuarioAtual = user;
  perfilUid = getUidFromUrl() || user.uid;

  carregarPerfil();
});

async function carregarPerfil(){

  const snap = await getDoc(doc(db,"users",perfilUid));
  const data = snap.data();

  perfilNome.textContent = data?.nome || "Sem nome";
  perfilDescricao.textContent = data?.descricao || "Sem descrição";

  if(perfilUid === usuarioAtual.uid){
    areaCriarComunidade.style.display = "block";
    carregarPedidosRecebidos();
  }else{
    areaCriarComunidade.style.display = "none";
    areaPedidosRecebidos.innerHTML = "";
  }

  verificarEstadoAmizade();
  carregarAmigos();
  carregarComunidades();
}

//////////////////////////////////////////////////
// ESTADO DE AMIZADE COMPLETO
//////////////////////////////////////////////////

async function verificarEstadoAmizade(){

  if(perfilUid === usuarioAtual.uid){
    btnAmizade.style.display = "none";
    return;
  }

  btnAmizade.style.display = "inline-block";

  const friendsSnap = await getDocs(collection(db,"friends"));
  let amigo = false;

  friendsSnap.forEach(docSnap=>{
    const d = docSnap.data();
    if(
      (d.user1 === usuarioAtual.uid && d.user2 === perfilUid) ||
      (d.user2 === usuarioAtual.uid && d.user1 === perfilUid)
    ){
      amigo = true;
    }
  });

  if(amigo){
    btnAmizade.textContent = "Remover amigo";
    btnAmizade.onclick = removerAmigo;
    return;
  }

  const reqSnap = await getDocs(collection(db,"friendRequests"));
  let enviado = false;
  let recebido = false;
  let reqId = null;

  reqSnap.forEach(docSnap=>{
    const d = docSnap.data();
    if(d.from === usuarioAtual.uid && d.to === perfilUid){
      enviado = true;
      reqId = docSnap.id;
    }
    if(d.from === perfilUid && d.to === usuarioAtual.uid){
      recebido = true;
      reqId = docSnap.id;
    }
  });

  if(enviado){
    btnAmizade.textContent = "Cancelar pedido";
    btnAmizade.onclick = ()=>cancelarPedido(reqId);
  }
  else if(recebido){
    btnAmizade.textContent = "Aceitar pedido";
    btnAmizade.onclick = ()=>aceitarPedido(reqId);
  }
  else{
    btnAmizade.textContent = "Adicionar amigo";
    btnAmizade.onclick = enviarPedido;
  }
}

async function enviarPedido(){
  await addDoc(collection(db,"friendRequests"),{
    from: usuarioAtual.uid,
    to: perfilUid,
    createdAt: serverTimestamp()
  });
  carregarPerfil();
}

async function cancelarPedido(id){
  await deleteDoc(doc(db,"friendRequests",id));
  carregarPerfil();
}

async function aceitarPedido(id){

  await addDoc(collection(db,"friends"),{
    user1: usuarioAtual.uid,
    user2: perfilUid,
    createdAt: serverTimestamp()
  });

  await deleteDoc(doc(db,"friendRequests",id));
  carregarPerfil();
}

async function removerAmigo(){

  const snap = await getDocs(collection(db,"friends"));

  snap.forEach(async docSnap=>{
    const d = docSnap.data();
    if(
      (d.user1 === usuarioAtual.uid && d.user2 === perfilUid) ||
      (d.user2 === usuarioAtual.uid && d.user1 === perfilUid)
    ){
      await deleteDoc(docSnap.ref);
    }
  });

  carregarPerfil();
}

//////////////////////////////////////////////////
// PEDIDOS RECEBIDOS (VISUAL NO PRÓPRIO PERFIL)
//////////////////////////////////////////////////

async function carregarPedidosRecebidos(){

  areaPedidosRecebidos.innerHTML = "<h3>Pedidos de amizade</h3>";

  const snap = await getDocs(collection(db,"friendRequests"));

  for(const docSnap of snap.docs){
    const d = docSnap.data();
    if(d.to === usuarioAtual.uid){

      const userSnap = await getDoc(doc(db,"users",d.from));
      const nome = userSnap.data()?.nome || "Usuário";

      const div = document.createElement("div");
      div.innerHTML = `
        ${nome}
        <button onclick="aceitarPedido('${docSnap.id}')">Aceitar</button>
        <button onclick="recusarPedido('${docSnap.id}')">Recusar</button>
      `;
      areaPedidosRecebidos.appendChild(div);
    }
  }
}

window.recusarPedido = async(id)=>{
  await deleteDoc(doc(db,"friendRequests",id));
  carregarPerfil();
};

//////////////////////////////////////////////////
// LISTA DE AMIGOS CLICÁVEL
//////////////////////////////////////////////////

async function carregarAmigos(){

  listaAmigos.innerHTML = "";

  const snap = await getDocs(collection(db,"friends"));

  for(const docSnap of snap.docs){

    const d = docSnap.data();
    let amigoId = null;

    if(d.user1 === perfilUid) amigoId = d.user2;
    if(d.user2 === perfilUid) amigoId = d.user1;

    if(amigoId){
      const userSnap = await getDoc(doc(db,"users",amigoId));
      const nome = userSnap.data()?.nome || "Usuário";

      const div = document.createElement("div");
      div.innerHTML = `<a href="perfil.html?uid=${amigoId}">${nome}</a>`;
      listaAmigos.appendChild(div);
    }
  }
}

//////////////////////////////////////////////////
// COMUNIDADES
//////////////////////////////////////////////////

async function carregarComunidades(){

  listaComunidades.innerHTML = "";

  const snap = await getDocs(collection(db,"communityMembers"));

  for(const docSnap of snap.docs){
    const d = docSnap.data();
    if(d.userId === perfilUid){

      const commSnap = await getDoc(doc(db,"communities",d.communityId));
      const comm = commSnap.data();

      const div = document.createElement("div");
      div.innerHTML = `<b>${comm.name}</b> - ${comm.description}`;
      listaComunidades.appendChild(div);
    }
  }
}

window.criarComunidade = async ()=>{

  const nome = nomeComunidade.value.trim();
  const desc = descricaoComunidade.value.trim();

  if(!nome) return alert("Digite o nome");

  const ref = await addDoc(collection(db,"communities"),{
    name: nome,
    description: desc,
    owner: usuarioAtual.uid,
    createdAt: serverTimestamp()
  });

  await addDoc(collection(db,"communityMembers"),{
    communityId: ref.id,
    userId: usuarioAtual.uid,
    role: "owner"
  });

  nomeComunidade.value="";
  descricaoComunidade.value="";
  carregarComunidades();
};
