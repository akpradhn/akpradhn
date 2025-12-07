/**
 * Initialize tabs for consultation page
 */
function initConsultationTabs() {
    const tabs = [
        {
            id: 'appointments',
            label: 'Appointments',
            icon: 'fas fa-calendar-day',
            content: `
                <div id="consultation-appointments-container">
                    <div id="today-appointments-list" class="table-responsive">
                        <!-- Appointments will be loaded here -->
                    </div>
                </div>
            `
        },
        {
            id: 'intake-summary',
            label: 'Intake Summary',
            icon: 'fas fa-clipboard-check',
            content: `
                <div class="intake-summary" id="intake-summary">
                    <div class="summary-section">
                        <h4>Patient Information</h4>
                        <div class="summary-item">
                            <span class="summary-label">Name:</span>
                            <span class="summary-value" id="summary-patient-name">-</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Patient ID:</span>
                            <span class="summary-value" id="summary-patient-id">-</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Primary Complaint:</span>
                            <span class="summary-value" id="summary-complaint">-</span>
                        </div>
                    </div>

                    <div class="summary-section">
                        <h4>Medical History (Nursing)</h4>
                        <div class="summary-item">
                            <span class="summary-label">Past Conditions:</span>
                            <span class="summary-value" id="summary-past-conditions">-</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Allergies:</span>
                            <span class="summary-value" id="summary-allergies">-</span>
                        </div>
                    </div>

                    <div class="summary-section">
                        <h4>Current Medications</h4>
                        <div class="medication-summary" id="summary-medications">
                            <div class="med-item">No medications recorded</div>
                        </div>
                    </div>

                    <div class="summary-section">
                        <h4>Counseling Summary</h4>
                        <div class="summary-item">
                            <span class="summary-label">Payment Plan:</span>
                            <span class="summary-value" id="summary-payment-plan">-</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Estimated Cost:</span>
                            <span class="summary-value" id="summary-estimated-cost">-</span>
                        </div>
                    </div>

                    <div class="summary-section">
                        <h4>Documents</h4>
                        <div class="documents-summary" id="summary-documents">
                            <div class="doc-item">No documents uploaded</div>
                        </div>
                    </div>
                </div>
                <div class="form-actions" style="margin-top: 20px;">
                    <button type="button" class="btn btn-primary btn-large" onclick="navigateToNextConsultationTab('diagnosis')">
                        Next: Diagnosis & Observations <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `
        },
        {
            id: 'diagnosis',
            label: 'Diagnosis & Observations',
            icon: 'fas fa-diagnoses',
            content: `
                <div class="form-group">
                    <label for="diagnosis" class="required">Diagnosis</label>
                    <input type="text" id="diagnosis" name="diagnosis" required 
                           placeholder="Enter primary diagnosis..." class="form-input">
                </div>
                <div class="form-group">
                    <label for="secondary-diagnosis">Secondary Diagnosis (Optional)</label>
                    <input type="text" id="secondary-diagnosis" name="secondaryDiagnosis" 
                           placeholder="Additional diagnosis if any..." class="form-input">
                </div>
                <div class="form-group">
                    <label for="observations">Clinical Notes & Observations</label>
                    <textarea id="observations" name="observations" 
                              rows="8" placeholder="Detailed clinical observations, examination findings, assessment notes..."
                              class="form-input"></textarea>
                </div>
                <div class="form-group">
                    <label for="recommendations">Treatment Recommendations</label>
                    <textarea id="recommendations" name="recommendations" 
                              rows="4" placeholder="General treatment approach and recommendations..."
                              class="form-input"></textarea>
                </div>
                <div class="form-actions" style="margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="navigateToNextConsultationTab('intake-summary')">
                        <i class="fas fa-arrow-left"></i> Previous
                    </button>
                    <button type="button" class="btn btn-primary btn-large" onclick="navigateToNextConsultationTab('prescription')">
                        Next: Prescription <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `
        },
        {
            id: 'prescription',
            label: 'Prescription',
            icon: 'fas fa-prescription',
            content: `
                <div id="prescription-items" class="prescription-container">
                    <!-- Prescription items will be added dynamically -->
                </div>
                <button type="button" class="btn btn-secondary btn-small" id="add-prescription-item">
                    <i class="fas fa-plus"></i> Add Medication
                </button>
                <div class="form-actions" style="margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="navigateToNextConsultationTab('diagnosis')">
                        <i class="fas fa-arrow-left"></i> Previous
                    </button>
                    <button type="button" class="btn btn-primary btn-large" onclick="navigateToNextConsultationTab('tests')">
                        Next: Order Tests <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `
        },
        {
            id: 'tests',
            label: 'Order Tests',
            icon: 'fas fa-vial',
            content: `
                <div class="tests-section">
                    <div class="test-category">
                        <h4>Lab Tests</h4>
                        <div class="test-checkboxes">
                            <label class="checkbox-label">
                                <input type="checkbox" name="labTests" value="cbc">
                                <span>CBC (Complete Blood Count)</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="labTests" value="lipid">
                                <span>Lipid Profile</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="labTests" value="liver">
                                <span>Liver Function Test</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="labTests" value="kidney">
                                <span>Kidney Function Test</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="labTests" value="blood-sugar">
                                <span>Blood Sugar (Fasting & PP)</span>
                            </label>
                        </div>
                    </div>
                    <div class="test-category">
                        <h4>Scan Assessment</h4>
                        <div class="test-checkboxes">
                            <label class="checkbox-label">
                                <input type="checkbox" name="scans" value="xray">
                                <span>X-Ray</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="scans" value="ct">
                                <span>CT Scan</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="scans" value="mri">
                                <span>MRI</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="scans" value="ultrasound">
                                <span>Ultrasound</span>
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="custom-tests">Custom Test Instructions</label>
                        <textarea id="custom-tests" name="customTests" 
                                  rows="3" placeholder="Any additional test instructions..."
                                  class="form-input"></textarea>
                    </div>
                </div>
                <div class="form-actions" style="margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="navigateToNextConsultationTab('prescription')">
                        <i class="fas fa-arrow-left"></i> Previous
                    </button>
                    <button type="button" class="btn btn-primary btn-large" onclick="navigateToNextConsultationTab('treatment-plan')">
                        Next: Treatment Plan <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `
        },
        {
            id: 'treatment-plan',
            label: 'Treatment Plan',
            icon: 'fas fa-clipboard-list',
            content: `
                <div class="form-group">
                    <label for="treatment-plan-type">Treatment Plan Type</label>
                    <select id="treatment-plan-type" name="treatmentPlanType" class="form-input">
                        <option value="">Select treatment plan...</option>
                        <option value="ivf">IVF (In Vitro Fertilization)</option>
                        <option value="iui">IUI (Intrauterine Insemination)</option>
                        <option value="custom">Custom Plan</option>
                    </select>
                </div>
                <div id="treatment-plan-details" style="display: none;">
                    <div class="form-group">
                        <label for="treatment-plan-name">Plan Name</label>
                        <input type="text" id="treatment-plan-name" name="treatmentPlanName" 
                               placeholder="Enter treatment plan name..." class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="treatment-plan-description">Plan Description</label>
                        <textarea id="treatment-plan-description" name="treatmentPlanDescription" 
                                  rows="4" placeholder="Describe the treatment plan..."
                                  class="form-input"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="treatment-plan-start-date">Start Date</label>
                        <input type="date" id="treatment-plan-start-date" name="treatmentPlanStartDate" 
                               class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="treatment-plan-duration">Duration (days)</label>
                        <input type="number" id="treatment-plan-duration" name="treatmentPlanDuration" 
                               placeholder="Enter duration in days" class="form-input" min="1">
                    </div>
                    <div class="form-group">
                        <label for="treatment-plan-phases">Treatment Phases</label>
                        <textarea id="treatment-plan-phases" name="treatmentPlanPhases" 
                                  rows="6" placeholder="Describe treatment phases (e.g., Phase 1: Stimulation, Phase 2: Monitoring, etc.)..."
                                  class="form-input"></textarea>
                    </div>
                </div>
                <div class="form-actions" style="margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="navigateToNextConsultationTab('tests')">
                        <i class="fas fa-arrow-left"></i> Previous
                    </button>
                    <button type="button" class="btn btn-primary btn-large" onclick="handleConsultationFormSubmit()">
                        <i class="fas fa-check-circle"></i>
                        Complete Consultation & Save Treatment Plan
                    </button>
                </div>
            `
        }
    ];
    
    initTabs('consultation-tabs-container', tabs);
    
    // Re-initialize event handlers after tabs are created
    setTimeout(() => {
        initializeConsultationHandlers();
        // Auto-load appointments and switch to appointments tab
        setTimeout(() => {
            // Switch to appointments tab first
            if (window.switchTab) {
                window.switchTab('consultation-tabs-container', 'appointments');
                console.log('Switched to appointments tab');
            }
            
            // Then load appointments after tab is visible
            setTimeout(() => {
                if (window.loadTodayAppointments) {
                    console.log('Calling loadTodayAppointments...');
                    window.loadTodayAppointments();
                } else {
                    console.error('loadTodayAppointments function not available');
                }
            }, 500); // Increased delay to ensure tab is fully rendered
        }, 200);
    }, 100);
}

function initializeConsultationHandlers() {
    const treatmentPlanType = document.getElementById('treatment-plan-type');
    const treatmentPlanDetails = document.getElementById('treatment-plan-details');
    
    // Show/hide treatment plan details based on type
    if (treatmentPlanType && treatmentPlanDetails) {
        treatmentPlanType.addEventListener('change', function() {
            if (this.value) {
                treatmentPlanDetails.style.display = 'block';
            } else {
                treatmentPlanDetails.style.display = 'none';
            }
        });
    }
}

// Navigate to next consultation tab
window.navigateToNextConsultationTab = function(tabId) {
    if (window.switchTab) {
        window.switchTab('consultation-tabs-container', tabId);
    }
};

// Make functions available globally
window.initConsultationTabs = initConsultationTabs;

