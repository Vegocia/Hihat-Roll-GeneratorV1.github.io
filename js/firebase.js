import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAdCHXh0SgvDdd2fzulEjDw0euuKOaeS5A",
  authDomain: "hi-hat-roll-generator.firebaseapp.com",
  projectId: "hi-hat-roll-generator",
  storageBucket: "hi-hat-roll-generator.firebasestorage.app",
  messagingSenderId: "58499520880",
  appId: "1:58499520880:web:8e3e542b2720cb8dff57b5",
  measurementId: "G-SZ6P9M2R0B"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function guardarUsuario(email) {
  await addDoc(collection(db, "usuarios"), {
    email,
    fecha: serverTimestamp(),
    proyecto: "Hi-Hat Roll Generator"
  });
}