/**
 * Patient Summary Card JavaScript
 */

// Get current user role
function getCurrentUserRole() {
    const userStr = sessionStorage.getItem('currentUser');
    if (userStr) {
        const user = JSON.parse(userStr);
        return user.role || 'reception';
    }
    return 'reception';
}

document.addEventListener('DOMContentLoaded', function() {
    const patientSelect = document.getElementById('summary-patient-select');
    const finalizeBtn = document.getElementById('finalize-treatment-plan');
    const userRole = getCurrentUserRole();
    
    // For reception role, show simplified view
    if (userRole === 'reception') {
        setupReceptionView();
    }
    
    // Load patients into dropdown
    async function loadPatients() {
        const patients = await db.getPatients();
        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.patientId;
            option.textContent = `${patient.patientId} - ${patient.name}`;
            patientSelect.appendChild(option);
        });
        
        // Check URL parameter for patient ID
        const urlParams = new URLSearchParams(window.location.search);
        const patientIdFromUrl = urlParams.get('patientId');
        
        if (patientIdFromUrl) {
            patientSelect.value = patientIdFromUrl;
            loadPatientSummary(patientIdFromUrl);
        } else {
            // Load last patient if available
            const lastPatientId = localStorage.getItem('lastPatientId');
            if (lastPatientId) {
                patientSelect.value = lastPatientId;
                loadPatientSummary(lastPatientId);
            }
        }
    }
    
    // Initialize
    loadPatients();
    
    // Initialize timeline
    patientTimeline = new PatientTimeline('patient-timeline-container');
    
    // Setup reception view (simplified)
    function setupReceptionView() {
        // Hide elements not needed for reception
        const elementsToHide = [
            '.summary-block:has(.fa-diagnoses)', // Final Diagnosis
            '.summary-block:has(.fa-sticky-note)', // Clinical Notes
            '.test-results-block', // Test Results
            '.summary-block:has(.fa-pills)', // Prescribed Medications
            '.summary-block:has(.fa-clipboard-list)', // Treatment Plan
            '.summary-actions button:not(.btn-secondary:has(.fa-print))' // Action buttons except print
        ];
        
        // Hide complex sections
        document.querySelectorAll('.summary-block').forEach(block => {
            const header = block.querySelector('.block-header h3');
            if (header) {
                const text = header.textContent.toLowerCase();
                if (text.includes('diagnosis') || 
                    text.includes('clinical notes') || 
                    text.includes('test results') || 
                    text.includes('medications') || 
                    text.includes('treatment plan')) {
                    block.style.display = 'none';
                }
            }
        });
        
        // Hide action buttons except print
        const actionButtons = document.querySelectorAll('.summary-actions button');
        actionButtons.forEach(btn => {
            if (!btn.querySelector('.fa-print')) {
                btn.style.display = 'none';
            }
        });
        
        // Update page subtitle
        const subtitle = document.querySelector('.page-subtitle');
        if (subtitle) {
            subtitle.textContent = 'View patient registration details and visit history';
        }
    }
    
    // Load patient data
    async function loadPatientSummary(patientId) {
        const patientData = await db.getPatient(patientId);
        
        if (!patientData) {
            showNotification('No patient data found', 'error');
            return;
        }
        
        // Update patient information
        updatePatientInfo(patientData);
        
        // For reception role, only show registration details and visit logs
        if (userRole === 'reception') {
            updateRegistrationDetails(patientData);
            await updateVisitLogs(patientId);
        } else {
            // For other roles, show full summary
            updateComplaintAndDiagnosis(patientData);
            updateTestResults(patientData);
            updatePrescriptions(patientData);
            
            // Load treatment plans
            const treatmentPlans = await db.getTreatmentPlans(patientId);
            if (treatmentPlans.length > 0) {
                updateTreatmentPlanDisplay(treatmentPlans[treatmentPlans.length - 1]);
            } else {
                const planStatus = document.querySelector('.plan-status .status-badge');
                const planNote = document.querySelector('.plan-note');
                if (planStatus) {
                    planStatus.textContent = 'No Plan';
                    planStatus.className = 'status-badge pending';
                }
                if (planNote) {
                    planNote.textContent = 'No treatment plan created yet.';
                }
            }
        }
        
        // Render timeline
        if (patientTimeline) {
            await patientTimeline.render(patientId);
        }
    }
    
    // Update registration details for reception view
    function updateRegistrationDetails(data) {
        // Update complaint section to show registration info
        const complaintText = document.querySelector('.complaint-text');
        const complaintDetails = document.querySelector('.complaint-details');
        
        if (complaintText) {
            const header = complaintText.closest('.summary-block')?.querySelector('.block-header h3');
            if (header) header.textContent = 'Registration Details';
        }
        
        if (complaintText && data.primaryComplaint) {
            complaintText.textContent = data.primaryComplaint || 'Not specified';
        }
        if (complaintDetails) {
            let details = [];
            if (data.dateOfBirth) {
                const age = calculateAge(data.dateOfBirth);
                details.push(`Date of Birth: ${formatDate(data.dateOfBirth)}${age ? ` (Age: ${age} years)` : ''}`);
            }
            if (data.phone) details.push(`Phone: ${data.phone}`);
            if (data.registrationDate) details.push(`Registration Date: ${formatDate(data.registrationDate)}`);
            if (data.status) details.push(`Status: ${data.status}`);
            complaintDetails.innerHTML = details.join('<br>') || 'No additional details available.';
        }
    }
    
    // Update visit logs (appointments)
    async function updateVisitLogs(patientId) {
        try {
            const appointments = await db.getAppointments();
            const patientAppointments = appointments.filter(apt => apt.patientId === patientId);
            
            // Find or create visit logs section
            let visitLogsBlock = document.querySelector('.visit-logs-block');
            if (!visitLogsBlock) {
                // Create visit logs block
                const rightColumn = document.querySelector('.summary-column:last-child');
                if (rightColumn) {
                    visitLogsBlock = document.createElement('div');
                    visitLogsBlock.className = 'summary-block visit-logs-block';
                    visitLogsBlock.innerHTML = `
                        <div class="block-header">
                            <i class="fas fa-history"></i>
                            <h3>Visit History</h3>
                        </div>
                        <div class="block-content">
                            <div class="visit-logs-list" id="visit-logs-list"></div>
                        </div>
                    `;
                    rightColumn.insertBefore(visitLogsBlock, rightColumn.firstChild);
                }
            }
            
            const visitLogsList = document.getElementById('visit-logs-list');
            if (visitLogsList) {
                if (patientAppointments.length === 0) {
                    visitLogsList.innerHTML = '<p style="color: var(--text-light);">No visits recorded yet.</p>';
                } else {
                    visitLogsList.innerHTML = '';
                    // Sort by date (newest first)
                    patientAppointments.sort((a, b) => {
                        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
                        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
                        return dateB - dateA;
                    });
                    
                    patientAppointments.forEach(apt => {
                        const logItem = document.createElement('div');
                        logItem.className = 'visit-log-item';
                        logItem.style.cssText = 'padding: 12px; border-bottom: 1px solid var(--border-color);';
                        
                        const date = formatDate(apt.date);
                        const time = apt.time ? formatTime(apt.time) : '';
                        const statusBadge = getAppointmentStatusBadge(apt.status);
                        
                        logItem.innerHTML = `
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                <div>
                                    <strong style="color: var(--primary-accent);">${date}</strong>
                                    ${time ? `<span style="color: var(--text-light); margin-left: 8px;">${time}</span>` : ''}
                                </div>
                                ${statusBadge}
                            </div>
                            <div style="color: var(--text-dark);">
                                <strong>Type:</strong> ${apt.type || 'Consultation'}
                            </div>
                            ${apt.notes ? `<div style="color: var(--text-light); font-size: 12px; margin-top: 4px;">${apt.notes}</div>` : ''}
                        `;
                        visitLogsList.appendChild(logItem);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading visit logs:', error);
        }
    }
    
    // Format date helper
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (e) {
            return dateString;
        }
    }
    
    // Format time helper
    function formatTime(timeString) {
        if (!timeString) return '';
        try {
            const [hours, minutes] = timeString.split(':');
            const hour12 = parseInt(hours) % 12 || 12;
            const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
            return `${hour12}:${minutes} ${ampm}`;
        } catch (e) {
            return timeString;
        }
    }
    
    // Get appointment status badge
    function getAppointmentStatusBadge(status) {
        const badges = {
            'scheduled': '<span class="badge badge-new">Scheduled</span>',
            'confirmed': '<span class="badge badge-checked-in">Confirmed</span>',
            'completed': '<span class="badge badge-paid">Completed</span>',
            'cancelled': '<span class="badge" style="background: #fee; color: #c00;">Cancelled</span>',
            'pending': '<span class="badge badge-checked-in">Pending</span>'
        };
        return badges[status] || `<span class="badge">${status || 'Scheduled'}</span>`;
    }
    
    // Update patient information
    function updatePatientInfo(data) {
        const nameEl = document.querySelector('.patient-details h2');
        const idBadge = document.querySelector('.patient-id-badge');
        const ageEl = document.querySelector('.patient-age');
        const phoneEl = document.querySelector('.patient-phone');
        
        if (nameEl && data.name) nameEl.textContent = data.name;
        if (idBadge && data.patientId) idBadge.textContent = data.patientId;
        if (ageEl && data.dateOfBirth) {
            const age = calculateAge(data.dateOfBirth);
            if (age !== null) ageEl.textContent = `Age: ${age} years`;
        }
        if (phoneEl && data.phone) {
            phoneEl.innerHTML = `<i class="fas fa-phone"></i> ${data.phone}`;
        }
    }
    
    // Update complaint and diagnosis
    function updateComplaintAndDiagnosis(data) {
        const complaintText = document.querySelector('.complaint-text');
        const complaintDetails = document.querySelector('.complaint-details');
        const primaryDiagnosis = document.querySelector('.diagnosis-item.primary .diagnosis-value');
        const secondaryDiagnosis = document.querySelector('.diagnosis-item.secondary .diagnosis-value');
        
        if (complaintText && data.primaryComplaint) {
            complaintText.textContent = data.primaryComplaint;
        }
        if (complaintDetails && data.complaintNotes) {
            complaintDetails.textContent = data.complaintNotes;
        }
        if (primaryDiagnosis && data.diagnosis) {
            primaryDiagnosis.textContent = data.diagnosis;
        }
        if (secondaryDiagnosis && data.secondaryDiagnosis) {
            secondaryDiagnosis.textContent = data.secondaryDiagnosis;
        }
    }
    
    // Update test results
    function updateTestResults(data) {
        const pendingStatus = document.querySelector('.test-status.pending');
        const readyStatus = document.querySelector('.test-status.ready');
        const testList = document.querySelector('.test-list');
        
        const labTests = data.labTests || [];
        const scans = data.scans || [];
        
        // For demo, we'll show some tests as pending
        // In a real app, this would check actual test result status
        if (testList && (labTests.length > 0 || scans.length > 0)) {
            testList.innerHTML = '';
            
            labTests.forEach(test => {
                const testItem = document.createElement('div');
                testItem.className = 'test-item';
                testItem.innerHTML = `
                    <i class="fas fa-clock"></i>
                    <span>${getTestName(test)} - Pending</span>
                `;
                testList.appendChild(testItem);
            });
            
            scans.forEach(scan => {
                const testItem = document.createElement('div');
                testItem.className = 'test-item';
                testItem.innerHTML = `
                    <i class="fas fa-clock"></i>
                    <span>${getScanName(scan)} - Pending</span>
                `;
                testList.appendChild(testItem);
            });
        }
    }
    
    // Get test name
    function getTestName(test) {
        const testNames = {
            'cbc': 'CBC (Complete Blood Count)',
            'lipid': 'Lipid Profile',
            'liver': 'Liver Function Test',
            'kidney': 'Kidney Function Test',
            'blood-sugar': 'Blood Sugar (Fasting & PP)'
        };
        return testNames[test] || test;
    }
    
    // Get scan name
    function getScanName(scan) {
        const scanNames = {
            'xray': 'X-Ray',
            'ct': 'CT Scan',
            'mri': 'MRI',
            'ultrasound': 'Ultrasound'
        };
        return scanNames[scan] || scan;
    }
    
    // Update prescriptions
    function updatePrescriptions(data) {
        const medicationList = document.querySelector('.medication-list');
        
        if (medicationList && data.prescriptions && data.prescriptions.length > 0) {
            medicationList.innerHTML = '';
            
            data.prescriptions.forEach(prescription => {
                const medItem = document.createElement('div');
                medItem.className = 'med-item-summary';
                medItem.innerHTML = `
                    <strong>${prescription.drugName}</strong>
                    <span>${prescription.dosage} - ${prescription.frequency}${prescription.instructions ? ' (' + prescription.instructions + ')' : ''}</span>
                `;
                medicationList.appendChild(medItem);
            });
        }
    }
    
    // Update treatment plan display
    function updateTreatmentPlanDisplay(plan) {
        const planStatus = document.querySelector('.plan-status .status-badge');
        const planNote = document.querySelector('.plan-note');
        
        if (plan) {
            if (planStatus) {
                planStatus.textContent = plan.status.charAt(0).toUpperCase() + plan.status.slice(1);
                planStatus.className = `status-badge ${plan.status === 'active' ? 'completed' : 'pending'}`;
            }
            if (planNote) {
                planNote.textContent = plan.notes || `Treatment plan: ${plan.planName}. Start date: ${plan.startDate}`;
            }
        }
    }
    
    // Patient selection change
    if (patientSelect) {
        patientSelect.addEventListener('change', function() {
            if (this.value) {
                loadPatientSummary(this.value);
            }
        });
    }
    
    // Finalize treatment plan (only for non-reception roles)
    if (finalizeBtn && userRole !== 'reception') {
        finalizeBtn.addEventListener('click', async function() {
            if (!patientSelect || !patientSelect.value) {
                showNotification('Please select a patient', 'error');
                return;
            }
            
            const patientId = patientSelect.value;
            const treatmentPlans = await db.getTreatmentPlans(patientId);
            
            if (treatmentPlans.length === 0) {
                showNotification('No treatment plan found. Please create a treatment plan first.', 'error');
                return;
            }
            
            // Update treatment plan status
            const latestPlan = treatmentPlans[treatmentPlans.length - 1];
            await db.updateTreatmentPlan(latestPlan.id, {
                status: 'active',
                finalizedDate: new Date().toISOString()
            });
            
            // Reload patient summary to show updated plan
            loadPatientSummary(patientId);
            
            showNotification('Treatment plan activated successfully!', 'success');
            
            // Disable button after finalization
            finalizeBtn.disabled = true;
            finalizeBtn.style.opacity = '0.6';
            finalizeBtn.style.cursor = 'not-allowed';
        });
    }
});

