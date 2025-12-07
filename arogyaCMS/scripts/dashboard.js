/**
 * Dashboard JavaScript - Load real data
 */

let allAppointments = [];
let currentFilter = 'All';

document.addEventListener('DOMContentLoaded', async function() {
    await loadDashboardData();
    setupFilterTabs();
});

async function loadDashboardData() {
    try {
        console.log('Loading dashboard data...');
        
        // Load all appointments (not just today) to show all patients
        allAppointments = await db.getAppointments();
        console.log('Loaded appointments:', allAppointments.length, allAppointments);
        
        // Also load all patients to populate dropdowns
        const allPatients = await db.getPatients();
        console.log('Loaded patients:', allPatients.length);
        
        // If no appointments but we have patients, create appointments from patients
        if (allAppointments.length === 0 && allPatients.length > 0) {
            console.log('No appointments found, but patients exist. Creating appointments from patients...');
            // For now, just show patients directly
            await updateAppointmentsTableFromPatients(allPatients);
        } else {
            // Update stats
            updateStats(allAppointments);
            
            // Update appointments table
            await updateAppointmentsTable(allAppointments);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

function setupFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get filter value
            currentFilter = this.textContent.trim();
            
            // Filter appointments
            filterAppointments(currentFilter);
        });
    });
}

function filterAppointments(filter) {
    let filtered = [...allAppointments];
    
    if (filter === 'New') {
        filtered = allAppointments.filter(apt => 
            apt.status === 'registered' || apt.status === 'new'
        );
    } else if (filter === 'Checked-In') {
        filtered = allAppointments.filter(apt => apt.status === 'checked-in');
    } else if (filter === 'Fee Paid') {
        filtered = allAppointments.filter(apt => 
            apt.status === 'fee_paid' || apt.status === 'registered'
        );
    }
    // 'All' shows everything
    
    updateAppointmentsTable(filtered);
    updateStats(filtered);
}

function updateStats(appointments) {
    // Always use all appointments for stats, not filtered
    const total = allAppointments.length;
    const newPatients = allAppointments.filter(apt => apt.status === 'registered' || apt.type === 'new').length;
    const checkedIn = allAppointments.filter(apt => apt.status === 'checked-in').length;
    const feePaid = allAppointments.filter(apt => apt.status === 'fee_paid' || apt.status === 'registered').length;
    
    // Update stat cards
    const statCards = document.querySelectorAll('.stat-content h3');
    if (statCards.length >= 4) {
        statCards[0].textContent = total;
        statCards[1].textContent = newPatients;
        statCards[2].textContent = checkedIn;
        statCards[3].textContent = feePaid;
    }
}

async function updateAppointmentsTable(appointments) {
    const tbody = document.querySelector('.data-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-light);">No appointments found</td></tr>';
        return;
    }
    
    for (const appointment of appointments) {
        const patient = await db.getPatient(appointment.patientId);
        if (!patient) {
            console.warn('Patient not found for appointment:', appointment.patientId);
            continue;
        }
        
        const row = document.createElement('tr');
        const statusBadge = getStatusBadge(patient.status || appointment.status);
        
        row.innerHTML = `
            <td>${patient.patientId}</td>
            <td>${patient.name}</td>
            <td>${patient.phone || '-'}</td>
            <td>${appointment.time || '-'}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn-icon" title="View Details" onclick="viewPatient('${patient.patientId}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    }
}

async function updateAppointmentsTableFromPatients(patients) {
    const tbody = document.querySelector('.data-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (patients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-light);">No patients found</td></tr>';
        return;
    }
    
    // Update stats based on patients
    allAppointments = patients.map(p => ({
        patientId: p.patientId,
        patientName: p.name,
        date: p.registrationDate || new Date().toISOString().split('T')[0],
        time: '-',
        status: p.status || 'registered',
        type: 'new'
    }));
    
    updateStats(allAppointments);
    
    for (const patient of patients) {
        const row = document.createElement('tr');
        const statusBadge = getStatusBadge(patient.status || 'registered');
        
        row.innerHTML = `
            <td>${patient.patientId}</td>
            <td>${patient.name}</td>
            <td>${patient.phone || '-'}</td>
            <td>-</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn-icon" title="View Details" onclick="viewPatient('${patient.patientId}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    }
}

function getStatusBadge(status) {
    const badges = {
        'registered': '<span class="badge badge-new">New</span>',
        'checked-in': '<span class="badge badge-checked-in">Checked-In</span>',
        'fee_paid': '<span class="badge badge-paid">Fee Paid</span>',
        'nursing_complete': '<span class="badge badge-paid">Nursing Complete</span>',
        'counseling_complete': '<span class="badge badge-paid">Counseling Complete</span>',
        'consultation_complete': '<span class="badge badge-paid">Consultation Complete</span>'
    };
    
    return badges[status] || '<span class="badge badge-new">New</span>';
}

window.viewPatient = function(patientId) {
    // Redirect to patient summary
    window.location.href = `patient-summary.html?patientId=${patientId}`;
};

