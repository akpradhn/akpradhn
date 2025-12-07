/**
 * Load and display today's consultation appointments
 */

async function loadTodayAppointments() {
    try {
        console.log('=== Loading consultation appointments ===');
        const today = new Date().toISOString().split('T')[0];
        console.log('Today:', today);
        
        const appointments = await db.getAppointments(today);
        console.log('All appointments for today:', appointments);
        console.log('Total appointments found:', appointments.length);
        
        if (!appointments || appointments.length === 0) {
            console.log('No appointments found for today');
            await displayTodayAppointments([]);
            return;
        }
        
        // Filter for consultation, follow-up, checkup, procedure appointments
        // Also include appointments that don't have a type set (for backward compatibility)
        const consultationAppointments = appointments.filter(apt => {
            const aptType = (apt.type || '').toLowerCase();
            const aptStatus = apt.status || 'scheduled';
            
            // If no type is set, include it (might be old appointments)
            if (!apt.type || apt.type.trim() === '') {
                console.log(`Appointment ${apt.patientId}: No type set, including it`);
                return aptStatus === 'scheduled' || aptStatus === 'confirmed';
            }
            
            const isMatch = ['consultation', 'follow-up', 'checkup', 'procedure'].includes(aptType) && 
                   (aptStatus === 'scheduled' || aptStatus === 'confirmed');
            console.log(`Appointment ${apt.patientId}: Type="${aptType}", Status="${aptStatus}", Match=${isMatch}`);
            return isMatch;
        });
        
        console.log('Filtered consultation appointments:', consultationAppointments);
        console.log('Number of consultation appointments:', consultationAppointments.length);
        
        await displayTodayAppointments(consultationAppointments);
    } catch (error) {
        console.error('Error loading today\'s appointments:', error);
        console.error('Error stack:', error.stack);
        showNotification('Error loading appointments: ' + error.message, 'error');
    }
}

async function displayTodayAppointments(appointments) {
    console.log('Displaying appointments:', appointments);
    console.log('Number of appointments:', appointments.length);
    
    // Wait a bit for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Find the appointments tab (tabs.js creates IDs as "tab-{tabId}")
    const appointmentsTab = document.getElementById('tab-appointments');
    console.log('Appointments tab found:', !!appointmentsTab);
    
    if (!appointmentsTab) {
        console.error('Appointments tab not found! Make sure tabs are initialized.');
        showNotification('Appointments tab not found. Please refresh the page.', 'error');
        return;
    }
    
    // Find the consultation appointments container inside the tab
    let consultationContainer = appointmentsTab.querySelector('#consultation-appointments-container');
    console.log('Consultation container found:', !!consultationContainer);
    
    // If container doesn't exist, create it
    if (!consultationContainer) {
        consultationContainer = document.createElement('div');
        consultationContainer.id = 'consultation-appointments-container';
        appointmentsTab.appendChild(consultationContainer);
        console.log('Created consultation container');
    }
    
    // Find or create the appointments list container
    let container = consultationContainer.querySelector('#today-appointments-list');
    console.log('Appointments list container found:', !!container);
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'today-appointments-list';
        container.className = 'table-responsive';
        consultationContainer.appendChild(container);
        console.log('Created appointments list container');
    }
    
    console.log('Final container:', container);
    
    if (appointments.length === 0) {
        console.log('No appointments to display, showing empty state');
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-light);">
                <i class="fas fa-calendar-times" style="font-size: 48px; margin-bottom: 16px; color: var(--primary);"></i>
                <p style="font-size: 16px; margin-bottom: 8px;"><strong>No consultation appointments scheduled for today.</strong></p>
                <p style="font-size: 14px; color: var(--text-light);">Appointments will appear here once they are booked.</p>
            </div>
        `;
        return;
    }
    
    console.log('Creating table for', appointments.length, 'appointments');
    
    // Sort by time
    appointments.sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
    });
    
    const table = document.createElement('table');
    table.className = 'data-table';
    table.style.width = '100%';
    
    // Create table structure
    table.innerHTML = `
        <thead>
            <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            <!-- Rows will be added here -->
        </tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    // Fetch patient data and populate rows
    for (const apt of appointments) {
        const time = apt.time ? formatTime(apt.time) : '-';
        const type = apt.type || 'consultation';
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
        
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.onclick = () => selectPatientForConsultation(apt.patientId);
        row.innerHTML = `
            <td><strong>${time}</strong></td>
            <td><span class="badge badge-new">${type}</span></td>
            <td><strong>${apt.patientId}</strong></td>
            <td>${apt.patientName || '-'}</td>
            <td>${phoneNumber}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); selectPatientForConsultation('${apt.patientId}')">
                    <i class="fas fa-stethoscope"></i> Select
                </button>
            </td>
        `;
        tbody.appendChild(row);
    }
    
    // Clear and add table
    container.innerHTML = '';
    container.appendChild(table);
    console.log('Table added to container successfully');
    
    // Verify table is visible
    const addedTable = container.querySelector('table');
    if (addedTable) {
        console.log('Table verified in DOM');
    } else {
        console.error('Table was not added correctly!');
    }
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

// Select patient for consultation - stores patient ID and navigates to intake summary
window.selectPatientForConsultation = async function(patientId) {
    // Store selected patient ID globally
    window.currentConsultationPatientId = patientId;
    
    // Load patient data if available
    try {
        const patient = await db.getPatient(patientId);
        if (patient) {
            // Update patient status to 'consultation_in_progress' when starting consultation
            if (patient.status === 'counseling_complete' || patient.status === 'appointment_scheduled') {
                const updatedPatient = { ...patient, status: 'consultation_in_progress' };
                await db.savePatient(updatedPatient);
            }
            
            // Auto-navigate to intake summary tab first
            setTimeout(() => {
                if (window.switchTab) {
                    window.switchTab('consultation-tabs-container', 'intake-summary');
                }
                
                // Load patient data into intake summary after tab switch
                setTimeout(async () => {
                    if (window.loadPatientData) {
                        await window.loadPatientData(patientId);
                    }
                }, 100);
            }, 300);
            
            showNotification(`Patient ${patient.name} selected. Reviewing intake summary...`, 'success');
        }
    } catch (error) {
        console.error('Error loading patient:', error);
        showNotification('Error loading patient data', 'error');
    }
};

// Make function available globally
window.loadTodayAppointments = loadTodayAppointments;


