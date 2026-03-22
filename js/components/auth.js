import { registerUser, loginUser } from '../services/auth.js';
import { showToast } from '../utils/toast.js';

export function initAuth() {
    // Переключение табов
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
            if (tabName === 'login') {
                document.getElementById('loginForm').classList.add('active');
            } else {
                document.getElementById('registerForm').classList.add('active');
            }
        });
    });
    
    // Регистрация
    document.getElementById('registerBtn').onclick = async () => {
        const email = document.getElementById('regEmail').value.trim();
        const nickname = document.getElementById('regNickname').value.trim();
        const name = document.getElementById('regName').value.trim();
        const password = document.getElementById('regPassword').value;
        const bio = document.getElementById('regBio').value.trim();
        
        if (!email || !nickname || !name || !password) {
            showToast("Заполните все поля", "error");
            return;
        }
        if (password.length < 6) {
            showToast("Пароль должен быть не менее 6 символов", "error");
            return;
        }
        
        const success = await registerUser(email, nickname, name, password, bio);
        if (success) {
            // Очищаем поля
            document.getElementById('regEmail').value = '';
            document.getElementById('regNickname').value = '';
            document.getElementById('regName').value = '';
            document.getElementById('regPassword').value = '';
            document.getElementById('regBio').value = '';
        }
    };
    
    // Вход
    document.getElementById('loginBtn').onclick = async () => {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            showToast("Введите email и пароль", "error");
            return;
        }
        
        await loginUser(email, password);
    };
}
