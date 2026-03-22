import { registerUser, loginUser } from '../services/auth.js';
import { showToast } from '../utils/toast.js';

export function initAuth() {
    // Переключение табов
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
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
        
        await registerUser(email, nickname, name, password, bio);
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
