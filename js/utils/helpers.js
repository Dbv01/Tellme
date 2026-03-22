export function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

export function formatLastSeen(userData) {
    if (!userData) return "неизвестно";
    if (userData.online) return "🟢 Онлайн";
    if (!userData.lastSeen) return "⚫ Был(а) недавно";
    
    const date = userData.lastSeen.toDate ? userData.lastSeen.toDate() : new Date(userData.lastSeen);
    const diff = Date.now() - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "⚫ Только что";
    if (minutes < 60) return `⚫ Был(а) ${minutes} мин назад`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `⚫ Был(а) ${hours} ч назад`;
    return `⚫ Был(а) ${Math.floor(hours/24)} дн назад`;
}

export function generateId() {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
