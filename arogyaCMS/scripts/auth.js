/**
 * Authentication & Authorization System
 */

// User roles and their permissions
const ROLE_PERMISSIONS = {
    reception: ['index.html', 'registration.html', 'appointments.html', 'patient-summary.html'],
    nurse: ['nursing.html', 'patient-summary.html'],
    counselor: ['counseling.html', 'patient-summary.html'],
    doctor: ['consultation.html', 'treatment-plan.html', 'embryology-lab.html', 'patient-summary.html'],
    embryologist: ['treatment-plan.html', 'embryology-lab.html', 'patient-summary.html'],
    admin: ['*'] // Admin has access to all pages
};

// Initialize authentication
document.addEventListener('DOMContentLoaded', function() {
    // Initialize users database on first load
    getUsers(); // This will create default users if they don't exist
    
    // Get current page name
    const currentPage = getCurrentPageName();
    
    // Handle login page separately
    if (currentPage === 'login.html' || currentPage === 'login') {
        // If already logged in, redirect to dashboard
        const currentUser = getCurrentUser();
        if (currentUser) {
            window.location.href = getDashboardForRole(currentUser.role);
            return;
        }
        
        // Set up login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
            console.log('Login form attached');
        } else {
            console.error('Login form not found!');
        }
        return;
    }
    
    // For all other pages, check authentication
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        // Redirect to login
        window.location.href = 'login.html';
        return;
    }
    
    // Check role-based access
    if (!hasAccess(currentUser.role, currentPage)) {
        alert('You do not have permission to access this page.');
        window.location.href = getDashboardForRole(currentUser.role);
        return;
    }
    
    // Update UI with user info
    updateUserInfo(currentUser);
    
    // Handle logout
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

/**
 * Get current page name
 */
function getCurrentPageName() {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    // Handle file:// protocol (local files)
    if (path === '/' || path === '') {
        const fullPath = window.location.href;
        const fileName = fullPath.split('/').pop().split('?')[0].split('#')[0];
        return fileName || 'index.html';
    }
    
    // Extract filename from path
    const fileName = path.split('/').pop().split('?')[0].split('#')[0];
    return fileName || 'index.html';
}

/**
 * Handle login
 */
async function handleLogin(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');
        const role = formData.get('role');
        
        // Validate inputs
        if (!username || !password || !role) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }
        
        // Authenticate user
        const user = await authenticateUser(username, password, role);
        
        if (user) {
            console.log('Login successful, user:', user);
            
            // Set current user
            setCurrentUser(user);
            
            // Show success message
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to appropriate dashboard using user's role from response
            const userRole = user.role || role;
            const dashboardUrl = getDashboardForRole(userRole);
            console.log('Redirecting to:', dashboardUrl, 'for role:', userRole);
            
            // Use immediate redirect instead of setTimeout for better reliability
            setTimeout(() => {
                window.location.href = dashboardUrl;
            }, 300);
        } else {
            console.error('Login failed: Invalid credentials');
            showNotification('Invalid credentials. Please check your username, password, and role.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('An error occurred during login. Please try again.', 'error');
    }
}

/**
 * Authenticate user - Uses API
 */
async function authenticateUser(username, password, role) {
    try {
        // Use API for authentication
        if (typeof api !== 'undefined') {
            try {
                const response = await api.login(username, password, role);
                console.log('API login response:', response);
                if (response && response.user) {
                    return response.user;
                }
            } catch (apiError) {
                console.error('API login error:', apiError);
                // Fall through to fallback
            }
        } else {
            console.warn('API client not available, using fallback');
        }
        
        // Fallback to local storage (for backward compatibility)
        const users = getUsers();
        if (!users || users.length === 0) {
            console.error('No users found');
            return null;
        }
        
        const user = users.find(u => 
            u.username.toLowerCase() === username.toLowerCase() && 
            u.password === password && 
            u.role === role
        );
        
        if (user) {
            return {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            };
        }
        
        return null;
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
}

/**
 * Check if user has access to a page
 */
function hasAccess(role, page) {
    const permissions = ROLE_PERMISSIONS[role];
    
    if (!permissions) {
        console.warn(`No permissions defined for role: ${role}`);
        return false;
    }
    
    // Admin has access to everything
    if (permissions.includes('*')) return true;
    
    // Check if page is in permissions (normalize page name)
    const normalizedPage = page.toLowerCase();
    return permissions.some(p => p.toLowerCase() === normalizedPage);
}

/**
 * Get dashboard URL for role
 */
function getDashboardForRole(role) {
    if (!role) {
        console.warn('No role provided to getDashboardForRole');
        return 'index.html';
    }
    
    const dashboards = {
        reception: 'index.html',
        nurse: 'nursing.html',
        counselor: 'counseling.html',
        doctor: 'consultation.html',
        embryologist: 'embryology-lab.html',
        admin: 'index.html'
    };
    
    const dashboard = dashboards[role.toLowerCase()] || 'index.html';
    console.log(`Dashboard for role "${role}": ${dashboard}`);
    return dashboard;
}

/**
 * Get current user from session
 */
function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Set current user in session
 */
function setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Handle logout
 */
function handleLogout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

/**
 * Update UI with user information
 */
function updateUserInfo(user) {
    // Update sidebar footer
    const userInfoElements = document.querySelectorAll('.user-info span');
    userInfoElements.forEach(el => {
        if (el) {
            const roleNames = {
                reception: 'Receptionist',
                nurse: 'Nurse',
                counselor: 'Counselor',
                doctor: 'Doctor',
                embryologist: 'Embryologist',
                admin: 'Administrator'
            };
            el.textContent = `${roleNames[user.role] || user.role} - ${user.name}`;
        }
    });
    
    // Add logout button if not exists
    const sidebarFooter = document.querySelector('.sidebar-footer');
    if (sidebarFooter && !document.querySelector('.logout-btn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-secondary btn-small logout-btn';
        logoutBtn.style.width = '100%';
        logoutBtn.style.marginTop = '12px';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        sidebarFooter.appendChild(logoutBtn);
    }
}

/**
 * Get users from database
 */
function getUsers() {
    // Initialize default users if not exists
    const defaultUsers = [
        { id: 1, username: 'admin', password: 'admin123', name: 'Admin User', role: 'admin' },
        { id: 2, username: 'reception', password: 'reception123', name: 'Reception Staff', role: 'reception' },
        { id: 3, username: 'nurse', password: 'nurse123', name: 'Nurse Staff', role: 'nurse' },
        { id: 4, username: 'counselor', password: 'counselor123', name: 'Counselor Staff', role: 'counselor' },
        { id: 5, username: 'doctor', password: 'doctor123', name: 'Dr. Smith', role: 'doctor' },
        { id: 6, username: 'embryologist', password: 'embryo123', name: 'Embryologist Staff', role: 'embryologist' }
    ];
    
    const users = localStorage.getItem('users');
    if (!users) {
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        return defaultUsers;
    }
    
    return JSON.parse(users);
}

