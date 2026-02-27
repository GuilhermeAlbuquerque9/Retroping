import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDI2yUt-qHe-VY3gHNOsl2jKyNtN45ulAk",
  authDomain: "retroping-rp.firebaseapp.com",
  projectId: "retroping-rp",
  storageBucket: "retroping-rp.firebasestorage.app",
  messagingSenderId: "301014669782",
  appId: "1:301014669782:web:9497552df1ec66ea346c77"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);