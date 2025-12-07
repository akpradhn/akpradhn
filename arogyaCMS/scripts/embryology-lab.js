/**
 * Embryology Lab - Treatment Plans Display
 */

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Embryology Lab page loaded');
    
    // Initialize tabs
    initEmbryologyTabs();
    
    // Load treatment plans on page load - wait for tabs to be initialized
    setTimeout(() => {
        console.log('Loading treatment plans after tab initialization...');
        loadTreatmentPlans();
    }, 500);
});

/**
 * Initialize tabs for embryology lab page
 */
function initEmbryologyTabs() {
    const tabs = [
        {
            id: 'treatment-plans',
            label: 'Treatment Plans',
            icon: 'fas fa-clipboard-list',
            content: `
                <div id="treatment-plans-container">
                    <div id="treatment-plans-list" class="table-responsive">
                        <!-- Treatment plans will be loaded here -->
                        <div style="text-align: center; padding: 40px; color: var(--text-light);">
                            <i class="fas fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 16px;"></i>
                            <p>Loading treatment plans...</p>
                        </div>
                    </div>
                </div>
            `
        }
    ];
    
    if (typeof window.initTabs === 'function') {
        window.initTabs('embryology-tabs-container', tabs);
    } else {
        // Retry if tabs.js hasn't loaded yet
        setTimeout(() => {
            if (typeof window.initTabs === 'function') {
                window.initTabs('embryology-tabs-container', tabs);
            }
        }, 100);
    }
}

/**
 * Load all treatment plans
 */
async function loadTreatmentPlans() {
    try {
        console.log('=== Loading treatment plans for embryology lab ===');
        
        // Check if db is available
        if (!db || typeof db.getTreatmentPlans !== 'function') {
            console.error('Database object not available or getTreatmentPlans method missing');
            showNotification('Database connection error. Please refresh the page.', 'error');
            return;
        }
        
        // Get all treatment plans
        console.log('Calling db.getTreatmentPlans()...');
        const treatmentPlans = await db.getTreatmentPlans();
        console.log('Response from db.getTreatmentPlans():', treatmentPlans);
        console.log('Type:', typeof treatmentPlans);
        console.log('Is array:', Array.isArray(treatmentPlans));
        console.log('Total plans:', treatmentPlans ? treatmentPlans.length : 0);
        
        // Handle case where API returns null or undefined
        if (!treatmentPlans) {
            console.warn('getTreatmentPlans returned null or undefined');
            await displayTreatmentPlans([]);
            return;
        }
        
        // Ensure it's an array
        const plansArray = Array.isArray(treatmentPlans) ? treatmentPlans : [];
        console.log('Plans array length:', plansArray.length);
        
        // Remove duplicates - keep only the most recent plan for each patient
        const uniquePlans = [];
        const seenPatients = new Map();
        
        for (const plan of plansArray) {
            if (!plan || !plan.patientId) continue;
            
            const patientId = plan.patientId;
            const existingPlan = seenPatients.get(patientId);
            
            if (!existingPlan) {
                // First plan for this patient
                seenPatients.set(patientId, plan);
                uniquePlans.push(plan);
            } else {
                // Compare dates - keep the most recent one
                const existingDate = new Date(existingPlan.createdAt || existingPlan.updatedAt || 0);
                const currentDate = new Date(plan.createdAt || plan.updatedAt || 0);
                
                if (currentDate > existingDate) {
                    // Replace with newer plan
                    const index = uniquePlans.indexOf(existingPlan);
                    if (index > -1) {
                        uniquePlans[index] = plan;
                        seenPatients.set(patientId, plan);
                    }
                }
            }
        }
        
        console.log('After deduplication:', uniquePlans.length, 'unique plans');
        
        // Show all treatment plans (not just active ones)
        // Filter out only cancelled plans, show everything else
        const displayPlans = uniquePlans.filter(plan => {
            if (!plan) return false;
            const status = (plan.status || '').toLowerCase();
            const isCancelled = status === 'cancelled';
            return !isCancelled;
        });
        
        console.log('Treatment plans to display:', displayPlans);
        console.log('Number of plans to display:', displayPlans.length);
        
        await displayTreatmentPlans(displayPlans);
    } catch (error) {
        console.error('Error loading treatment plans:', error);
        console.error('Error stack:', error.stack);
        showNotification('Error loading treatment plans: ' + (error.message || 'Unknown error'), 'error');
        
        // Show error in container if available
        const container = document.getElementById('treatment-plans-list');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #c00;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
                    <p style="font-size: 16px; margin-bottom: 8px;"><strong>Error loading treatment plans</strong></p>
                    <p style="font-size: 14px;">${error.message || 'Unknown error occurred'}</p>
                    <button class="btn btn-primary" onclick="loadTreatmentPlans()" style="margin-top: 15px;">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    }
}

/**
 * Display treatment plans in a table
 */
async function displayTreatmentPlans(plans) {
    console.log('=== Displaying treatment plans ===');
    console.log('Number of plans to display:', plans ? plans.length : 0);
    
    // Try to find container - wait a bit if not found
    let container = document.getElementById('treatment-plans-list');
    
    if (!container) {
        console.warn('Container not found immediately, trying to find in tab...');
        // Try to find it in the tab
        const tab = document.getElementById('tab-treatment-plans');
        if (tab) {
            container = tab.querySelector('#treatment-plans-list');
            console.log('Found container in tab:', !!container);
        }
    }
    
    if (!container) {
        console.error('Treatment plans container not found after retry');
        // Create a temporary error message
        const tabsContainer = document.getElementById('embryology-tabs-container');
        if (tabsContainer) {
            tabsContainer.innerHTML = `
                <div style="padding: 20px; color: #c00;">
                    <p><strong>Error:</strong> Could not find display container. Please refresh the page.</p>
                </div>
            `;
        }
        return;
    }
    
    console.log('Container found, proceeding with display');
    
    if (plans.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-light);">
                <i class="fas fa-clipboard-list" style="font-size: 48px; margin-bottom: 16px; color: var(--primary);"></i>
                <p style="font-size: 16px; margin-bottom: 8px;"><strong>No treatment plans found.</strong></p>
                <p style="font-size: 14px; color: var(--text-light);">Treatment plans will appear here once they are created by doctors during consultation.</p>
                <p style="font-size: 12px; color: var(--text-light); margin-top: 10px;">Make sure the doctor completes the consultation and selects a treatment plan type.</p>
            </div>
        `;
        return;
    }
    
    // Fetch patient information for each plan
    const plansWithPatients = [];
    for (const plan of plans) {
        try {
            const patient = await db.getPatient(plan.patientId);
            plansWithPatients.push({
                ...plan,
                patient: patient || { name: 'Unknown', patientId: plan.patientId }
            });
        } catch (error) {
            console.error(`Error fetching patient ${plan.patientId}:`, error);
            plansWithPatients.push({
                ...plan,
                patient: { name: 'Unknown', patientId: plan.patientId }
            });
        }
    }
    
    // Sort by created date (most recent first) - show newest plans at the top
    plansWithPatients.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.startDate || 0);
        const dateB = new Date(b.createdAt || b.startDate || 0);
        return dateB - dateA;
    });
    
    // Create table
    const table = document.createElement('table');
    table.className = 'data-table';
    table.style.width = '100%';
    
    table.innerHTML = `
        <thead>
            <tr>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Plan Name</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>Created Date</th>
                <th>Phases</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <!-- Rows will be added here -->
        </tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    // Populate rows
    for (const plan of plansWithPatients) {
        const patient = plan.patient;
        const phases = Array.isArray(plan.phases) ? plan.phases : [];
        const phaseCount = phases.length;
        
        // Format start date
        const startDate = plan.startDate ? new Date(plan.startDate).toLocaleDateString() : '-';
        
        // Format created date
        const createdDate = plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : '-';
        
        // Get plan type
        const planType = plan.templateId === 'ivf_standard' ? 'IVF' : 
                         plan.templateId === 'iui_standard' ? 'IUI' : 
                         plan.templateId === 'custom' ? 'Custom' : 
                         plan.templateId || 'Custom';
        
        // Status badge
        const statusBadge = getStatusBadge(plan.status);
        
        // Created by info
        const createdBy = plan.createdBy || 'Doctor';
        
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.onclick = () => viewTreatmentPlanDetailsById(plan.patientId, plan.id || '');
        row.innerHTML = `
            <td><strong>${plan.patientId}</strong></td>
            <td>${patient.name || '-'}</td>
            <td><strong>${plan.planName || 'Untitled Plan'}</strong></td>
            <td><span class="badge badge-new">${planType}</span></td>
            <td>${startDate}</td>
            <td style="font-size: 12px; color: var(--text-light);">${createdDate}</td>
            <td>${phaseCount} phase${phaseCount !== 1 ? 's' : ''}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); viewTreatmentPlanDetailsById('${plan.patientId}', '${plan.id || ''}')" style="margin-right: 5px;">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); editTreatmentPlanById('${plan.patientId}', '${plan.id || ''}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </td>
        `;
        tbody.appendChild(row);
    }
    
    container.innerHTML = '';
    container.appendChild(table);
}

/**
 * View treatment plan details by ID
 */
window.viewTreatmentPlanDetailsById = async function(patientId, planId) {
    try {
        // Get treatment plans for this patient
        const plans = await db.getTreatmentPlans(patientId);
        let plan = null;
        
        if (planId) {
            plan = plans.find(p => p.id == planId);
        } else {
            // Get the most recent active plan
            plan = plans.find(p => {
                const status = (p.status || '').toLowerCase();
                return status === 'active' || status === 'in_progress' || status === 'approved';
            }) || plans[0];
        }
        
        if (!plan) {
            showNotification('Treatment plan not found', 'error');
            return;
        }
        
        viewTreatmentPlanDetails(plan);
    } catch (error) {
        console.error('Error loading treatment plan:', error);
        showNotification('Error loading treatment plan details', 'error');
    }
};

/**
 * View treatment plan details
 */
window.viewTreatmentPlanDetails = function(plan) {
    // Create modal for plan details
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    // Fetch patient info
    db.getPatient(plan.patientId).then(patient => {
        const patientName = patient ? patient.name : 'Unknown';
        const phases = Array.isArray(plan.phases) ? plan.phases : [];
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0;">Treatment Plan Details</h2>
                    <button class="close-button" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="card" style="margin-bottom: 20px;">
                    <h3 style="margin-top: 0; color: var(--primary);">Patient Information</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <strong>Patient ID:</strong> ${plan.patientId}
                        </div>
                        <div>
                            <strong>Patient Name:</strong> ${patientName}
                        </div>
                    </div>
                </div>
                
                <div class="card" style="margin-bottom: 20px;">
                    <h3 style="margin-top: 0; color: var(--primary);">Plan Information</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <strong>Plan Name:</strong> ${plan.planName || 'Untitled Plan'}
                        </div>
                        <div>
                            <strong>Type:</strong> ${plan.templateId === 'ivf_standard' ? 'IVF' : plan.templateId === 'iui_standard' ? 'IUI' : 'Custom'}
                        </div>
                        <div>
                            <strong>Start Date:</strong> ${plan.startDate ? new Date(plan.startDate).toLocaleDateString() : '-'}
                        </div>
                        <div>
                            <strong>Status:</strong> ${getStatusBadge(plan.status)}
                        </div>
                        <div>
                            <strong>Created Date:</strong> ${plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : '-'}
                        </div>
                        <div>
                            <strong>Created By:</strong> ${plan.createdBy || 'Doctor'}
                        </div>
                    </div>
                    ${plan.notes ? `<div style="margin-top: 15px;"><strong>Notes:</strong><p style="margin-top: 5px;">${plan.notes}</p></div>` : ''}
                </div>
                
                ${phases.length > 0 ? `
                <div class="card">
                    <h3 style="margin-top: 0; color: var(--primary);">Treatment Phases</h3>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        ${phases.map((phase, index) => `
                            <div style="border-left: 4px solid var(--primary); padding-left: 15px;">
                                <h4 style="margin: 0 0 8px 0; color: var(--text-dark);">
                                    Phase ${index + 1}: ${phase.phase || `Phase ${index + 1}`}
                                </h4>
                                ${phase.steps ? `<p style="margin: 5px 0; color: var(--text-light);">${phase.steps}</p>` : ''}
                                <div style="display: flex; gap: 20px; margin-top: 8px; font-size: 14px; color: var(--text-light);">
                                    ${phase.duration ? `<span><i class="fas fa-clock"></i> Duration: ${phase.duration}</span>` : ''}
                                    ${phase.startTime ? `<span><i class="fas fa-calendar"></i> Start: ${phase.startTime}</span>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div style="margin-top: 20px; text-align: right;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }).catch(error => {
        console.error('Error fetching patient:', error);
        showNotification('Error loading patient information', 'error');
    });
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
    const statusLower = (status || 'draft').toLowerCase();
    const badges = {
        'active': '<span class="badge badge-checked-in">Active</span>',
        'in_progress': '<span class="badge badge-new">In Progress</span>',
        'approved': '<span class="badge badge-paid">Approved</span>',
        'completed': '<span class="badge badge-paid">Completed</span>',
        'draft': '<span class="badge" style="background: #e0e0e0; color: #666;">Draft</span>',
        'cancelled': '<span class="badge" style="background: #fee; color: #c00;">Cancelled</span>'
    };
    return badges[statusLower] || `<span class="badge">${status || 'Draft'}</span>`;
}

/**
 * Edit treatment plan by ID
 */
window.editTreatmentPlanById = async function(patientId, planId) {
    try {
        // Get treatment plans for this patient
        const plans = await db.getTreatmentPlans(patientId);
        let plan = null;
        
        if (planId) {
            plan = plans.find(p => p.id == planId);
        } else {
            // Get the most recent plan
            plan = plans[0];
        }
        
        if (!plan) {
            showNotification('Treatment plan not found', 'error');
            return;
        }
        
        editTreatmentPlan(plan);
    } catch (error) {
        console.error('Error loading treatment plan:', error);
        showNotification('Error loading treatment plan', 'error');
    }
};

/**
 * Edit treatment plan
 */
window.editTreatmentPlan = function(plan) {
    // Create modal for editing plan
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    // Fetch patient info
    db.getPatient(plan.patientId).then(patient => {
        const patientName = patient ? patient.name : 'Unknown';
        const phases = Array.isArray(plan.phases) ? plan.phases : [];
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0;">Edit Treatment Plan</h2>
                    <button class="close-button" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="edit-plan-form">
                    <div class="card" style="margin-bottom: 20px;">
                        <h3 style="margin-top: 0; color: var(--primary);">Patient Information</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <strong>Patient ID:</strong> ${plan.patientId}
                            </div>
                            <div>
                                <strong>Patient Name:</strong> ${patientName}
                            </div>
                        </div>
                    </div>
                    
                    <div class="card" style="margin-bottom: 20px;">
                        <h3 style="margin-top: 0; color: var(--primary);">Plan Information</h3>
                        <div class="form-group">
                            <label for="edit-plan-name">Plan Name *</label>
                            <input type="text" id="edit-plan-name" name="planName" 
                                   value="${plan.planName || ''}" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-plan-type">Plan Type</label>
                            <select id="edit-plan-type" name="templateId" class="form-input">
                                <option value="ivf_standard" ${plan.templateId === 'ivf_standard' ? 'selected' : ''}>IVF</option>
                                <option value="iui_standard" ${plan.templateId === 'iui_standard' ? 'selected' : ''}>IUI</option>
                                <option value="custom" ${plan.templateId === 'custom' || !plan.templateId ? 'selected' : ''}>Custom</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-plan-start-date">Start Date</label>
                            <input type="date" id="edit-plan-start-date" name="startDate" 
                                   value="${plan.startDate || ''}" class="form-input">
                        </div>
                        <div class="form-group">
                            <label for="edit-plan-status">Status</label>
                            <select id="edit-plan-status" name="status" class="form-input">
                                <option value="draft" ${plan.status === 'draft' ? 'selected' : ''}>Draft</option>
                                <option value="active" ${plan.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="in_progress" ${plan.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                                <option value="approved" ${plan.status === 'approved' ? 'selected' : ''}>Approved</option>
                                <option value="completed" ${plan.status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="cancelled" ${plan.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-plan-notes">Notes</label>
                            <textarea id="edit-plan-notes" name="notes" rows="4" 
                                      class="form-input">${plan.notes || ''}</textarea>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; text-align: right;">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        const form = document.getElementById('edit-plan-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const updates = {
                planName: formData.get('planName'),
                templateId: formData.get('templateId'),
                startDate: formData.get('startDate'),
                status: formData.get('status'),
                notes: formData.get('notes')
            };
            
            try {
                const updatedPlan = await db.updateTreatmentPlan(plan.id, updates);
                if (updatedPlan) {
                    showNotification('Treatment plan updated successfully!', 'success');
                    modal.remove();
                    // Reload the plans list
                    loadTreatmentPlans();
                } else {
                    showNotification('Failed to update treatment plan', 'error');
                }
            } catch (error) {
                console.error('Error updating treatment plan:', error);
                showNotification('Error updating treatment plan: ' + error.message, 'error');
            }
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }).catch(error => {
        console.error('Error fetching patient:', error);
        showNotification('Error loading patient information', 'error');
    });
};

// Make loadTreatmentPlans available globally
window.loadTreatmentPlans = loadTreatmentPlans;

