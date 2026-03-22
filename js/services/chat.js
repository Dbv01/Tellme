import { db } from '../firebase-config.js';
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { storage } from '../firebase-config.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { showToast } from '../utils/toast.js';

// Создание или получение чата
export async function getOrCreatePrivateChat(currentUserId, userId) {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('type', '==', 'private'), where('participants', 'array-contains', currentUserId));
    
    const snapshot = await getDocs(q);
    
    for (const docSnap of snapshot.docs) {
        const chat = docSnap.data();
        if (chat.participants.includes(userId)) {
            return { id: docSnap.id, ...chat };
        }
    }
    
    // Создаём новый чат
    const newChat = {
        type: 'private',
        participants: [currentUserId, userId],
        lastUpdate: serverTimestamp(),
        createdAt: serverTimestamp(),
        unread: { [currentUserId]: 0, [userId]: 0 }
    };
    
    const docRef = await addDoc(collection(db, 'chats'), newChat);
    return { id: docRef.id, ...newChat };
}

// Отправка сообщения
export async function sendMessage(chatId, currentUserId, text, fileData = null) {
    let fileUrl = null;
    let fileName = null;
    
    if (fileData) {
        const storageRef = ref(storage, `messages/${chatId}/${Date.now()}_${fileData.name}`);
        const response = await fetch(fileData.dataUrl);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        fileUrl = await getDownloadURL(storageRef);
        fileName = fileData.name;
    }
    
    // Добавляем сообщение
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
        from: currentUserId,
        text: text || "",
        time: serverTimestamp(),
        file: fileUrl ? { name: fileName, url: fileUrl } : null
    });
    
    // Обновляем время последнего сообщения в чате
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    const chatData = chatDoc.data();
    
    if (chatData) {
        const participants = chatData.participants;
        const partnerId = participants.find(p => p !== currentUserId);
        
        // Увеличиваем счётчик непрочитанных для собеседника
        const newUnread = { ...(chatData.unread || {}) };
        newUnread[partnerId] = (newUnread[partnerId] || 0) + 1;
        
        await updateDoc(chatRef, {
            lastUpdate: serverTimestamp(),
            unread: newUnread
        });
    }
}

// Отметить как прочитанное
export async function markAsRead(chatId, currentUserId) {
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    const chatData = chatDoc.data();
    
    if (chatData) {
        const newUnread = { ...(chatData.unread || {}) };
        newUnread[currentUserId] = 0;
        await updateDoc(chatRef, { unread: newUnread });
    }
}

// Слушатель сообщений в чате
export function listenToMessages(chatId, callback) {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('time', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        callback(messages);
    });
}

// Слушатель всех чатов пользователя
export function listenToChats(currentUserId, callback) {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', currentUserId), orderBy('lastUpdate', 'desc'));
    
    return onSnapshot(q, async (snapshot) => {
        const chats = [];
        for (const docSnap of snapshot.docs) {
            const chat = { id: docSnap.id, ...docSnap.data() };
            
            // Получаем последнее сообщение для превью
            const lastMsgQuery = query(collection(db, 'chats', chat.id, 'messages'), orderBy('time', 'desc'));
            const lastMsgSnap = await getDocs(lastMsgQuery);
            if (!lastMsgSnap.empty) {
                const lastMsg = lastMsgSnap.docs[0].data();
                chat.lastMessage = lastMsg.text || (lastMsg.file ? "📎 Файл" : "");
                chat.lastTime = lastMsg.time;
            }
            
            chats.push(chat);
        }
        callback(chats);
    });
}
