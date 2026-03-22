import { auth } from '../firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { db } from '../firebase-config.js';
import { doc, setDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { showToast } from '../utils/toast.js';

export async function registerUser(email, nickname, name, password, bio) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            email: email,
            nickname: nickname,
            name: name,
            bio: bio || "Нет информации",
            avatar: null,
            lastSeen: serverTimestamp(),
            online: true,
            createdAt: serverTimestamp()
        });
        
        showToast("Регистрация успешна!", "success");
        return true;
    } catch (error) {
        showToast(error.message, "error");
        return false;
    }
}

export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await updateDoc(doc(db, 'users', userCredential.user.uid), {
            online: true,
            lastSeen: serverTimestamp()
        });
        showToast("Добро пожаловать!", "success");
        return true;
    } catch (error) {
        if (error.code === 'auth/invalid-email') {
            showToast("Неверный формат email", "error");
        } else if (error.code === 'auth/user-not-found') {
            showToast("Пользователь не найден", "error");
        } else if (error.code === 'auth/wrong-password') {
            showToast("Неверный пароль", "error");
        } else {
            showToast(error.message, "error");
        }
        return false;
    }
}

export async function logoutUser() {
    try {
        if (auth.currentUser) {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                online: false,
                lastSeen: serverTimestamp()
            });
        }
        await signOut(auth);
        showToast("Вы вышли из аккаунта", "info");
        setTimeout(() => location.reload(), 500);
    } catch (error) {
        showToast(error.message, "error");
    }
}
