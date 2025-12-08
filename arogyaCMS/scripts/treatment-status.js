/**
 * Treatment Status Update for Doctor and Embryologist
 */

document.addEventListener('DOMContentLoaded', function() {
    const patientSelect = document.getElementById('patient-select');
    const phaseStatusCard = document.getElementById('phase-status-card');
    const phaseStatusContainer = document.getElementById('treatment-phase-status');
    
    // Check if user has permission (doctor or embryologist)
    const currentUser = getCurrentUser();
    if (currentUser && (currentUser.role === 'doctor' || currentUser.role === 'embryologist')) {
        if (phaseStatusCard) {
            phaseStatusCard.style.display = 'block';
        }
        
        // Load phase status when patient is selected
        if (patientSelect) {
            patientSelect.addEventListener('change', async function() {
                if (this.value) {
                    await loadPhaseStatus(this.value);
                }
            });
        }
    }
});

/**
 * Load phase status for a patient
 */
async function loadPhaseStatus(patientId) {
    const phaseStatusContainer = document.getElementById('treatment-phase-status');
    if (!phaseStatusContainer) return;
    
    const treatmentPlans = await db.getTreatmentPlans(patientId);
    if (treatmentPlans.length === 0) {
        phaseStatusContainer.innerHTML = '<p style="color: var(--text-light);">No treatment plan found for this patient.</p>';
        return;
    }
    
    const plan = treatmentPlans[0];
    const phases = typeof plan.phases === 'string' ? JSON.parse(plan.phases) : plan.phases;
    
    if (!phases || phases.length === 0) {
        phaseStatusContainer.innerHTML = '<p style="color: var(--text-light);">No phases defined in treatment plan.</p>';
        return;
    }
    
    phaseStatusContainer.innerHTML = '';
    
    phases.forEach((phase, index) => {
        const phaseCard = document.createElement('div');
        phaseCard.className = 'phase-status-card';
        
        // Get current status (default to pending)
        const currentStatus = phase.phaseStatus || 'pending';
        
        phaseCard.innerHTML = `
            <div class="phase-status-header">
                <h4>${phase.phase}</h4>
                <select class="phase-status-select ${currentStatus}" 
                        data-phase-index="${index}" 
                        data-phase-name="${phase.phase}"
                        onchange="updatePhaseStatus('${patientId}', '${phase.phase}', this.value, ${index})">
                    <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in-progress" ${currentStatus === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${currentStatus === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>
            <div class="phase-details">
                <p style="font-size: 12px; color: var(--text-light); margin-bottom: 8px;">${phase.steps}</p>
                <div style="display: flex; gap: 12px; font-size: 11px; color: var(--text-light);">
                    <span><strong>Duration:</strong> ${phase.duration}</span>
                    <span><strong>Start:</strong> ${phase.startDate || phase.startTime || '-'}</span>
                </div>
            </div>
            <div class="form-group" style="margin-top: 12px;">
                <textarea class="form-input" 
                          rows="2" 
                          placeholder="Add notes for this phase..."
                          data-phase-index="${index}"
                          style="font-size: 12px;"></textarea>
            </div>
        `;
        
        phaseStatusContainer.appendChild(phaseCard);
    });
}

/**
 * Update phase status
 */
window.updatePhaseStatus = async function(patientId, phaseName, status, phaseIndex) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('You must be logged in to update status', 'error');
        return;
    }
    
    // Get notes if available
    const phaseCard = document.querySelector(`.phase-status-card:nth-child(${phaseIndex + 1})`);
    const notesInput = phaseCard ? phaseCard.querySelector('textarea') : null;
    const notes = notesInput ? notesInput.value : '';
    
    try {
        const result = await db.updatePhaseStatus(
            patientId, 
            phaseName, 
            status, 
            notes, 
            currentUser.name || currentUser.username
        );
        
        if (result) {
            showNotification(`Phase "${phaseName}" status updated to ${status}`, 'success');
            
            // Update UI
            const select = phaseCard.querySelector('.phase-status-select');
            if (select) {
                select.className = `phase-status-select ${status}`;
            }
        } else {
            showNotification('Failed to update phase status', 'error');
        }
    } catch (error) {
        console.error('Error updating phase status:', error);
        showNotification('An error occurred while updating status', 'error');
    }
};




