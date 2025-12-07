/**
 * Navigation Module
 * Renders consistent navigation across all pages based on user role
 */

/**
 * Get current page name
 */
function getCurrentPageName() {
    const path = window.location.pathname;
    if (path === '/' || path === '') {
        const fullPath = window.location.href;
        const fileName = fullPath.split('/').pop().split('?')[0].split('#')[0];
        return fileName || 'index.html';
    }
    const fileName = path.split('/').pop().split('?')[0].split('#')[0];
    return fileName || 'index.html';
}

/**
 * Get current user from session
 * Uses the function from auth.js if available, otherwise defines it here
 */
function getCurrentUserForNav() {
    // Try to use the function from auth.js if available
    if (typeof getCurrentUser !== 'undefined') {
        return getCurrentUser();
    }
    // Fallback implementation
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Check if user has access to a page
 */
function hasPageAccess(role, page) {
    const ROLE_PERMISSIONS = {
        reception: ['index.html', 'registration.html', 'appointments.html', 'patient-summary.html'],
        nurse: ['nursing.html', 'patient-summary.html'],
        counselor: ['counseling.html', 'patient-summary.html'],
        doctor: ['consultation.html', 'treatment-plan.html', 'embryology-lab.html', 'patient-summary.html'],
        embryologist: ['treatment-plan.html', 'embryology-lab.html', 'patient-summary.html'],
        admin: ['*'] // Admin has access to all pages
    };

    const permissions = ROLE_PERMISSIONS[role] || [];
    
    // Admin has access to everything
    if (permissions.includes('*')) return true;
    
    // Check if page is in permissions
    const normalizedPage = page.toLowerCase();
    return permissions.some(p => p.toLowerCase() === normalizedPage);
}

/**
 * Get role display name
 */
function getRoleDisplayName(role) {
    const roleNames = {
        reception: 'Receptionist',
        nurse: 'Nurse',
        counselor: 'Counselor',
        doctor: 'Doctor',
        embryologist: 'Embryologist',
        admin: 'Administrator'
    };
    return roleNames[role] || role;
}

/**
 * Render navigation menu
 */
function renderNavigation() {
    const currentPage = getCurrentPageName();
    const currentUser = getCurrentUserForNav();
    const userRole = currentUser ? currentUser.role : 'reception'; // Default to reception
    
    // Navigation items configuration
    const navItems = [
        {
            href: 'index.html',
            icon: 'fa-tachometer-alt',
            label: 'Dashboard',
            roles: ['admin'], // Removed 'reception' - only admin can see dashboard
            page: 'index.html'
        },
        {
            href: 'registration.html',
            icon: 'fa-user-plus',
            label: 'Registration',
            roles: ['reception', 'admin'],
            page: 'registration.html'
        },
        {
            href: 'appointments.html',
            icon: 'fa-calendar-alt',
            label: 'Appointments',
            roles: ['reception', 'admin'],
            page: 'appointments.html'
        },
        {
            href: 'nursing.html',
            icon: 'fa-user-nurse',
            label: 'Nursing',
            roles: ['nurse', 'doctor', 'admin'],
            page: 'nursing.html'
        },
        {
            href: 'counseling.html',
            icon: 'fa-comments',
            label: 'Counseling',
            roles: ['counselor', 'admin'],
            page: 'counseling.html'
        },
        {
            href: 'consultation.html',
            icon: 'fa-stethoscope',
            label: 'Doctor Consultation',
            roles: ['doctor', 'admin'],
            page: 'consultation.html'
        },
        {
            href: 'treatment-plan.html',
            icon: 'fa-calendar-check',
            label: 'Treatment Plan',
            roles: ['doctor', 'embryologist', 'admin'],
            page: 'treatment-plan.html'
        },
        {
            href: 'embryology-lab.html',
            icon: 'fa-flask',
            label: 'Embryology Lab',
            roles: ['embryologist', 'doctor', 'admin'],
            page: 'embryology-lab.html'
        }
    ];

    const quickAccessItems = [
        {
            href: 'patient-summary.html',
            icon: 'fa-file-medical',
            label: 'Patient Summary',
            roles: ['*'], // All roles
            page: 'patient-summary.html'
        },
        {
            href: 'treatment-plan.html',
            icon: 'fa-calendar-check',
            label: 'Treatment Plans',
            roles: ['doctor', 'embryologist', 'admin'],
            page: 'treatment-plan.html'
        }
    ];

    // Filter navigation items based on role
    const filteredNavItems = navItems.filter(item => {
        if (item.roles.includes('*') || item.roles.includes(userRole) || userRole === 'admin') {
            return true;
        }
        // Also check page-level access
        return hasPageAccess(userRole, item.page);
    });

    const filteredQuickAccess = quickAccessItems.filter(item => {
        if (item.roles.includes('*') || item.roles.includes(userRole) || userRole === 'admin') {
            return true;
        }
        return hasPageAccess(userRole, item.page);
    });

    // Generate navigation HTML
    let navHTML = '<nav class="sidebar-nav">';
    
    // Main Modules section
    navHTML += '<div class="nav-section">';
    navHTML += '<h3 class="nav-section-title">Main Modules</h3>';
    
    filteredNavItems.forEach(item => {
        const isActive = currentPage === item.page ? 'active' : '';
        navHTML += `
            <a href="${item.href}" class="nav-item ${isActive}" data-role="${item.roles[0]}">
                <i class="fas ${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `;
    });
    
    navHTML += '</div>';
    
    // Quick Access section
    navHTML += '<div class="nav-section">';
    navHTML += '<h3 class="nav-section-title">Quick Access</h3>';
    
    filteredQuickAccess.forEach(item => {
        const isActive = currentPage === item.page ? 'active' : '';
        navHTML += `
            <a href="${item.href}" class="nav-item ${isActive}">
                <i class="fas ${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `;
    });
    
    navHTML += '</div>';
    navHTML += '</nav>';

    // Update sidebar navigation
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        sidebarNav.outerHTML = navHTML;
    }

    // Update sidebar footer with user info
    const userInfo = document.querySelector('.user-info span');
    if (userInfo && currentUser) {
        userInfo.textContent = `${getRoleDisplayName(userRole)} - ${currentUser.name}`;
    } else if (userInfo) {
        userInfo.textContent = 'Guest User';
    }
}

/**
 * Initialize navigation on page load
 */
function initNavigation() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderNavigation);
    } else {
        renderNavigation();
    }
}

// Auto-initialize
initNavigation();
