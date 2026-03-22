import { db } from '../firebase-config.js';
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    updateDoc,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function getUserById(uid) {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
}

export async function searchUsers(currentUserId, queryText) {
    if (!queryText.trim()) return [];
    const q = queryText.toLowerCase();
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const results = [];
    snapshot.forEach(doc => {
        const user = doc.data();
        if (user.uid !== currentUserId && (
            user.name?.toLowerCase().includes(q) ||
            user.nickname?.toLowerCase().includes(q) ||
            user.email?.toLowerCase().includes(q)
        )) {
            results.push({ id: doc.id, ...user });
        }
    });
    return results;
}

export async function updateUserProfile(uid, data) {
    await updateDoc(doc(db, 'users', uid), data);
}

export async function getUserData(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
        return { uid: userDoc.id, ...userDoc.data() };
    }
    return null;
}
