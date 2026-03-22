import { listenToChats, listenToMessages, markAsRead } from '../services/chat.js';
import { getUserById } from '../services/firestore.js';
import { escapeHtml, formatLastSeen } from '../utils/helpers.js';
import { openChatScreen } from './chat.js';
import { showUserProfileModal } from './profile.js';

let currentUser = null;
let unsubscribeChats = null;

export function initChats(user) {
    currentUser = user;
    loadChats();
}

function loadChats() {
    if (unsubscribeChats) unsubscribeChats();
    
    unsubscribeChats = listenToChats(currentUser.uid, async (chats) => {
        const enrichedChats = [];
        for (const chat of chats) {
            const partnerId = chat.participants.find(p => p !== currentUser.uid);
            const partner = await getUserById(partnerId);
            if (partner) {
                chat.partner = partner;
                chat.name = partner.name;
            }
            
            // Получаем последнее сообщение
            let lastMessage = null;
            let unsubscribe = listenToMessages(chat.id, (messages) => {
                if (messages.length > 0) {
                    lastMessage = messages[messages.length - 1];
                    chat.lastMessage = lastMessage.text || (lastMessage.file ? "📎 Файл" : "");
                    chat.lastTime = lastMessage.time;
                }
                unsubscribe();
            });
            
            enrichedChats.push(chat);
        }
        renderChatsList(enrichedChats);
    });
}

function renderChatsList(chats) {
    const container = document.getElementById('chatsList');
    if (!chats.length) {
        container.innerHTML = '<div class="empty-state">Чатов пока нет<br>Найдите пользователей через поиск</div>';
        return;
    }
    container.innerHTML = '';
    
    chats.forEach(chat => {
        if (!chat.partner) return;
        
        const unreadCount = chat.unread?.[currentUser.uid] || 0;
        const avatarHtml = `<div class="avatar">${chat.partner.avatar ? `<img src="${chat.partner.avatar}">` : chat.partner.name.charAt(0).toUpperCase()}</div>`;
        const statusHtml = `<div class="status-badge ${!chat.partner.online ? 'status-offline' : ''}">${chat.partner.online ? '🟢 онлайн' : '⚫ офлайн'}</div>`;
        const unreadHtml = unreadCount > 0 ? `<div class="unread-badge">${unreadCount}</div>` : '';
        const lastTime = chat.lastTime?.toDate ? new Date(chat.lastTime.toDate()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "";
        
        const div = document.createElement('div');
        div.className = 'chat-item';
        div.innerHTML = `${avatarHtml}<div class="chat-info"><div class="chat-name">${escapeHtml(chat.partner.name)}</div><div class="chat-preview">${escapeHtml(chat.lastMessage?.substring(0,30) || 'Нет сообщений')}</div>${statusHtml}</div><div class="chat-right">${unreadHtml}<div class="time-badge">${lastTime}</div></div>`;
        
        // Клик = открыть чат
        div.onclick = () => openChatScreen(chat, currentUser);
        
        // Долгое нажатие = профиль
        let pressTimer;
        div.onmousedown = () => { pressTimer = setTimeout(() => { showUserProfileModal(chat.partner); }, 500); };
        div.onmouseup = () => { clearTimeout(pressTimer); };
        div.ontouchstart = (e) => { pressTimer = setTimeout(() => { showUserProfileModal(chat.partner); }, 500); };
        div.ontouchend = () => { clearTimeout(pressTimer); };
        
        container.appendChild(div);
    });
}
