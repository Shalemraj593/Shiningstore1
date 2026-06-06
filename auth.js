// ============================================
// SHINING STORE - Authentication System
// Uses localStorage as backend storage
// ============================================

const AUTH_STORAGE_KEY = 'shiningstore_users';
const SESSION_KEY = 'shiningstore_session';

// ============================================
// Database Layer (localStorage)
// ============================================
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || [];
    } catch { return []; }
}

function saveUsers(users) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
}

// Simple hash function for password (not cryptographically secure, but works for demo)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return 'sh_' + Math.abs(hash).toString(36) + '_' + password.length;
}

// ============================================
// Auth API
// ============================================
function registerUser(name, email, password) {
    const users = getUsers();

    // Validate trusted domain
    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com', 'proton.me', 'protonmail.com', 'zoho.com', 'live.com', 'msn.com', 'yandex.com', 'gmx.com'];
    const domain = email.split('@')[1]?.toLowerCase().trim();
    if (!allowedDomains.includes(domain)) {
        return { success: false, error: 'Please use a trusted email service (e.g., Gmail, Yahoo, Outlook, iCloud).' };
    }

    // Check if email already exists
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
        return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser = {
        id: 'user_' + Date.now(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashPassword(password),
        joinDate: new Date().toISOString(),
        orders: [],
        wishlist: [],
        rewardPoints: 50 // Welcome bonus
    };

    users.push(newUser);
    saveUsers(users);
    saveSession(newUser);

    return { success: true, user: newUser };
}

function getSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch { return null; }
}

function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        joinDate: user.joinDate,
        loggedInAt: new Date().toISOString()
    }));
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
        return { success: false, error: 'No account found with this email.' };
    }

    if (user.password !== hashPassword(password)) {
        return { success: false, error: 'Incorrect password. Please try again.' };
    }

    saveSession(user);
    return { success: true, user: user };
}

function logoutUser() {
    clearSession();
}

function isLoggedIn() {
    return getSession() !== null;
}

function getCurrentUser() {
    return getSession();
}

// ============================================
// UI Functions
// ============================================
function showToast(message) {
    const toast = document.getElementById('authToast');
    const toastMsg = document.getElementById('toastMsg');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function showInputError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.add('error');
    if (error) error.classList.add('show');
}

function clearInputError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.remove('error');
    if (error) error.classList.remove('show');
}

function clearAllErrors() {
    document.querySelectorAll('.auth-input-wrapper input').forEach(i => i.classList.remove('error'));
    document.querySelectorAll('.input-error-msg').forEach(e => e.classList.remove('show'));
}

// ============================================
// Page State Management
// ============================================
function showAuthPage() {
    const authPage = document.getElementById('authPage');
    const dashboard = document.getElementById('dashboard');
    if (authPage) authPage.style.display = 'flex';
    if (dashboard) dashboard.classList.remove('active');
}

function showDashboard(user) {
    const authPage = document.getElementById('authPage');
    const dashboard = document.getElementById('dashboard');
    if (authPage) authPage.style.display = 'none';
    if (dashboard) dashboard.classList.add('active');

    // Populate dashboard
    const avatar = document.getElementById('dashAvatar');
    const name = document.getElementById('dashName');
    const email = document.getElementById('dashEmail');

    if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
    if (name) name.textContent = user.name;
    if (email) email.textContent = user.email;
}

// ============================================
// Initialize Account Page
// ============================================
function initAccountPage() {
    // Check if user is already logged in
    const session = getSession();
    if (session) {
        showDashboard(session);
    } else {
        showAuthPage();
    }

    // Tab switching
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authFooter = document.getElementById('authFooter');
    const switchToRegister = document.getElementById('switchToRegister');

    function switchTab(tab) {
        clearAllErrors();

        if (tab === 'login') {
            loginTab?.classList.add('active');
            registerTab?.classList.remove('active');
            loginForm?.classList.add('active');
            registerForm?.classList.remove('active');
            if (authTitle) authTitle.textContent = 'Welcome Back';
            if (authSubtitle) authSubtitle.textContent = 'Sign in to your account to continue';
            if (authFooter) authFooter.innerHTML = 'Don\'t have an account? <a href="#" id="switchToRegister">Create one</a>';
            document.getElementById('switchToRegister')?.addEventListener('click', (e) => { e.preventDefault(); switchTab('register'); });
        } else {
            loginTab?.classList.remove('active');
            registerTab?.classList.add('active');
            loginForm?.classList.remove('active');
            registerForm?.classList.add('active');
            if (authTitle) authTitle.textContent = 'Create Account';
            if (authSubtitle) authSubtitle.textContent = 'Join Shining Store for exclusive benefits';
            if (authFooter) authFooter.innerHTML = 'Already have an account? <a href="#" id="switchToLogin">Sign in</a>';
            document.getElementById('switchToLogin')?.addEventListener('click', (e) => { e.preventDefault(); switchTab('login'); });
        }
    }

    loginTab?.addEventListener('click', () => switchTab('login'));
    registerTab?.addEventListener('click', () => switchTab('register'));
    switchToRegister?.addEventListener('click', (e) => { e.preventDefault(); switchTab('register'); });

    // Clear errors on input
    document.querySelectorAll('.auth-input-wrapper input').forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('error');
            const errorEl = input.closest('.auth-input-group')?.querySelector('.input-error-msg');
            if (errorEl) errorEl.classList.remove('show');
        });
    });

    // Login Form Submit
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        let hasError = false;

        // Validate
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            showInputError('loginEmail', 'loginEmailError');
            hasError = true;
        }
        if (!password) {
            showInputError('loginPassword', 'loginPasswordError');
            hasError = true;
        }
        if (hasError) return;

        // Show loading
        const submitBtn = document.getElementById('loginSubmit');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Simulate network delay
        await new Promise(r => setTimeout(r, 800));

        const result = loginUser(email, password);
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        if (result.success) {
            showToast('Welcome back, ' + result.user.name + '!');
            setTimeout(() => showDashboard(result.user), 500);
        } else {
            showToast(result.error);
            if (result.error.includes('email')) {
                showInputError('loginEmail', 'loginEmailError');
                document.getElementById('loginEmailError').textContent = result.error;
            } else {
                showInputError('loginPassword', 'loginPasswordError');
                document.getElementById('loginPasswordError').textContent = result.error;
            }
        }
    });

    // Register Form Submit
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors();

        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;
        let hasError = false;

        if (!name || name.trim().length < 2) {
            showInputError('regName', 'regNameError');
            hasError = true;
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            showInputError('regEmail', 'regEmailError');
            hasError = true;
        }
        if (!password || password.length < 6) {
            showInputError('regPassword', 'regPasswordError');
            hasError = true;
        }
        if (password !== confirm) {
            showInputError('regConfirm', 'regConfirmError');
            hasError = true;
        }
        if (hasError) return;

        // Show loading
        const submitBtn = document.getElementById('registerSubmit');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Simulate network delay
        await new Promise(r => setTimeout(r, 1000));

        // Generate OTP
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        alert('🔑 shiningstore.com: Your registration verification code is ' + code);

        // Wait for next tick so alert can clear before prompt
        await new Promise(r => setTimeout(r, 50));
        const entered = prompt('Please enter the 4-digit verification code sent to your email:');

        if (entered !== code) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            showToast('Invalid verification code. Please try again.');
            return;
        }

        const result = registerUser(name, email, password);
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        if (result.success) {
            showToast('Account created! Welcome, ' + result.user.name + '!');
            setTimeout(() => showDashboard(result.user), 500);
        } else {
            showToast(result.error);
            showInputError('regEmail', 'regEmailError');
            document.getElementById('regEmailError').textContent = result.error;
        }
    });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        logoutUser();
        showToast('Signed out successfully');
        setTimeout(() => {
            showAuthPage();
            // Reset forms
            loginForm?.reset();
            registerForm?.reset();
            clearAllErrors();
            // Switch to login tab
            switchTab('login');
        }, 300);
    });
}

// ============================================
// Initialize on DOM load
// ============================================
document.addEventListener('DOMContentLoaded', initAccountPage);
