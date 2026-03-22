import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getUserData } from './services/firestore.js';
import { initAuth } from './components/auth.js';
import { initChats } from './components/chats.js';
import { initChat } from './components/chat.js';
import { initProfile, initProfileModal } from './components/profile.js';
import { initSearch } from './components/search.js';

let currentUser = null;

// Инициализация UI компонентов
initAuth();
initChat();
initProfileModal();

// Навигация
document.getElementById('backToChats').onclick = () => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('chatsScreen').classList.add('active');
};

document.getElementById('backFromProfile').onclick = () => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('chatsScreen').classList.add('active');
};

document.getElementById('backFromSearch').onclick = () => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('chatsScreen').classList.add('active');
};

document.getElementById('profileBtn').onclick = () => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('profileScreen').classList.add('active');
};

document.getElementById('searchBtn').onclick = () => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('searchScreen').classList.add('active');
    document.getElementById('searchResults').innerHTML = '';
};

document.getElementById('chatProfileBtn').onclick = () => {
    if (window.currentChatPartner) {
        const { showUserProfileModal } = require('./profile.js');
        showUserProfileModal(window.currentChatPartner);
    }
};

// Слушатель авторизации
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userData = await getUserData(user.uid);
        if (userData) {
            currentUser = userData;
            window.currentUser = currentUser;
            
            // Инициализируем компоненты с данными пользователя
            initChats(currentUser);
            initProfile(currentUser);
            initSearch(currentUser);
            
            document.getElementById('authScreen').classList.remove('active');
            document.getElementById('chatsScreen').classList.add('active');
        }
    } else {
        document.getElementById('authScreen').classList.add('active');
        document.getElementById('chatsScreen').classList.remove('active');
        document.getElementById('searchScreen').classList.remove('active');
        document.getElementById('chatScreen').classList.remove('active');
        document.getElementById('profileScreen').classList.remove('active');
        currentUser = null;
        window.currentUser = null;
        window.currentChatPartner = null;
    }
});
