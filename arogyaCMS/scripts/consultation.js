/**
 * Consultation & Prescription Form JavaScript
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize tabs first
    if (typeof initConsultationTabs === 'function') {
        initConsultationTabs();
    }
    
    // Load today's appointments on page load (will be called from tabs initialization)
    // await loadTodayAppointments(); // Moved to tabs initialization
    
    let prescriptionCount = 0;
    
    // Load patient data - make it globally available
    window.loadPatientData = async function(patientId) {
        try {
            console.log('Loading patient data for:', patientId);
            const patientData = await db.getPatient(patientId);
            
            if (!patientData) {
                console.error('Patient data not found for:', patientId);
                return;
            }
            
            console.log('Patient data loaded:', patientData);
            
            // Wait for tab elements to be available, then update patient information
            const updatePatientInfo = () => {
                const summaryName = document.getElementById('summary-patient-name');
                const summaryId = document.getElementById('summary-patient-id');
                const summaryComplaint = document.getElementById('summary-complaint');
                const summaryPastConditions = document.getElementById('summary-past-conditions');
                const summaryAllergies = document.getElementById('summary-allergies');
                const summaryMedications = document.getElementById('summary-medications');
                const summaryPaymentPlan = document.getElementById('summary-payment-plan');
                const summaryEstimatedCost = document.getElementById('summary-estimated-cost');
                const summaryDocuments = document.getElementById('summary-documents');
                
                console.log('Summary elements found:', {
                    summaryName: !!summaryName,
                    summaryId: !!summaryId,
                    summaryComplaint: !!summaryComplaint
                });
                
                if (summaryName) {
                    summaryName.textContent = patientData.name || '-';
                    console.log('Set patient name to:', patientData.name);
                } else {
                    console.error('summary-patient-name element not found');
                }
                
                if (summaryId) summaryId.textContent = patientData.patientId || '-';
                if (summaryComplaint) summaryComplaint.textContent = patientData.primaryComplaint || '-';
                
                // Load nursing data
                if (patientData.pastConditions || patientData.knownAllergies) {
                    if (summaryPastConditions) summaryPastConditions.textContent = patientData.pastConditions || '-';
                    if (summaryAllergies) summaryAllergies.textContent = patientData.knownAllergies || '-';
                    
                    // Update medications
                    if (summaryMedications) {
                        if (patientData.medications && patientData.medications.length > 0) {
                            // Parse medications if it's a string
                            let medications = patientData.medications;
                            if (typeof medications === 'string') {
                                try {
                                    medications = JSON.parse(medications);
                                } catch (e) {
                                    medications = [];
                                }
                            }
                            
                            summaryMedications.innerHTML = '';
                            medications.forEach(med => {
                                const medItem = document.createElement('div');
                                medItem.className = 'med-item';
                                medItem.innerHTML = `<strong>${med.name}</strong> - ${med.dosage}, ${med.frequency}`;
                                summaryMedications.appendChild(medItem);
                            });
                        } else {
                            summaryMedications.innerHTML = '<div class="med-item">No medications recorded</div>';
                        }
                    }
                    
                    // Update documents
                    if (summaryDocuments) {
                        if (patientData.documents && patientData.documents.length > 0) {
                            // Parse documents if it's a string
                            let documents = patientData.documents;
                            if (typeof documents === 'string') {
                                try {
                                    documents = JSON.parse(documents);
                                } catch (e) {
                                    documents = [];
                                }
                            }
                            
                            summaryDocuments.innerHTML = '';
                            documents.forEach(doc => {
                                const docItem = document.createElement('div');
                                docItem.className = 'doc-item';
                                const icon = doc.type === 'application/pdf' ? 'fa-file-pdf' : 'fa-file-image';
                                docItem.innerHTML = `<i class="fas ${icon}"></i><span>${doc.name}</span>`;
                                summaryDocuments.appendChild(docItem);
                            });
                        } else {
                            summaryDocuments.innerHTML = '<div class="doc-item">No documents uploaded</div>';
                        }
                    }
                } else {
                    // Set defaults if no nursing data
                    if (summaryPastConditions) summaryPastConditions.textContent = '-';
                    if (summaryAllergies) summaryAllergies.textContent = '-';
                    if (summaryMedications) summaryMedications.innerHTML = '<div class="med-item">No medications recorded</div>';
                    if (summaryDocuments) summaryDocuments.innerHTML = '<div class="doc-item">No documents uploaded</div>';
                }
                
                // Load counseling data
                if (patientData.paymentPlanType || patientData.estimatedCost) {
                    if (summaryPaymentPlan) {
                        const planType = patientData.paymentPlanType || '-';
                        summaryPaymentPlan.textContent = planType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '-';
                    }
                    if (summaryEstimatedCost) {
                        const cost = patientData.estimatedCost;
                        summaryEstimatedCost.textContent = cost ? `₹${parseFloat(cost).toLocaleString('en-IN')}` : '-';
                    }
                } else {
                    // Set defaults if no counseling data
                    if (summaryPaymentPlan) summaryPaymentPlan.textContent = '-';
                    if (summaryEstimatedCost) summaryEstimatedCost.textContent = '-';
                }
            };
            
            // Try to update immediately, if elements not found, retry after delay
            updatePatientInfo();
            
            // If elements not found, retry after a delay (for tab rendering)
            if (!document.getElementById('summary-patient-name')) {
                setTimeout(updatePatientInfo, 300);
            }
        } catch (error) {
            console.error('Error loading patient data:', error);
            showNotification('Error loading patient data: ' + error.message, 'error');
        }
    };
    
    // Patient selection is now done from appointments tab - removed patient-select dropdown
    
    // Initialize prescription handlers after tabs are ready
    setTimeout(() => {
        const addPrescriptionBtn = document.getElementById('add-prescription-item');
        const prescriptionItems = document.getElementById('prescription-items');
        
        // Add prescription item
        if (addPrescriptionBtn && prescriptionItems) {
            addPrescriptionBtn.addEventListener('click', function() {
                prescriptionCount++;
                const prescriptionItem = createPrescriptionItem(prescriptionCount);
                prescriptionItems.appendChild(prescriptionItem);
            });
        }
    }, 200);
    
    // Remove prescription item
    function removePrescriptionItem(id) {
        const item = document.getElementById(`prescription-${id}`);
        if (item) {
            item.remove();
        }
    }
    
    // Create prescription item HTML
    function createPrescriptionItem(id) {
        const div = document.createElement('div');
        div.className = 'prescription-item';
        div.id = `prescription-${id}`;
        div.innerHTML = `
            <div class="prescription-item-header">
                <h4>Medication ${id}</h4>
                <button type="button" class="btn-icon" onclick="removePrescriptionItem(${id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="prescription-item-fields">
                <div class="form-group">
                    <label>Drug Name</label>
                    <input type="text" name="drugName_${id}" 
                           placeholder="Enter drug name" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Dosage</label>
                    <input type="text" name="dosage_${id}" 
                           placeholder="e.g., 500mg" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Frequency</label>
                    <input type="text" name="frequency_${id}" 
                           placeholder="e.g., Twice daily" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Instructions</label>
                    <input type="text" name="instructions_${id}" 
                           placeholder="e.g., After meals" class="form-input">
                </div>
            </div>
        `;
        return div;
    }
    
    // Make removePrescriptionItem available globally
    window.removePrescriptionItem = removePrescriptionItem;
    
    // Form submission handler - make it globally available
    window.handleConsultationFormSubmit = async function() {
        // Get patient ID from global variable (set when patient is selected from appointments)
        const patientId = window.currentConsultationPatientId;
        
        if (!patientId) {
            showNotification('Please select a patient from the Appointments tab first', 'error');
            // Switch back to appointments tab
            if (window.switchTab) {
                window.switchTab('consultation-tabs-container', 'appointments');
            }
            return;
        }
        
        // Validate required fields
        const diagnosis = document.getElementById('diagnosis')?.value;
        if (!diagnosis) {
            showNotification('Please enter a diagnosis', 'error');
            if (window.switchTab) {
                window.switchTab('consultation-tabs-container', 'diagnosis');
            }
            return;
        }
        
        // Collect form data
        const prescriptions = collectPrescriptions();
        
        // Collect test orders
        const labTests = [];
        const scans = [];
        document.querySelectorAll('input[name="labTests"]:checked').forEach(cb => labTests.push(cb.value));
        document.querySelectorAll('input[name="scans"]:checked').forEach(cb => scans.push(cb.value));
        
        const consultationData = {
            patientId: patientId,
            diagnosis: diagnosis,
            secondaryDiagnosis: document.getElementById('secondary-diagnosis')?.value || '',
            observations: document.getElementById('observations')?.value || '',
            recommendations: document.getElementById('recommendations')?.value || '',
            prescriptions: prescriptions,
            labTests: labTests,
            scans: scans,
            customTests: document.getElementById('custom-tests')?.value || '',
            treatmentPlanType: document.getElementById('treatment-plan-type')?.value || '',
            treatmentPlanName: document.getElementById('treatment-plan-name')?.value || '',
            treatmentPlanDescription: document.getElementById('treatment-plan-description')?.value || '',
            treatmentPlanStartDate: document.getElementById('treatment-plan-start-date')?.value || '',
            treatmentPlanDuration: document.getElementById('treatment-plan-duration')?.value || '',
            treatmentPlanPhases: document.getElementById('treatment-plan-phases')?.value || '',
            consultationDate: new Date().toISOString(),
            status: 'consultation_complete',
            secondVisitScheduled: false
        };
        
        // Get current user first (needed for treatment plan and timeline)
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        
        // Store consultation data using database
        const existingPatient = await db.getPatient(patientId);
        const updatedPatient = { 
            ...existingPatient, 
            ...consultationData,
            status: 'consultation_complete'
        };
        await db.savePatient(updatedPatient);
        
        // Save treatment plan as separate record if treatment plan data exists
        if (consultationData.treatmentPlanType && consultationData.treatmentPlanType !== '') {
            try {
                console.log('Saving treatment plan for patient:', patientId);
                console.log('Treatment plan type:', consultationData.treatmentPlanType);
                
                // Get treatment templates to find template ID
                const templates = db.getTreatmentTemplates();
                let templateId = null;
                
                if (consultationData.treatmentPlanType === 'ivf') {
                    templateId = 'ivf_standard';
                } else if (consultationData.treatmentPlanType === 'iui') {
                    templateId = 'iui_standard';
                }
                
                // Parse phases if provided as text
                let phases = [];
                if (consultationData.treatmentPlanPhases) {
                    // If phases are provided as text, try to parse or create a simple phase structure
                    phases = [{
                        phase: 'Treatment Plan',
                        steps: consultationData.treatmentPlanDescription || consultationData.treatmentPlanPhases,
                        duration: consultationData.treatmentPlanDuration ? `${consultationData.treatmentPlanDuration} days` : 'TBD',
                        startTime: consultationData.treatmentPlanStartDate || 'To be determined'
                    }];
                } else if (templateId) {
                    // Use template phases if available
                    const template = templates.find(t => t.id === templateId);
                    if (template && template.phases) {
                        phases = template.phases;
                    }
                }
                
                const planData = {
                    patientId: patientId,
                    templateId: templateId || 'custom',
                    planName: consultationData.treatmentPlanName || `${consultationData.treatmentPlanType.toUpperCase()} Treatment Plan`,
                    startDate: consultationData.treatmentPlanStartDate || new Date().toISOString().split('T')[0],
                    phases: phases,
                    notes: consultationData.treatmentPlanDescription || '',
                    status: 'active',
                    createdBy: currentUser?.id || currentUser?.name || 'doctor'
                };
                
                console.log('Treatment plan data to save:', planData);
                
                const savedPlan = await db.saveTreatmentPlan(planData);
                if (savedPlan) {
                    console.log('✅ Treatment plan saved successfully:', savedPlan);
                    console.log('Plan ID:', savedPlan.id);
                    console.log('Plan Name:', savedPlan.planName);
                    console.log('Patient ID:', savedPlan.patientId);
                    showNotification('Treatment plan created successfully!', 'success');
                } else {
                    console.error('❌ Failed to save treatment plan - returned null');
                    showNotification('Warning: Treatment plan may not have been saved. Please check.', 'warning');
                }
            } catch (error) {
                console.error('Error saving treatment plan:', error);
                console.error('Error stack:', error.stack);
                showNotification('Error saving treatment plan: ' + error.message, 'error');
                // Don't block the consultation save if treatment plan save fails
            }
        } else {
            console.log('No treatment plan type selected, skipping plan creation');
        }
        
        // Add timeline entry
        await db.addTimelineEntry(patientId, 'Consultation', 'completed', consultationData.observations || '', currentUser?.name || '');
        
        showNotification('Consultation saved successfully! Treatment plan created.', 'success');
        
        // Redirect to treatment plan
        setTimeout(() => {
            window.location.href = 'treatment-plan.html';
        }, 1500);
    };
    
    // Collect prescriptions from form
    function collectPrescriptions() {
        const prescriptions = [];
        const prescriptionItems = document.getElementById('prescription-items');
        if (!prescriptionItems) return prescriptions;
        
        const prescriptionItemsList = prescriptionItems.querySelectorAll('.prescription-item');
        
        prescriptionItemsList.forEach(item => {
            const drugName = item.querySelector('input[placeholder="Enter drug name"]')?.value;
            const dosage = item.querySelector('input[placeholder="e.g., 500mg"]')?.value;
            const frequency = item.querySelector('input[placeholder="e.g., Twice daily"]')?.value;
            const instructions = item.querySelector('input[placeholder="e.g., After meals"]')?.value;
            
            if (drugName && dosage && frequency) {
                prescriptions.push({
                    drugName,
                    dosage,
                    frequency,
                    instructions: instructions || ''
                });
            }
        });
        
        return prescriptions;
    }
});
