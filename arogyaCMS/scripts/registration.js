/**
 * Registration Form JavaScript
 */

// Get current user function (from auth.js)
function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registration-form');
    const markFeePaidBtn = document.getElementById('mark-fee-paid');
    const feeStatus = document.getElementById('fee-status');
    const patientIdCard = document.getElementById('patient-id-card');
    const generatedPatientId = document.getElementById('generated-patient-id');
    
    // Handle fee payment
    if (markFeePaidBtn) {
        markFeePaidBtn.addEventListener('click', async function() {
            // Validate form first
            if (!validateForm('registration-form')) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Mark fee as paid
            feeStatus.innerHTML = '<i class="fas fa-check-circle"></i><span>Paid</span>';
            feeStatus.classList.add('paid');
            markFeePaidBtn.disabled = true;
            markFeePaidBtn.style.opacity = '0.6';
            markFeePaidBtn.style.cursor = 'not-allowed';
            
            // Generate Patient ID
            const patientId = generatePatientID();
            generatedPatientId.textContent = patientId;
            
            // Show Patient ID card
            patientIdCard.style.display = 'block';
            patientIdCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Check if current user has access to nursing page
            const currentUser = getCurrentUser();
            const proceedToNursingBtn = document.getElementById('proceed-to-nursing-btn');
            if (proceedToNursingBtn && currentUser) {
                // Show button only for nurse, doctor, or admin roles
                const hasNursingAccess = ['nurse', 'doctor', 'admin'].includes(currentUser.role);
                if (hasNursingAccess) {
                    proceedToNursingBtn.style.display = 'inline-block';
                }
            }
            
            // Show success notification
            showNotification('Registration fee paid and Patient ID generated successfully!', 'success');
            
            // Store patient data using database
            const formData = new FormData(registrationForm);
            const patientData = {
                patientId: patientId,
                name: formData.get('patientName'),
                phone: formData.get('phoneNumber'),
                dateOfBirth: formData.get('dateOfBirth'),
                primaryComplaint: formData.get('primaryComplaint'),
                complaintNotes: formData.get('complaintNotes'),
                registrationDate: new Date().toISOString(),
                feePaid: true,
                status: 'registered'
            };
            
            // Save to database via API
            const savedPatient = await db.savePatient(patientData);
            
            if (!savedPatient) {
                showNotification('Failed to save patient. Please try again.', 'error');
                return;
            }
            
            localStorage.setItem('lastPatientId', patientId);
            
            // Add timeline entry
            try {
                await db.addTimelineEntry(patientId, 'Registration', 'completed', '', getCurrentUser()?.name || '');
            } catch (err) {
                console.warn('Failed to add timeline entry:', err);
            }
            
            // Create appointment
            try {
                const appointment = await db.saveAppointment({
                    patientId: patientId,
                    patientName: patientData.name,
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    status: 'registered',
                    type: 'new'
                });
                console.log('Appointment created:', appointment);
            } catch (err) {
                console.error('Failed to create appointment:', err);
                showNotification('Patient saved but appointment creation failed', 'warning');
            }
            
            // Refresh dashboard if on index page
            if (window.location.pathname.includes('index.html')) {
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                // If not on dashboard, show message to refresh
                showNotification('Patient registered! Refresh dashboard to see the new patient.', 'success');
            }
        });
    }
    
    // Format phone number input
    const phoneInput = document.getElementById('phone-number');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);
            if (value.length > 0 && !value.startsWith('+91')) {
                e.target.value = formatPhoneNumber(value);
            }
        });
    }
    
    // Prevent form submission on Enter key in non-submit fields
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
        });
    }
});

