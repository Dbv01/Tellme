import { updateUserProfile, getUserById } from '../services/firestore.js';
import { logoutUser } from '../services/auth.js';
import { formatLastSeen, escapeHtml } from '../utils/helpers.js';
import { showToast } from '../utils/toast.js';
import { openChatWithUser } from './chat.js';

let currentUser = null;

export function initProfile(user) {
    currentUser = user;
    window.currentUser = user;
    updateProfileUI();
    
    document.getElementById('editProfileBtn').onclick = async () => {
        const newName = prompt("Новое имя:", currentUser.name);
        if (newName && newName.trim()) {
            await updateUserProfile(currentUser.uid, { name: newName.trim() });
            currentUser.name = newName.trim();
            updateProfileUI();
            showToast("Имя обновлено", "success");
        }
        const newBio = prompt("О себе:", currentUser.bio || "");
        if (newBio !== null) {
            await updateUserProfile(currentUser.uid, { bio: newBio || "Нет информации" });
            currentUser.bio = newBio || "Нет информации";
            updateProfileUI();
            showToast("Описание обновлено", "success");
        }
    };
    
    document.getElementById('profileAvatar').onclick = () => {
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = 'image/*';
        inp.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (ev) => {
                    await updateUserProfile(currentUser.uid, { avatar: ev.target.result });
                    currentUser.avatar = ev.target.result;
                    updateProfileUI();
                    showToast("Аватар обновлён", "success");
                };
                reader.readAsDataURL(file);
            }
        };
        inp.click();
    };
    
    document.getElementById('logoutBtn').onclick = async () => {
        if (confirm("Выйти из аккаунта?")) {
            await logoutUser();
        }
    };
}

function updateProfileUI() {
    if (!currentUser) return;
    document.getElementById('profileName').innerText = currentUser.name;
    document.getElementById('profileEmail').innerText = currentUser.email;
    document.getElementById('profileBio').innerText = currentUser.bio || "Нет информации";
    const avatarDiv = document.getElementById('profileAvatar');
    if (currentUser.avatar) avatarDiv.innerHTML = `<img src="${currentUser.avatar}" style="width:100%;height:100%;">`;
    else avatarDiv.innerHTML = `<i class="fas fa-user-circle"></i>`;
    document.getElementById('profileLastSeen').innerHTML = currentUser.online ? "🟢 Онлайн" : formatLastSeen(currentUser);
}

export function showUserProfileModal(user) {
    if (!user) return;
    document.getElementById('modalUserName').innerText = user.name;
    document.getElementById('modalUserEmail').innerText = user.email;
    document.getElementById('modalUserBio').innerText = user.bio || "Нет информации";
    document.getElementById('modalUserStatus').innerHTML = formatLastSeen(user);
    const avatarDiv = document.getElementById('modalUserAvatar');
    if (user.avatar) avatarDiv.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;">`;
    else avatarDiv.innerHTML = `<i class="fas fa-user-circle"></i>`;
    document.getElementById('userProfileModal').style.display = 'flex';
    
    document.getElementById('modalStartChatBtn').onclick = async () => {
        document.getElementById('userProfileModal').style.display = 'none';
        if (window.currentUser) {
            await openChatWithUser(user, window.currentUser);
            // Переключаем экран на чат
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('chatScreen').classList.add('active');
        }
    };
}

export function initProfileModal() {
    document.getElementById('closeModalBtn').onclick = () => {
        document.getElementById('userProfileModal').style.display = 'none';
    };
    
    document.getElementById('userProfileModal').onclick = (e) => {
        if (e.target === document.getElementById('userProfileModal')) {
            document.getElementById('userProfileModal').style.display = 'none';
        }
    };
}
