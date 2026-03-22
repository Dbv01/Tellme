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
    
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
        from: currentUserId,
        text: text || "",
        time: serverTimestamp(),
        file: fileUrl ? { name: fileName, url: fileUrl } : null
    });
    
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    const chatData = chatDoc.data();
    const partnerId = chatData.participants.find(p => p !== currentUserId);
    
    await updateDoc(chatRef, {
        lastUpdate: serverTimestamp(),
        [`unread.${partnerId}`]: (chatData.unread?.[partnerId] || 0) + 1
    });
}

export async function markAsRead(chatId, currentUserId) {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
        [`unread.${currentUserId}`]: 0
    });
}

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

export function listenToChats(currentUserId, callback) {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', currentUserId), orderBy('lastUpdate', 'desc'));
    
    return onSnapshot(q, async (snapshot) => {
        const chats = [];
        for (const docSnap of snapshot.docs) {
            const chat = { id: docSnap.id, ...docSnap.data() };
            chats.push(chat);
        }
        callback(chats);
    });
}
