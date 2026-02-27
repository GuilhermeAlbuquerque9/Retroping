import { auth } from "./firebase.js";

auth.onAuthStateChanged(user=>{
  if(user){
    perfilNome.textContent = user.email.split("@")[0];
  }
});
