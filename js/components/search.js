import { searchUsers } from '../services/firestore.js';
import { getOrCreatePrivateChat } from '../services/chat.js';
import { openChatScreen } from './chat.js';
import { escapeHtml } from '../utils/helpers.js';

let currentUser = null;

export function initSearch(user) {
    currentUser = user;
    
    document.getElementById('searchInput').addEventListener('input', async (e) => {
        const results = await searchUsers(currentUser.uid, e.target.value);
        const container = document.getElementById('searchResults');
        if (results.length === 0) {
            container.innerHTML = '<div class="empty-state">Пользователи не найдены</div>';
            return;
        }
        container.innerHTML = '';
        for (const user of results) {
            const div = document.createElement('div');
            div.className = 'search-item';
            div.innerHTML = `<div class="avatar">${user.avatar ? `<img src="${user.avatar}">` : user.name.charAt(0)}</div>
                            <div class="chat-info">
                                <div class="chat-name">${escapeHtml(user.name)}</div>
                                <div class="chat-preview">@${user.nickname} • ${user.email}</div>
                                <div class="status-badge">${user.online ? '🟢 онлайн' : '⚫ офлайн'}</div>
                            </div>`;
            
            div.onclick = async () => {
                const chat = await getOrCreatePrivateChat(currentUser.uid, user.uid);
                const fullChat = { ...chat, partner: user };
                openChatScreen(fullChat, currentUser);
                document.getElementById('searchScreen').classList.remove('active');
                document.getElementById('chatScreen').classList.add('active');
            };
            
            container.appendChild(div);
        }
    });
}
