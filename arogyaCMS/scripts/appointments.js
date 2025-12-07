/**
 * Appointments Page JavaScript
 * Handles patient lookup and appointment booking
 */

let currentPatient = null;
let lastSearchTerm = ''; // Store last search term for refreshing table

document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date to today
    const dateInput = document.getElementById('appointment-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
        dateInput.value = today;
    }

    // Set default time to current time + 1 hour
    const timeInput = document.getElementById('appointment-time');
    if (timeInput) {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }

    // Patient lookup form
    const lookupForm = document.getElementById('patient-lookup-form');
    if (lookupForm) {
        lookupForm.addEventListener('submit', handlePatientLookup);
    }

    // Appointment booking form
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentBooking);
    }
});

/**
 * Handle patient lookup
 */
async function handlePatientLookup(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const searchTerm = formData.get('patientId').trim();
    
    if (!searchTerm) {
        showNotification('Please enter a Patient ID or Phone Number', 'error');
        return;
    }

    // Store search term for refreshing
    lastSearchTerm = searchTerm;

    try {
        showNotification('Searching for patient...', 'info');
        
        // Hide all cards first
        const notFoundCard = document.getElementById('patient-not-found-card');
        const tableCard = document.getElementById('patients-table-card');
        
        if (notFoundCard) notFoundCard.style.display = 'none';
        if (tableCard) tableCard.style.display = 'none';
        
        // Clear current patient
        currentPatient = null;
        
        // Try to find patient by ID or phone
        const patients = await db.getPatients();
        console.log('Total patients in database:', patients ? patients.length : 0);
        console.log('Search term:', searchTerm);
        
        if (!patients || patients.length === 0) {
            console.log('No patients found in database');
            if (notFoundCard) notFoundCard.style.display = 'block';
            showNotification('No patients found in database. Please register a patient first.', 'warning');
            return;
        }

        let patient = null;

        // First try by Patient ID (exact match, case-insensitive)
        patient = patients.find(p => {
            if (!p || !p.patientId) return false;
            return p.patientId.toLowerCase().trim() === searchTerm.toLowerCase().trim();
        });
        
        console.log('Patient found by ID:', patient ? patient.patientId : 'none');

        // If not found, try by phone number (EXACT MATCH ONLY)
        if (!patient) {
            // Try direct string match (case-insensitive, trimmed)
            const searchTermTrimmed = searchTerm.trim();
            console.log('Trying exact phone match for:', searchTermTrimmed);
            
            patient = patients.find(p => {
                if (!p || !p.phone) return false;
                const patientPhoneStr = String(p.phone).trim();
                // Exact string match (case-insensitive)
                if (patientPhoneStr.toLowerCase() === searchTermTrimmed.toLowerCase()) {
                    console.log('✅ Exact phone match:', patientPhoneStr, '===', searchTermTrimmed);
                    return true;
                }
                return false;
            });
            
            // If direct match failed, try normalized phone search (digits only, exact match)
            if (!patient) {
                // Normalize search term: remove all non-digits and trim
                const phoneSearch = searchTerm.replace(/\D/g, '').trim();
                console.log('Searching by normalized phone (exact match only), search term:', phoneSearch);
                
                if (phoneSearch.length > 0) {
                    patient = patients.find(p => {
                        if (!p || !p.phone) return false;
                        
                        // Normalize patient phone: convert to string, remove non-digits, trim
                        const patientPhoneStr = String(p.phone).trim();
                        const patientPhone = patientPhoneStr.replace(/\D/g, ''); // Remove all non-digits
                        
                        if (!patientPhone || patientPhone.length === 0) return false;
                        
                        // EXACT MATCH ONLY (no partial matching)
                        if (patientPhone === phoneSearch) {
                            console.log('✅ Exact normalized phone match:', patientPhone, '===', phoneSearch);
                            return true;
                        }
                        
                        return false;
                    });
                }
            }
            
            console.log('Patient found by phone:', patient ? (patient.patientId + ' - ' + patient.phone) : 'none');
        }

        // Find ALL matching patients (for table display)
        const matchingPatients = [];
        
        // Add patient found by ID
        if (patient && patient.patientId) {
            matchingPatients.push(patient);
        }
        
        // Also search for all patients matching the search term (for table)
        const allMatching = patients.filter(p => {
            if (!p) return false;
            
            // Match by Patient ID (exact, case-insensitive)
            if (p.patientId && p.patientId.toLowerCase().trim() === searchTerm.toLowerCase().trim()) {
                return true;
            }
            
            // Match by phone (exact only)
            if (p.phone) {
                const patientPhoneStr = String(p.phone).trim();
                const searchTermTrimmed = searchTerm.trim();
                
                // Direct string match
                if (patientPhoneStr.toLowerCase() === searchTermTrimmed.toLowerCase()) {
                    return true;
                }
                
                // Normalized exact match
                const phoneSearch = searchTerm.replace(/\D/g, '').trim();
                const patientPhone = patientPhoneStr.replace(/\D/g, '');
                if (phoneSearch.length > 0 && patientPhone === phoneSearch) {
                    return true;
                }
            }
            
            return false;
        });
        
        // Remove duplicates
        const uniquePatients = [];
        const seenIds = new Set();
        allMatching.forEach(p => {
            if (p && p.patientId && !seenIds.has(p.patientId)) {
                seenIds.add(p.patientId);
                uniquePatients.push(p);
            }
        });

        if (uniquePatients.length > 0) {
            // Patients found - show table
            console.log('Patients found:', uniquePatients.length);
            displayPatientsTable(uniquePatients);
            const tableCard = document.getElementById('patients-table-card');
            if (tableCard) {
                tableCard.style.display = 'block';
            }
            if (notFoundCard) {
                notFoundCard.style.display = 'none';
            }
            showNotification(`${uniquePatients.length} patient(s) found`, 'success');
        } else {
            // Patient not found - show registration option
            console.log('Patient not found for search term:', searchTerm);
            currentPatient = null;
            if (notFoundCard) {
                notFoundCard.style.display = 'block';
            }
            const tableCard = document.getElementById('patients-table-card');
            if (tableCard) {
                tableCard.style.display = 'none';
            }
            showNotification('Patient not found. Please register the patient first.', 'warning');
        }
    } catch (error) {
        console.error('Error looking up patient:', error);
        showNotification('Error searching for patient. Please try again.', 'error');
        // Clear patient and show not found card on error
        currentPatient = null;
        const notFoundCard = document.getElementById('patient-not-found-card');
        const appointmentCard = document.getElementById('appointment-form-card');
        if (notFoundCard) notFoundCard.style.display = 'block';
        if (appointmentCard) appointmentCard.style.display = 'none';
    }
}

/**
 * Display patients in table
 */
function displayPatientsTable(patients) {
    const tbody = document.getElementById('patients-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!patients || patients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No patients found</td></tr>';
        return;
    }
    
    patients.forEach(patient => {
        const row = document.createElement('tr');
        
        const status = patient.status || 'registered';
        const statusBadges = {
            'registered': '<span class="badge badge-new">Registered</span>',
            'appointment_scheduled': '<span class="badge badge-checked-in">Appointment Scheduled</span>',
            'nursing_complete': '<span class="badge badge-paid">Nursing Complete</span>',
            'counseling_complete': '<span class="badge badge-paid">Counseling Complete</span>',
            'consultation_complete': '<span class="badge badge-paid">Consultation Complete</span>'
        };
        const statusBadge = statusBadges[status] || `<span class="badge">${status}</span>`;
        
        row.innerHTML = `
            <td>${patient.patientId || '-'}</td>
            <td>${patient.name || '-'}</td>
            <td>${patient.phone || '-'}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="openAppointmentModal('${patient.patientId}')">
                    <i class="fas fa-calendar-plus"></i> Book Appointment
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Open appointment booking modal for a patient
 */
async function openAppointmentModal(patientId) {
    try {
        const patient = await db.getPatient(patientId);
        if (!patient) {
            showNotification('Patient not found', 'error');
            return;
        }
        
        currentPatient = patient;
        
        // Display patient info in modal
        document.getElementById('modal-patient-id').textContent = patient.patientId || '-';
        document.getElementById('modal-patient-name').textContent = patient.name || '-';
        document.getElementById('modal-patient-phone').textContent = patient.phone || '-';
        
        const status = patient.status || 'registered';
        const statusBadges = {
            'registered': '<span class="badge badge-new">Registered</span>',
            'appointment_scheduled': '<span class="badge badge-checked-in">Appointment Scheduled</span>',
            'nursing_complete': '<span class="badge badge-paid">Nursing Complete</span>',
            'counseling_complete': '<span class="badge badge-paid">Counseling Complete</span>',
            'consultation_complete': '<span class="badge badge-paid">Consultation Complete</span>'
        };
        const statusEl = document.getElementById('modal-patient-status');
        if (statusEl) {
            statusEl.innerHTML = statusBadges[status] || status;
        }
        
        // Set default date and time
        const dateInput = document.getElementById('appointment-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
            dateInput.setAttribute('min', today);
        }
        
        const timeInput = document.getElementById('appointment-time');
        if (timeInput) {
            const now = new Date();
            now.setHours(now.getHours() + 1);
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            timeInput.value = `${hours}:${minutes}`;
        }
        
        // Show modal
        const modal = document.getElementById('appointment-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error opening appointment modal:', error);
        showNotification('Error loading patient information', 'error');
    }
}

/**
 * Close appointment booking modal
 */
function closeAppointmentModal() {
    const modal = document.getElementById('appointment-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentPatient = null;
    
    // Reset form
    const form = document.getElementById('appointment-form');
    if (form) {
        form.reset();
    }
}

/**
 * Handle appointment booking
 */
async function handleAppointmentBooking(e) {
    e.preventDefault();
    
    // STRICT VALIDATION - Patient must exist and be verified
    if (!currentPatient || !currentPatient.patientId) {
        showNotification('Please select a valid patient first', 'error');
        return;
    }

    // Verify patient still exists in database before booking
    try {
        console.log('Verifying patient before booking:', currentPatient.patientId);
        const verifyPatient = await db.getPatient(currentPatient.patientId);
        
        if (!verifyPatient || !verifyPatient.patientId) {
            showNotification('Patient not found in database. Please search for the patient again.', 'error');
            resetLookup();
            return;
        }
        
        // Update with latest patient data
        currentPatient = verifyPatient;
        console.log('Patient verified:', currentPatient.patientId);
    } catch (error) {
        console.error('Error verifying patient:', error);
        showNotification('Error verifying patient. Please search again.', 'error');
        resetLookup();
        return;
    }

    const formData = new FormData(e.target);
    const appointmentData = {
        patientId: currentPatient.patientId,
        patientName: currentPatient.name,
        date: formData.get('appointmentDate'),
        time: formData.get('appointmentTime'),
        type: formData.get('appointmentType'),
        status: formData.get('appointmentStatus') || 'scheduled',
        notes: formData.get('appointmentNotes') || ''
    };

    // Validate required fields
    if (!appointmentData.date || !appointmentData.time || !appointmentData.type) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Validate date is not in the past
    const appointmentDateTime = new Date(`${appointmentData.date}T${appointmentData.time}`);
    const now = new Date();
    if (appointmentDateTime < now) {
        showNotification('Appointment date and time cannot be in the past', 'error');
        return;
    }

    try {
        showNotification('Booking appointment...', 'info');
        
        // Save appointment
        const appointment = await db.saveAppointment(appointmentData);
        
        if (appointment) {
            // Update patient status to indicate appointment is scheduled
            try {
                const currentStatus = currentPatient.status || 'registered';
                
                // Only update status if patient is still in 'registered' status
                // Don't downgrade patients who have already progressed further
                if (currentStatus === 'registered') {
                    const updatedPatient = {
                        ...currentPatient,
                        status: 'appointment_scheduled'
                    };
                    
                    const savedPatient = await db.savePatient(updatedPatient);
                    if (savedPatient) {
                        console.log('Patient status updated to appointment_scheduled');
                        // Update current patient reference
                        currentPatient = savedPatient;
                    }
                }
            } catch (statusError) {
                console.error('Error updating patient status:', statusError);
                // Don't fail the appointment booking if status update fails
            }
            
            showNotification('Appointment booked successfully!', 'success');
            
            // Redirect based on appointment type
            const appointmentType = appointmentData.type;
            let redirectUrl = null;
            
            if (appointmentType === 'counseling') {
                redirectUrl = 'counseling.html';
            } else if (appointmentType === 'nursing') {
                redirectUrl = 'nursing.html';
            } else if (['follow-up', 'checkup', 'procedure', 'consultation'].includes(appointmentType)) {
                redirectUrl = 'consultation.html';
            }
            
            // Refresh the patients table if it's visible
            const tableCard = document.getElementById('patients-table-card');
            if (tableCard && tableCard.style.display !== 'none' && lastSearchTerm) {
                // Re-run the search to refresh the table with updated patient status
                setTimeout(async () => {
                    try {
                        const patients = await db.getPatients();
                        if (!patients || patients.length === 0) return;
                        
                        // Filter patients using the same logic as handlePatientLookup
                        const matchingPatients = patients.filter(p => {
                            if (!p) return false;
                            
                            // Match by Patient ID (exact, case-insensitive)
                            if (p.patientId && p.patientId.toLowerCase().trim() === lastSearchTerm.toLowerCase().trim()) {
                                return true;
                            }
                            
                            // Match by phone (exact only)
                            if (p.phone) {
                                const patientPhoneStr = String(p.phone).trim();
                                const searchTermTrimmed = lastSearchTerm.trim();
                                
                                // Direct string match
                                if (patientPhoneStr.toLowerCase() === searchTermTrimmed.toLowerCase()) {
                                    return true;
                                }
                                
                                // Normalized exact match
                                const phoneSearch = lastSearchTerm.replace(/\D/g, '').trim();
                                const patientPhone = patientPhoneStr.replace(/\D/g, '');
                                if (phoneSearch.length > 0 && patientPhone === phoneSearch) {
                                    return true;
                                }
                            }
                            
                            return false;
                        });
                        
                        // Remove duplicates
                        const uniquePatients = [];
                        const seenIds = new Set();
                        matchingPatients.forEach(p => {
                            if (p && p.patientId && !seenIds.has(p.patientId)) {
                                seenIds.add(p.patientId);
                                uniquePatients.push(p);
                            }
                        });
                        
                        if (uniquePatients.length > 0) {
                            displayPatientsTable(uniquePatients);
                        }
                    } catch (refreshError) {
                        console.error('Error refreshing patient table:', refreshError);
                    }
                }, 500);
            }
            
            // Close modal and redirect or reset form
            setTimeout(() => {
                closeAppointmentModal();
                if (redirectUrl) {
                    // Redirect to appropriate page
                    window.location.href = redirectUrl;
                } else {
                    showNotification('You can book another appointment', 'info');
                }
            }, 2000);
        } else {
            showNotification('Failed to book appointment. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error booking appointment:', error);
        showNotification('Error booking appointment. Please try again.', 'error');
    }
}

/**
 * Reset lookup and forms
 */
function resetLookup() {
        // Clear patient data
        currentPatient = null;
        
        // Reset forms
        const lookupForm = document.getElementById('patient-lookup-form');
        const appointmentForm = document.getElementById('appointment-form');
        if (lookupForm) lookupForm.reset();
        if (appointmentForm) appointmentForm.reset();
        
        // Hide all cards and modal
        const notFoundCard = document.getElementById('patient-not-found-card');
        const tableCard = document.getElementById('patients-table-card');
        const modal = document.getElementById('appointment-modal');
        if (notFoundCard) notFoundCard.style.display = 'none';
        if (tableCard) tableCard.style.display = 'none';
        if (modal) modal.style.display = 'none';
    
    // Reset date and time to defaults
    const dateInput = document.getElementById('appointment-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    const timeInput = document.getElementById('appointment-time');
    if (timeInput) {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }
    
    // Focus on search input
    const searchInput = document.getElementById('patient-id-lookup');
    if (searchInput) searchInput.focus();
}
