import { auth, db } from "./firebase.js";
import {
  doc, getDoc, collection, query, where,
  getDocs, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

let usuarioAtual;
let comunidadeId;

function getId(){
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

auth.onAuthStateChanged(async user=>{
  if(!user) return;

  usuarioAtual = user;
  comunidadeId = getId();

  carregarComunidade();
  carregarComentarios();
});

async function carregarComunidade(){

  const snap = await getDoc(doc(db,"communities",comunidadeId));
  const data = snap.data();

  nomeComunidade.textContent = data.name;
  descricaoComunidade.textContent = data.description;

  const membrosSnap = await getDocs(
    query(collection(db,"communityMembers"),
    where("communityId","==",comunidadeId))
  );

  const criadorSnap = await getDoc(doc(db,"users",data.owner));
  const criadorNome = criadorSnap.data()?.nome || "Usuário";

  const dataCriacao = data.createdAt?.toDate().toLocaleDateString() || "—";

  infoComunidade.innerHTML = `
    <b>Membros:</b> ${membrosSnap.size}<br>
    <b>Data de criação:</b> ${dataCriacao}<br>
    <b>Criador:</b> ${criadorNome}<br>
    <b>Tema:</b> ${data.theme || "Geral"}
  `;

  verificarMembro();
}

async function verificarMembro(){

  const snap = await getDocs(
    query(collection(db,"communityMembers"),
    where("communityId","==",comunidadeId),
    where("userId","==",usuarioAtual.uid))
  );

  if(snap.empty){
    btnEntrar.textContent = "Entrar na comunidade";
    btnEntrar.onclick = entrar;
  }else{
    btnEntrar.textContent = "Você é membro";
    btnEntrar.disabled = true;
  }
}

async function entrar(){
  await addDoc(collection(db,"communityMembers"),{
    communityId: comunidadeId,
    userId: usuarioAtual.uid,
    role: "member"
  });
  carregarComunidade();
}

//////////////////////////////////////////////////
// COMENTÁRIOS
//////////////////////////////////////////////////

async function carregarComentarios(){

  listaComentarios.innerHTML = "";

  const snap = await getDocs(
    query(collection(db,"communityComments"),
    where("communityId","==",comunidadeId))
  );

  for(const docSnap of snap.docs){
    const d = docSnap.data();

    const userSnap = await getDoc(doc(db,"users",d.userId));
    const nome = userSnap.data()?.nome || "Usuário";

    const div = document.createElement("div");
    div.innerHTML = `<b>${nome}</b>: ${d.text}`;
    listaComentarios.appendChild(div);
  }
}

window.postarComentario = async ()=>{

  const texto = novoComentario.value.trim();
  if(!texto) return;

  await addDoc(collection(db,"communityComments"),{
    communityId: comunidadeId,
    userId: usuarioAtual.uid,
    text: texto,
    createdAt: serverTimestamp()
  });

  novoComentario.value="";
  carregarComentarios();
};
