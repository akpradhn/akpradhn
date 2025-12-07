/**
 * Treatment Plan Management JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    const treatmentPlanForm = document.getElementById('treatment-plan-form');
    const patientSelect = document.getElementById('patient-select');
    const templateSelection = document.getElementById('template-selection');
    const customPlanBuilder = document.getElementById('custom-plan-builder');
    const customPlanRadio = document.getElementById('custom-plan');
    const phaseTimelineCard = document.getElementById('phase-timeline-card');
    const planDetailsCard = document.getElementById('plan-details-card');
    const phaseTimeline = document.getElementById('phase-timeline');
    const planStartDate = document.getElementById('plan-start-date');
    
    let selectedTemplate = null;
    let customPhaseCount = 0;
    
    // Load patients
    loadPatients();
    
    // Load templates
    loadTemplates();
    
    // Template selection
    templateSelection.addEventListener('click', function(e) {
        const card = e.target.closest('.plan-template-card');
        if (card) {
            // Remove previous selection
            document.querySelectorAll('.plan-template-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedTemplate = card.dataset.templateId;
            customPlanRadio.checked = false;
            customPlanBuilder.style.display = 'none';
            loadPhaseTimeline(selectedTemplate);
        }
    });
    
    // Custom plan toggle
    customPlanRadio.addEventListener('change', function() {
        if (this.checked) {
            document.querySelectorAll('.plan-template-card').forEach(c => c.classList.remove('selected'));
            selectedTemplate = null;
            customPlanBuilder.style.display = 'block';
            phaseTimelineCard.style.display = 'none';
            planDetailsCard.style.display = 'none';
        }
    });
    
    // Add custom phase
    const addCustomPhaseBtn = document.getElementById('add-custom-phase');
    if (addCustomPhaseBtn) {
        addCustomPhaseBtn.addEventListener('click', function() {
            customPhaseCount++;
            addCustomPhase(customPhaseCount);
        });
    }
    
    // Plan start date change
    if (planStartDate) {
        planStartDate.addEventListener('change', function() {
            if (selectedTemplate) {
                updatePhaseDates();
            }
        });
    }
    
    // Form submission
    if (treatmentPlanForm) {
        treatmentPlanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveTreatmentPlan();
        });
    }
    
    /**
     * Load patients into dropdown
     */
    async function loadPatients() {
        const patients = await db.getPatients();
        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.patientId;
            option.textContent = `${patient.patientId} - ${patient.name}`;
            patientSelect.appendChild(option);
        });
        
        // Load last patient if available
        const lastPatientId = localStorage.getItem('lastPatientId');
        if (lastPatientId) {
            patientSelect.value = lastPatientId;
        }
    }
    
    /**
     * Load treatment templates
     */
    function loadTemplates() {
        const templates = db.getTreatmentTemplates();
        templateSelection.innerHTML = '';
        
        templates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'plan-template-card';
            card.dataset.templateId = template.id;
            card.innerHTML = `
                <h4>${template.name}</h4>
                <p style="color: var(--text-light); font-size: 13px; margin-top: 8px;">
                    ${template.phases.length} phases
                </p>
            `;
            templateSelection.appendChild(card);
        });
    }
    
    /**
     * Load phase timeline
     */
    function loadPhaseTimeline(templateId) {
        const templates = db.getTreatmentTemplates();
        const template = templates.find(t => t.id === templateId);
        
        if (!template) return;
        
        phaseTimeline.innerHTML = '';
        
        template.phases.forEach((phase, index) => {
            const phaseItem = createPhaseItem(phase, index);
            phaseTimeline.appendChild(phaseItem);
        });
        
        phaseTimelineCard.style.display = 'block';
        planDetailsCard.style.display = 'block';
    }
    
    /**
     * Create phase item
     */
    function createPhaseItem(phase, index) {
        const div = document.createElement('div');
        div.className = 'phase-item';
        div.dataset.phaseIndex = index;
        
        const startDate = calculatePhaseStartDate(index);
        const endDate = calculatePhaseEndDate(index, phase.duration);
        
        div.innerHTML = `
            <div class="phase-header">
                <div class="phase-title">${phase.phase}</div>
                <div class="phase-dates">
                    <div class="date-input-group">
                        <label>Start Date</label>
                        <input type="date" class="phase-start-date" value="${startDate}" 
                               data-phase-index="${index}">
                    </div>
                    <div class="date-input-group">
                        <label>End Date</label>
                        <input type="date" class="phase-end-date" value="${endDate}" 
                               data-phase-index="${index}" readonly>
                    </div>
                </div>
            </div>
            <div class="phase-details">
                <div class="phase-detail-item">
                    <strong>Steps:</strong>
                    <span>${phase.steps}</span>
                </div>
                <div class="phase-detail-item">
                    <strong>Duration:</strong>
                    <span>${phase.duration}</span>
                </div>
                <div class="phase-detail-item">
                    <strong>Typical Start:</strong>
                    <span>${phase.startTime}</span>
                </div>
            </div>
        `;
        
        // Add event listener for start date changes
        const startDateInput = div.querySelector('.phase-start-date');
        startDateInput.addEventListener('change', function() {
            updatePhaseEndDate(index, phase.duration);
        });
        
        return div;
    }
    
    /**
     * Calculate phase start date
     */
    function calculatePhaseStartDate(phaseIndex) {
        if (!planStartDate.value) {
            const today = new Date();
            planStartDate.value = today.toISOString().split('T')[0];
        }
        
        const startDate = new Date(planStartDate.value);
        
        // For first phase, start immediately
        if (phaseIndex === 0) {
            return planStartDate.value;
        }
        
        // For subsequent phases, calculate based on previous phase
        // This is simplified - in real app, would calculate based on actual durations
        const daysToAdd = phaseIndex * 7; // Approximate
        startDate.setDate(startDate.getDate() + daysToAdd);
        
        return startDate.toISOString().split('T')[0];
    }
    
    /**
     * Calculate phase end date
     */
    function calculatePhaseEndDate(phaseIndex, duration) {
        const startDateInput = document.querySelector(`.phase-start-date[data-phase-index="${phaseIndex}"]`);
        if (!startDateInput || !startDateInput.value) {
            return '';
        }
        
        const startDate = new Date(startDateInput.value);
        const durationMatch = duration.match(/(\d+)/);
        const days = durationMatch ? parseInt(durationMatch[1]) : 7;
        
        startDate.setDate(startDate.getDate() + days);
        return startDate.toISOString().split('T')[0];
    }
    
    /**
     * Update phase end date
     */
    function updatePhaseEndDate(phaseIndex, duration) {
        const endDateInput = document.querySelector(`.phase-end-date[data-phase-index="${phaseIndex}"]`);
        if (endDateInput) {
            endDateInput.value = calculatePhaseEndDate(phaseIndex, duration);
        }
    }
    
    /**
     * Update all phase dates
     */
    function updatePhaseDates() {
        if (!selectedTemplate) return;
        
        const templates = db.getTreatmentTemplates();
        const template = templates.find(t => t.id === selectedTemplate);
        
        template.phases.forEach((phase, index) => {
            const startDate = calculatePhaseStartDate(index);
            const startDateInput = document.querySelector(`.phase-start-date[data-phase-index="${index}"]`);
            if (startDateInput) {
                startDateInput.value = startDate;
                updatePhaseEndDate(index, phase.duration);
            }
        });
    }
    
    /**
     * Add custom phase
     */
    function addCustomPhase(id) {
        const customPhases = document.getElementById('custom-phases');
        const div = document.createElement('div');
        div.className = 'phase-item';
        div.id = `custom-phase-${id}`;
        div.innerHTML = `
            <div class="form-group">
                <label>Phase Name</label>
                <input type="text" class="form-input" placeholder="e.g., Phase I. Preparation">
            </div>
            <div class="form-group">
                <label>Steps</label>
                <textarea class="form-input" rows="2" placeholder="Describe the steps..."></textarea>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Duration</label>
                    <input type="text" class="form-input" placeholder="e.g., 2-4 Weeks">
                </div>
                <div class="form-group">
                    <label>Start Time</label>
                    <input type="text" class="form-input" placeholder="e.g., Day 1 of cycle">
                </div>
            </div>
            <button type="button" class="btn btn-secondary btn-small" onclick="removeCustomPhase(${id})">
                <i class="fas fa-trash"></i> Remove Phase
            </button>
        `;
        customPhases.appendChild(div);
    }
    
    /**
     * Remove custom phase
     */
    window.removeCustomPhase = function(id) {
        const phase = document.getElementById(`custom-phase-${id}`);
        if (phase) {
            phase.remove();
        }
    };
    
    /**
     * Save treatment plan
     */
    async function saveTreatmentPlan() {
        if (!patientSelect.value) {
            showNotification('Please select a patient', 'error');
            return;
        }
        
        if (!selectedTemplate && !customPlanRadio.checked) {
            showNotification('Please select a treatment template or create a custom plan', 'error');
            return;
        }
        
        if (!planStartDate.value) {
            showNotification('Please select a treatment start date', 'error');
            return;
        }
        
        const formData = new FormData(treatmentPlanForm);
        
        let phases = [];
        
        if (selectedTemplate) {
            // Get phases from template
            const templates = db.getTreatmentTemplates();
            const template = templates.find(t => t.id === selectedTemplate);
            
            phases = template.phases.map((phase, index) => {
                const startDateInput = document.querySelector(`.phase-start-date[data-phase-index="${index}"]`);
                const endDateInput = document.querySelector(`.phase-end-date[data-phase-index="${index}"]`);
                
                return {
                    ...phase,
                    startDate: startDateInput ? startDateInput.value : '',
                    endDate: endDateInput ? endDateInput.value : ''
                };
            });
        } else {
            // Get custom phases
            const customPhases = document.querySelectorAll('#custom-phases .phase-item');
            customPhases.forEach(phaseDiv => {
                const inputs = phaseDiv.querySelectorAll('input, textarea');
                phases.push({
                    phase: inputs[0].value,
                    steps: inputs[1].value,
                    duration: inputs[2].value,
                    startTime: inputs[3].value
                });
            });
        }
        
        const planData = {
            patientId: patientSelect.value,
            templateId: selectedTemplate || 'custom',
            planName: selectedTemplate ? 
                db.getTreatmentTemplates().find(t => t.id === selectedTemplate).name : 
                formData.get('custom-plan-name') || 'Custom Plan',
            startDate: planStartDate.value,
            phases: phases,
            notes: formData.get('notes') || '',
            status: formData.get('status') || 'draft',
            createdBy: (getCurrentUser() || { id: 'system' }).id
        };
        
        await db.saveTreatmentPlan(planData);
        
        showNotification('Treatment plan saved successfully!', 'success');
        
        // Reload phase status if available
        if (document.getElementById('treatment-phase-status')) {
            await loadPhaseStatus(patientSelect.value);
        }
        
        setTimeout(() => {
            window.location.href = 'patient-summary.html';
        }, 1500);
    }
});

