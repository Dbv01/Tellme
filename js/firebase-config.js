import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Firebase конфигурация
const firebaseConfig = {
    apiKey: "AIzaSyBechqZQQ5vflgEz46GOjeBI-sXI3VF0YA",
    authDomain: "corp-messenger-d75b0.firebaseapp.com",
    projectId: "corp-messenger-d75b0",
    storageBucket: "corp-messenger-d75b0.firebasestorage.app",
    messagingSenderId: "401489405764",
    appId: "1:401489405764:web:c6ea4f2da8f438904ad911"
};

// Инициализация
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
