import { sendMessage, listenToMessages, markAsRead, getOrCreatePrivateChat } from '../services/chat.js';
import { escapeHtml, formatLastSeen } from '../utils/helpers.js';
import { showToast } from '../utils/toast.js';
import { refreshChats } from './chats.js';

let currentChatId = null;
let currentChatPartner = null;
let currentUser = null;
let unsubscribeMessages = null;

export function initChat() {
    document.getElementById('sendMsgBtn').onclick = async () => {
        const input = document.getElementById('messageInput');
        if (input.value.trim() && currentChatId && currentUser) {
            await sendMessage(currentChatId, currentUser.uid, input.value);
            input.value = '';
            // Обновляем список чатов, чтобы появился превью
            refreshChats();
        }
    };
    
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('sendMsgBtn').click();
    });
    
    document.getElementById('attachFileBtn').onclick = () => document.getElementById('fileInput').click();
    document.getElementById('fileInput').onchange = async (e) => {
        const file = e.target.files[0];
        if (file && currentChatId && currentUser) {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                await sendMessage(currentChatId, currentUser.uid, "", { name: file.name, size: file.size, dataUrl: ev.target.result });
                showToast(`Файл ${file.name} отправлен`, "success");
                refreshChats();
            };
            reader.readAsDataURL(file);
        }
        document.getElementById('fileInput').value = '';
    };
}

export async function openChatScreen(chat, user) {
    currentUser = user;
    currentChatId = chat.id;
    currentChatPartner = chat.partner;
    
    // Сохраняем в глобальную переменную для доступа из других модулей
    window.currentChatPartner = currentChatPartner;
    window.currentUser = currentUser;
    
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('chatScreen').classList.add('active');
    
    document.getElementById('chatTitleName').innerText = chat.partner.name;
    document.getElementById('chatStatus').innerHTML = formatLastSeen(chat.partner);
    
    // Отмечаем сообщения как прочитанные
    await markAsRead(chat.id, currentUser.uid);
    refreshChats();
    
    if (unsubscribeMessages) unsubscribeMessages();
    unsubscribeMessages = listenToMessages(chat.id, (messages) => {
        renderMessages(messages);
    });
}

function renderMessages(messages) {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';
    
    messages.forEach(msg => {
        const isOwn = msg.from === currentUser.uid;
        const sender = isOwn ? "Вы" : (currentChatPartner?.name || "unknown");
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isOwn ? 'own' : ''}`;
        
        if (msg.file) {
            msgDiv.innerHTML = `<div class="message-file"><i class="fas fa-file"></i> ${msg.file.name}</div><small>${sender}, ${msg.time?.toDate ? new Date(msg.time.toDate()).toLocaleTimeString() : ''}</small>`;
            msgDiv.onclick = () => { if (msg.file.url) window.open(msg.file.url, '_blank'); };
        } else {
            msgDiv.innerHTML = `<div>${escapeHtml(msg.text)}</div><small>${sender}, ${msg.time?.toDate ? new Date(msg.time.toDate()).toLocaleTimeString() : ''}</small>`;
        }
        container.appendChild(msgDiv);
    });
    container.scrollTop = container.scrollHeight;
}

// Функция для открытия чата с новым пользователем (из поиска)
export async function openChatWithUser(user, currentUser) {
    const chat = await getOrCreatePrivateChat(currentUser.uid, user.uid);
    const fullChat = { ...chat, partner: user };
    await openChatScreen(fullChat, currentUser);
}
