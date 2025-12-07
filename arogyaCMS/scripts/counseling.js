/**
 * Counseling - Treatment & Payment Plan JavaScript
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize tabs first
    if (typeof initCounselingTabs === 'function') {
        initCounselingTabs();
    }
    
    // Load today's appointments on page load (will be called from tabs initialization)
    // await loadTodayAppointments(); // Moved to tabs initialization
    
    // Patient selection is now done from appointments tab - removed patient-select tab
    // Patient summary tab has been removed
    
    // Form submission handler
    window.handleCounselingFormSubmit = async function() {
        // Get patient ID from global variable (set when patient is selected from appointments)
        const patientId = window.currentCounselingPatientId;
        
        if (!patientId) {
            showNotification('Please select a patient from the Appointments tab first', 'error');
            // Switch back to appointments tab
            if (window.switchTab) {
                window.switchTab('counseling-tabs-container', 'appointments');
            }
            return;
        }
        
        // Collect form data from tabs
        const counselingData = {
            patientId: patientId,
            treatmentOptions: document.getElementById('treatment-options')?.value || '',
            patientConcerns: document.getElementById('patient-concerns')?.value || '',
            counselorRecommendations: document.getElementById('counselor-recommendations')?.value || '',
            estimatedCost: document.getElementById('estimated-cost')?.value || '',
            paymentPlanType: document.getElementById('payment-plan-type')?.value || '',
            installmentAmount: document.getElementById('installment-amount')?.value || '',
            installmentCount: document.getElementById('installment-count')?.value || '',
            paymentDiscussion: document.getElementById('payment-discussion')?.value || '',
            paymentStatus: document.getElementById('payment-status')?.value || '',
            counselingNotes: document.getElementById('counseling-notes')?.value || '',
            counselingDate: new Date().toISOString(),
            status: 'counseling_complete'
        };
        
        // Store counseling data using database
        const existingPatient = await db.getPatient(patientId);
        const updatedPatient = { 
            ...existingPatient, 
            ...counselingData,
            status: 'counseling_complete' // Update status to counseling_complete
        };
        await db.savePatient(updatedPatient);
        
        // Add timeline entry
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        await db.addTimelineEntry(patientId, 'Counseling', 'completed', counselingData.counselingNotes || '', currentUser?.name || '');
        
        showNotification('Counseling completed successfully! Patient routed to doctor consultation.', 'success');
        
        // Redirect to doctor consultation after a delay
        setTimeout(() => {
            window.location.href = 'consultation.html';
        }, 1500);
    };
});

