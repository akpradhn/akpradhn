/**
 * Load and display today's counseling appointments
 */

async function loadTodayAppointments() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const appointments = await db.getAppointments(today);
        
        // Filter for counseling appointments
        const counselingAppointments = appointments.filter(apt => {
            const aptType = (apt.type || '').toLowerCase();
            const aptStatus = apt.status || 'scheduled';
            return aptType === 'counseling' && 
                   (aptStatus === 'scheduled' || aptStatus === 'confirmed');
        });
        
        await displayTodayAppointments(counselingAppointments);
    } catch (error) {
        console.error('Error loading today\'s appointments:', error);
        showNotification('Error loading appointments', 'error');
    }
}

async function displayTodayAppointments(appointments) {
    // Find the appointments container - it might be in the tab
    let container = document.getElementById('counseling-appointments-container');
    
    // If not found, try to find it in the appointments tab
    if (!container) {
        const appointmentsTab = document.getElementById('tab-appointments');
        if (appointmentsTab) {
            container = appointmentsTab.querySelector('#counseling-appointments-container');
        }
    }
    
    // If still not found, create it in the appointments tab
    if (!container) {
        const appointmentsTab = document.getElementById('tab-appointments');
        if (appointmentsTab) {
            container = document.createElement('div');
            container.id = 'counseling-appointments-container';
            appointmentsTab.appendChild(container);
        } else {
            console.error('Appointments tab not found');
            return;
        }
    }
    
    // Find or create the table
    let table = container.querySelector('#counseling-appointments-table');
    const noAppointmentsMsg = container.querySelector('#no-counseling-appointments');
    
    if (appointments.length === 0) {
        if (table) table.style.display = 'none';
        if (noAppointmentsMsg) {
            noAppointmentsMsg.style.display = 'block';
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-light);">
                    <i class="fas fa-calendar-times" style="font-size: 48px; margin-bottom: 16px;"></i>
                    <p>No counseling appointments scheduled for today.</p>
                </div>
            `;
        }
        return;
    }
    
    // Show table, hide no appointments message
    if (table) table.style.display = 'table';
    if (noAppointmentsMsg) noAppointmentsMsg.style.display = 'none';
    
    // Sort by time
    appointments.sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
    });
    
    // Get or create tbody
    let tbody = table ? table.querySelector('tbody') : null;
    if (!tbody) {
        if (!table) {
            table = document.createElement('table');
            table.className = 'data-table';
            table.id = 'counseling-appointments-table';
            table.style.width = '100%';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Patient ID</th>
                        <th>Patient Name</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            container.appendChild(table);
        }
        tbody = table.querySelector('tbody');
    }
    
    // Clear and populate tbody - fetch patient data for phone numbers
    const appointmentRows = await Promise.all(appointments.map(async (apt) => {
        const time = apt.time ? formatTime(apt.time) : '-';
        const statusBadge = getStatusBadge(apt.status);
        
        // Fetch patient data to get phone number
        let phoneNumber = apt.phone || '-';
        try {
            const patient = await db.getPatient(apt.patientId);
            if (patient && patient.phone) {
                phoneNumber = patient.phone;
            }
        } catch (error) {
            console.error('Error fetching patient phone:', error);
        }
        
        return `
            <tr style="cursor: pointer;" onclick="selectPatientForCounseling('${apt.patientId}')">
                <td><strong>${time}</strong></td>
                <td><strong>${apt.patientId}</strong></td>
                <td>${apt.patientName || '-'}</td>
                <td>${phoneNumber}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); selectPatientForCounseling('${apt.patientId}')">
                        <i class="fas fa-user"></i> Select
                    </button>
                </td>
            </tr>
        `;
    }));
    
    tbody.innerHTML = appointmentRows.join('');
}

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

function getStatusBadge(status) {
    const badges = {
        'scheduled': '<span class="badge badge-new">Scheduled</span>',
        'confirmed': '<span class="badge badge-checked-in">Confirmed</span>',
        'completed': '<span class="badge badge-paid">Completed</span>',
        'cancelled': '<span class="badge" style="background: #fee; color: #c00;">Cancelled</span>',
        'pending': '<span class="badge badge-checked-in">Pending</span>'
    };
    return badges[status] || `<span class="badge">${status || 'Scheduled'}</span>`;
}

// Select patient for counseling - stores patient ID and navigates to treatment discussion
window.selectPatientForCounseling = async function(patientId) {
    // Store selected patient ID globally
    window.currentCounselingPatientId = patientId;
    
    // Load patient data if available
    try {
        const patient = await db.getPatient(patientId);
        if (patient) {
            // Update patient status to 'counseling_in_progress' when starting counseling
            if (patient.status === 'nursing_complete' || patient.status === 'appointment_scheduled') {
                const updatedPatient = { ...patient, status: 'counseling_in_progress' };
                await db.savePatient(updatedPatient);
            }
            // Pre-fill form if patient has existing data
            setTimeout(() => {
                if (patient.treatmentOptions) {
                    const treatmentOptionsEl = document.getElementById('treatment-options');
                    if (treatmentOptionsEl) treatmentOptionsEl.value = patient.treatmentOptions;
                }
                if (patient.patientConcerns) {
                    const patientConcernsEl = document.getElementById('patient-concerns');
                    if (patientConcernsEl) patientConcernsEl.value = patient.patientConcerns;
                }
                if (patient.counselorRecommendations) {
                    const counselorRecommendationsEl = document.getElementById('counselor-recommendations');
                    if (counselorRecommendationsEl) counselorRecommendationsEl.value = patient.counselorRecommendations;
                }
                if (patient.estimatedCost) {
                    const estimatedCostEl = document.getElementById('estimated-cost');
                    if (estimatedCostEl) estimatedCostEl.value = patient.estimatedCost;
                }
                if (patient.paymentPlanType) {
                    const paymentPlanTypeEl = document.getElementById('payment-plan-type');
                    if (paymentPlanTypeEl) {
                        paymentPlanTypeEl.value = patient.paymentPlanType;
                        // Trigger change to show/hide installment details
                        paymentPlanTypeEl.dispatchEvent(new Event('change'));
                    }
                }
                if (patient.installmentAmount) {
                    const installmentAmountEl = document.getElementById('installment-amount');
                    if (installmentAmountEl) installmentAmountEl.value = patient.installmentAmount;
                }
                if (patient.installmentCount) {
                    const installmentCountEl = document.getElementById('installment-count');
                    if (installmentCountEl) installmentCountEl.value = patient.installmentCount;
                }
                if (patient.paymentDiscussion) {
                    const paymentDiscussionEl = document.getElementById('payment-discussion');
                    if (paymentDiscussionEl) paymentDiscussionEl.value = patient.paymentDiscussion;
                }
                if (patient.paymentStatus) {
                    const paymentStatusEl = document.getElementById('payment-status');
                    if (paymentStatusEl) paymentStatusEl.value = patient.paymentStatus;
                }
                if (patient.counselingNotes) {
                    const counselingNotesEl = document.getElementById('counseling-notes');
                    if (counselingNotesEl) counselingNotesEl.value = patient.counselingNotes;
                }
            }, 100);
            
            // Auto-navigate to treatment discussion tab
            setTimeout(() => {
                if (window.switchTab) {
                    window.switchTab('counseling-tabs-container', 'treatment-discussion');
                }
            }, 300);
            
            showNotification(`Patient ${patient.name} selected. Starting with Treatment Discussion...`, 'success');
        }
    } catch (error) {
        console.error('Error loading patient:', error);
        showNotification('Error loading patient data', 'error');
    }
};

// Make function available globally
window.loadTodayAppointments = loadTodayAppointments;


