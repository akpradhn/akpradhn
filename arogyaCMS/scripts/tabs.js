/**
 * Tab Management Utility
 * Handles tab switching across all pages
 */

/**
 * Initialize tabs
 * @param {string} containerId - ID of the tabs container
 * @param {Array} tabs - Array of tab objects: [{id, label, icon, content}]
 */
function initTabs(containerId, tabs) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Tab container with ID "${containerId}" not found`);
        return;
    }
    
    // Create tabs structure
    let tabsHTML = '<div class="tabs-container">';
    tabsHTML += '<div class="tabs-header">';
    
    tabs.forEach((tab, index) => {
        const isActive = index === 0 ? 'active' : '';
        tabsHTML += `
            <button class="tab-button ${isActive}" data-tab="${tab.id}" onclick="switchTab('${containerId}', '${tab.id}')">
                ${tab.icon ? `<i class="${tab.icon}"></i>` : ''}
                <span>${tab.label}</span>
            </button>
        `;
    });
    
    tabsHTML += '</div>';
    tabsHTML += '<div class="tabs-content-wrapper">';
    
    tabs.forEach((tab, index) => {
        const isActive = index === 0 ? 'active' : '';
        tabsHTML += `
            <div class="tab-content ${isActive}" id="tab-${tab.id}">
                ${tab.content || ''}
            </div>
        `;
    });
    
    tabsHTML += '</div>';
    tabsHTML += '</div>';
    
    container.innerHTML = tabsHTML;
}

/**
 * Switch to a specific tab
 * @param {string} containerId - ID of the tabs container
 * @param {string} tabId - ID of the tab to switch to
 */
function switchTab(containerId, tabId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Remove active class from all buttons and content
    const buttons = container.querySelectorAll('.tab-button');
    const contents = container.querySelectorAll('.tab-content');
    
    buttons.forEach(btn => {
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    contents.forEach(content => {
        if (content.id === `tab-${tabId}`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Make functions available globally
window.initTabs = initTabs;
window.switchTab = switchTab;



