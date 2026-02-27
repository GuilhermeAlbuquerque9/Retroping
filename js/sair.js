import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

await signOut(auth);
window.location="index.html";