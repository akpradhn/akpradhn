/**
 * Nursing - Medical History Form JavaScript
 */

// Global variables
let medicationCount = 0;
let uploadedFiles = [];

// Initialize tabs for nursing page
function initNursingTabs() {
    // Check if initTabs is available
    const tabsInitFunction = window.initTabs;
    
    if (!tabsInitFunction) {
        console.error('initTabs function not available. Retrying...');
        // Retry after a short delay
        setTimeout(initNursingTabs, 200);
        return;
    }
        
        const tabs = [
            {
                id: 'appointments',
                label: 'Appointments',
                icon: 'fas fa-calendar-day',
                content: `
                    <div id="appointments-sections">
                        <!-- Appointments will be loaded here -->
                    </div>
                `
            },
            {
                id: 'medical-history',
                label: 'Medical History',
                icon: 'fas fa-heartbeat',
                content: `
                    <div class="form-group">
                        <label for="past-conditions">Past Medical Conditions</label>
                        <textarea id="past-conditions" name="pastConditions" 
                                  rows="4" placeholder="List any past medical conditions, surgeries, or chronic illnesses..."
                                  class="form-input"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="known-allergies">Known Allergies</label>
                        <textarea id="known-allergies" name="knownAllergies" 
                                  rows="3" placeholder="List any known allergies (medications, food, environmental)..."
                                  class="form-input"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="family-history">Family Medical History</label>
                        <textarea id="family-history" name="familyHistory" 
                                  rows="3" placeholder="Relevant family medical history..."
                                  class="form-input"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Medical History Documents</label>
                        <div class="upload-area" id="upload-area-medical-history" style="min-height: 120px;">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Drag and drop files here or click to browse</p>
                            <input type="file" id="file-upload-medical-history" multiple accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                            <button type="button" class="btn btn-secondary btn-small" onclick="document.getElementById('file-upload-medical-history').click()">
                                Browse Files
                            </button>
                        </div>
                        <div id="uploaded-files-medical-history" class="uploaded-files-list">
                            <!-- Uploaded files will appear here -->
                        </div>
                    </div>
                    <div class="form-actions" style="margin-top: 20px;">
                        <button type="button" class="btn btn-primary btn-large" onclick="navigateToNextTab('treatment-history')">
                            Next: Treatment History <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                `
            },
            {
                id: 'treatment-history',
                label: 'Treatment History',
                icon: 'fas fa-history',
                content: `
                    <div class="form-group">
                        <label for="previous-surgeries">Previous Surgeries</label>
                        <textarea id="previous-surgeries" name="previousSurgeries" 
                                  rows="3" placeholder="List any previous surgeries with dates..."
                                  class="form-input"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="ongoing-therapies">Ongoing Therapies</label>
                        <textarea id="ongoing-therapies" name="ongoingTherapies" 
                                  rows="3" placeholder="Current therapies, physiotherapy, etc..."
                                  class="form-input"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Treatment History Documents</label>
                        <div class="upload-area" id="upload-area-treatment-history" style="min-height: 120px;">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Drag and drop files here or click to browse</p>
                            <input type="file" id="file-upload-treatment-history" multiple accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                            <button type="button" class="btn btn-secondary btn-small" onclick="document.getElementById('file-upload-treatment-history').click()">
                                Browse Files
                            </button>
                        </div>
                        <div id="uploaded-files-treatment-history" class="uploaded-files-list">
                            <!-- Uploaded files will appear here -->
                        </div>
                    </div>
                    <div class="form-actions" style="margin-top: 20px;">
                        <button type="button" class="btn btn-secondary" onclick="navigateToNextTab('medical-history')">
                            <i class="fas fa-arrow-left"></i> Previous
                        </button>
                        <button type="button" class="btn btn-primary btn-large" onclick="navigateToNextTab('medications')">
                            Next: Medications <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                `
            },
            {
                id: 'medications',
                label: 'Medications',
                icon: 'fas fa-pills',
                content: `
                    <div id="medications-list" class="medications-container">
                        <!-- Medications will be added dynamically -->
                    </div>
                    <button type="button" class="btn btn-secondary btn-small" id="add-medication">
                        <i class="fas fa-plus"></i> Add Medication
                    </button>
                    <div class="form-group" style="margin-top: 20px;">
                        <label>Medication Documents</label>
                        <div class="upload-area" id="upload-area-medications" style="min-height: 120px;">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Drag and drop files here or click to browse</p>
                            <input type="file" id="file-upload-medications" multiple accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                            <button type="button" class="btn btn-secondary btn-small" onclick="document.getElementById('file-upload-medications').click()">
                                Browse Files
                            </button>
                        </div>
                        <div id="uploaded-files-medications" class="uploaded-files-list">
                            <!-- Uploaded files will appear here -->
                        </div>
                    </div>
                    <div class="form-actions" style="margin-top: 20px;">
                        <button type="button" class="btn btn-secondary" onclick="navigateToNextTab('treatment-history')">
                            <i class="fas fa-arrow-left"></i> Previous
                        </button>
                        <button type="button" class="btn btn-primary btn-large" onclick="navigateToNextTab('notes')">
                            Next: Nursing Notes <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                `
            },
            {
                id: 'documents',
                label: 'Documents',
                icon: 'fas fa-file-upload',
                content: `
                    <div class="documents-container">
                        <div class="upload-area" id="upload-area">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Drag and drop files here or click to browse</p>
                            <input type="file" id="file-upload" multiple accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                            <button type="button" class="btn btn-secondary btn-small" onclick="document.getElementById('file-upload').click()">
                                Browse Files
                            </button>
                        </div>
                        <div id="uploaded-files" class="uploaded-files-list">
                            <!-- Uploaded files will appear here -->
                        </div>
                    </div>
                `
            },
            {
                id: 'notes',
                label: 'Nursing Notes',
                icon: 'fas fa-sticky-note',
                content: `
                    <div class="form-group">
                        <label for="nursing-notes">Additional Observations</label>
                        <textarea id="nursing-notes" name="nursingNotes" 
                                  rows="6" placeholder="Any additional observations or notes for consultation preparation..."
                                  class="form-input"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="window.location.href='index.html'">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    <button type="button" class="btn btn-primary btn-large" onclick="handleNursingFormSubmit()">
                        <i class="fas fa-check-circle"></i>
                        Medical History Complete: Route to Counseling
                    </button>
                    </div>
                `
            }
        ];
        
    try {
        tabsInitFunction('nursing-tabs-container', tabs);
        console.log('Tabs initialized successfully');
        
        // Re-initialize event handlers after tabs are created
        setTimeout(() => {
            initializeEventHandlers();
            // Load appointments and patients automatically on page load
            setTimeout(() => {
                if (window.loadAppointments) {
                    window.loadAppointments(); // Load appointments after tabs are ready
                }
                loadPatients(); // Load patients after tabs are ready
                // Switch to appointments tab automatically
                if (window.switchTab) {
                    window.switchTab('nursing-tabs-container', 'appointments');
                }
            }, 200);
        }, 100);
    } catch (error) {
        console.error('Error initializing tabs:', error);
        // Fallback: show error message
        const container = document.getElementById('nursing-tabs-container');
        if (container) {
            container.innerHTML = `
                <div class="card" style="padding: 20px; text-align: center;">
                    <h3>Error Loading Tabs</h3>
                    <p>There was an error initializing the tabs. Please refresh the page.</p>
                    <button class="btn btn-primary" onclick="location.reload()">Refresh Page</button>
                </div>
            `;
        }
        return;
    }
}

// Initialize when DOM and scripts are ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNursingPage);
} else {
    // DOM is already ready
    initializeNursingPage();
}

function initializeNursingPage() {
    // Wait for tabs.js to load
    let retries = 0;
    const maxRetries = 20;
    
    function tryInit() {
        console.log('Attempting to initialize tabs, retry:', retries, 'initTabs available:', typeof window.initTabs !== 'undefined');
        
        if (typeof window.initTabs !== 'undefined') {
            console.log('initTabs found, initializing...');
            initNursingTabs();
        } else if (retries < maxRetries) {
            retries++;
            setTimeout(tryInit, 100);
        } else {
            console.error('Failed to load tabs.js after multiple retries');
            const container = document.getElementById('nursing-tabs-container');
            if (container) {
                container.innerHTML = `
                    <div class="card" style="padding: 20px; text-align: center;">
                        <h3>Error Loading Page</h3>
                        <p>Unable to load tabs module. Please check the browser console for errors.</p>
                        <p style="color: red;">Make sure tabs.js is loaded before nursing.js</p>
                        <button class="btn btn-primary" onclick="location.reload()">Refresh Page</button>
                    </div>
                `;
            }
        }
    }
    
    tryInit();
    
    // Initialize event handlers for form elements
    function initializeEventHandlers() {
        const addMedicationBtn = document.getElementById('add-medication');
        const medicationsList = document.getElementById('medications-list');
        
        // Add medication item
        if (addMedicationBtn && medicationsList) {
            addMedicationBtn.addEventListener('click', function() {
                medicationCount++;
                const medicationItem = createMedicationItem(medicationCount);
                medicationsList.appendChild(medicationItem);
            });
        }
        
        // Patient selection is now handled in appointments tab - removed patient-select tab
        
        // Initialize file upload handlers for all document sections
        initializeDocumentUploads();
        
        // File upload handling
        const uploadArea = document.getElementById('upload-area');
        const fileUpload = document.getElementById('file-upload');
        
        if (uploadArea && fileUpload) {
            // Click to upload
            uploadArea.addEventListener('click', function() {
                fileUpload.click();
            });
            
            // Drag and drop
            uploadArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                uploadArea.style.borderColor = '#008080';
                uploadArea.style.background = '#E6F7FF';
            });
            
            uploadArea.addEventListener('dragleave', function(e) {
                e.preventDefault();
                uploadArea.style.borderColor = '';
                uploadArea.style.background = '';
            });
            
            uploadArea.addEventListener('drop', function(e) {
                e.preventDefault();
                uploadArea.style.borderColor = '';
                uploadArea.style.background = '';
                
                const files = Array.from(e.dataTransfer.files);
                handleFiles(files);
            });
            
            fileUpload.addEventListener('change', function(e) {
                const files = Array.from(e.target.files);
                handleFiles(files);
            });
        }
    }
}

// Helper functions (defined outside initializeNursingPage)

// Handle uploaded files
function handleFiles(files) {
        files.forEach(file => {
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                uploadedFiles.push({
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
                displayUploadedFile(file.name, file.type);
            } else {
                showNotification('Please upload only PDF or image files', 'error');
            }
        });
    }
    
// Display uploaded file
function displayUploadedFile(fileName, fileType) {
        const uploadedFilesList = document.getElementById('uploaded-files');
        if (!uploadedFilesList) return;
        
        const fileDiv = document.createElement('div');
        fileDiv.className = 'uploaded-file';
        
        const icon = fileType === 'application/pdf' ? 'fa-file-pdf' : 'fa-file-image';
        fileDiv.innerHTML = `
            <i class="fas ${icon}"></i>
            <span style="flex: 1;">${fileName}</span>
            <button type="button" class="btn-icon" onclick="removeFile('${fileName}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        uploadedFilesList.appendChild(fileDiv);
    }
    
    // Remove file
    window.removeFile = function(fileName) {
        uploadedFiles = uploadedFiles.filter(f => f.name !== fileName);
        const uploadedFilesList = document.getElementById('uploaded-files');
        if (!uploadedFilesList) return;
        
        const fileDivs = uploadedFilesList.querySelectorAll('.uploaded-file');
        fileDivs.forEach(div => {
            if (div.textContent.includes(fileName)) {
                div.remove();
            }
        });
    };
    
    // Form submission handler
    window.handleNursingFormSubmit = async function() {
        // Get patient ID from global variable (set when patient is selected from appointments)
        const patientId = window.currentNursingPatientId;
        
        if (!patientId) {
            showNotification('Please select a patient from the Appointments tab first', 'error');
            // Switch back to appointments tab
            if (window.switchTab) {
                window.switchTab('nursing-tabs-container', 'appointments');
            }
            return;
        }
        
        // Collect form data from tabs
        const nursingData = {
            patientId: patientId,
            pastConditions: document.getElementById('past-conditions')?.value || '',
            knownAllergies: document.getElementById('known-allergies')?.value || '',
            familyHistory: document.getElementById('family-history')?.value || '',
            previousSurgeries: document.getElementById('previous-surgeries')?.value || '',
            ongoingTherapies: document.getElementById('ongoing-therapies')?.value || '',
            medications: collectMedications(),
            documents: uploadedFiles,
            nursingNotes: document.getElementById('nursing-notes')?.value || '',
            nursingDate: new Date().toISOString(),
            status: 'nursing_complete'
        };
        
        // Store nursing data using database
        const existingPatient = await db.getPatient(patientId);
        const updatedPatient = { 
            ...existingPatient, 
            ...nursingData,
            status: 'nursing_complete'
        };
        await db.savePatient(updatedPatient);
        
        // Add timeline entry
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        await db.addTimelineEntry(patientId, 'Nursing', 'completed', nursingData.nursingNotes || '', currentUser?.name || '');
        
        showNotification('Medical history collection completed! Patient routed to counseling.', 'success');
        
        // Redirect to counseling after a delay
        setTimeout(() => {
            window.location.href = 'counseling.html';
        }, 1500);
    };
    
// Collect medications from form
function collectMedications() {
        const medications = [];
        const medicationsList = document.getElementById('medications-list');
        if (!medicationsList) return medications;
        
        const medicationItems = medicationsList.querySelectorAll('.medication-item');
        
        medicationItems.forEach(item => {
            const name = item.querySelector('input[placeholder="Drug Name"]')?.value;
            const dosage = item.querySelector('input[placeholder="Dosage"]')?.value;
            const frequency = item.querySelector('input[placeholder="Frequency"]')?.value;
            
            if (name && dosage && frequency) {
                medications.push({ name, dosage, frequency });
            }
        });
        
        return medications;
    }
    
// Load nursing appointments only - make it available globally
window.loadAppointments = async function() {
    try {
        console.log('Loading appointments...');
        const today = new Date().toISOString().split('T')[0];
        console.log('Today:', today);
        
        const appointments = await db.getAppointments(today); // Get today's appointments
        console.log('All appointments for today:', appointments);
        
        // Filter appointments: today only, status scheduled or confirmed, type = nursing
        const todayNursingAppointments = appointments.filter(apt => {
            const aptDate = apt.date;
            const aptStatus = apt.status || 'scheduled';
            const aptType = (apt.type || '').toLowerCase();
            const isMatch = aptDate === today && 
                   (aptStatus === 'scheduled' || aptStatus === 'confirmed') &&
                   aptType === 'nursing';
            console.log('Checking appointment:', apt, 'Match:', isMatch);
            return isMatch;
        });
        
        console.log('Filtered nursing appointments:', todayNursingAppointments);
        
        // Display only nursing appointments
        displayNursingAppointments(todayNursingAppointments);
        
        // Also load patients into dropdown
        await loadPatients();
    } catch (error) {
        console.error('Error loading appointments:', error);
        showNotification('Error loading appointments: ' + error.message, 'error');
    }
};
    
// Display nursing appointments only
function displayNursingAppointments(appointments) {
    // Find the appointments container - it might be in the tab
    let container = document.getElementById('appointments-sections');
    
    // If not found, try to find it in the appointments tab
    if (!container) {
        const appointmentsTab = document.getElementById('tab-appointments');
        if (appointmentsTab) {
            container = appointmentsTab.querySelector('#appointments-sections');
        }
    }
    
    // If still not found, create it in the appointments tab
    if (!container) {
        const appointmentsTab = document.getElementById('tab-appointments');
        if (appointmentsTab) {
            container = document.createElement('div');
            container.id = 'appointments-sections';
            appointmentsTab.appendChild(container);
        } else {
            console.error('Appointments tab not found');
            return;
        }
    }
        
    console.log('Displaying appointments in container:', container);
    container.innerHTML = '';
    
    if (appointments.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <div class="card-body" style="text-align: center; padding: 40px;">
                        <i class="fas fa-calendar-times" style="font-size: 48px; color: var(--text-light); margin-bottom: 16px;"></i>
                        <p style="color: var(--text-light);">No nursing appointments scheduled for today.</p>
                    </div>
                </div>
            `;
            return;
        }
        
        // Sort by time
        appointments.sort((a, b) => {
            const timeA = a.time || '00:00';
            const timeB = b.time || '00:00';
            return timeA.localeCompare(timeB);
        });
        
        const sectionCard = document.createElement('div');
        sectionCard.className = 'card';
        
        const header = document.createElement('div');
        header.className = 'card-header';
        header.style.background = '#00808015';
        header.innerHTML = `
            <h3>
                <i class="fas fa-user-nurse" style="color: #008080;"></i>
                Nursing Appointments
                <span class="badge badge-new" style="margin-left: 10px;">${appointments.length}</span>
            </h3>
        `;
        
        const body = document.createElement('div');
        body.className = 'card-body';
        
        // Create table for appointments
        const table = document.createElement('table');
        table.className = 'data-table';
        table.style.width = '100%';
        
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Time</th>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        `;
        
        const tbody = document.createElement('tbody');
        
        appointments.forEach(apt => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.onclick = () => selectPatientForNursing(apt.patientId);
            
            const time = apt.time ? formatTime(apt.time) : '-';
            const statusBadge = getStatusBadge(apt.status);
            
            row.innerHTML = `
                <td><strong>${time}</strong></td>
                <td><strong>${apt.patientId}</strong></td>
                <td>${apt.patientName || '-'}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); selectPatientForNursing('${apt.patientId}')">
                        <i class="fas fa-user-nurse"></i> Select
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        table.appendChild(thead);
        table.appendChild(tbody);
        body.appendChild(table);
        
        sectionCard.appendChild(header);
        sectionCard.appendChild(body);
        container.appendChild(sectionCard);
    }
    
    
    // Select patient for nursing - stores patient ID and navigates to medical history
    window.selectPatientForNursing = async function(patientId) {
        // Store selected patient ID globally
        window.currentNursingPatientId = patientId;
        
        // Load patient data if available
        try {
            const patient = await db.getPatient(patientId);
            if (patient) {
                // Pre-fill form if patient has existing data
                setTimeout(() => {
                    if (patient.pastConditions) {
                        const pastConditionsEl = document.getElementById('past-conditions');
                        if (pastConditionsEl) pastConditionsEl.value = patient.pastConditions;
                    }
                    if (patient.knownAllergies) {
                        const knownAllergiesEl = document.getElementById('known-allergies');
                        if (knownAllergiesEl) knownAllergiesEl.value = patient.knownAllergies;
                    }
                    if (patient.familyHistory) {
                        const familyHistoryEl = document.getElementById('family-history');
                        if (familyHistoryEl) familyHistoryEl.value = patient.familyHistory;
                    }
                    if (patient.previousSurgeries) {
                        const previousSurgeriesEl = document.getElementById('previous-surgeries');
                        if (previousSurgeriesEl) previousSurgeriesEl.value = patient.previousSurgeries;
                    }
                    if (patient.ongoingTherapies) {
                        const ongoingTherapiesEl = document.getElementById('ongoing-therapies');
                        if (ongoingTherapiesEl) ongoingTherapiesEl.value = patient.ongoingTherapies;
                    }
                    if (patient.nursingNotes) {
                        const nursingNotesEl = document.getElementById('nursing-notes');
                        if (nursingNotesEl) nursingNotesEl.value = patient.nursingNotes;
                    }
                }, 100);
                
                // Auto-navigate to medical history tab
                setTimeout(() => {
                    if (window.switchTab) {
                        window.switchTab('nursing-tabs-container', 'medical-history');
                    }
                }, 300);
                
                showNotification(`Patient ${patient.name} selected. Starting with Medical History...`, 'success');
            }
        } catch (error) {
            console.error('Error loading patient:', error);
            showNotification('Error loading patient data', 'error');
        }
    };
    
    // Navigate to next tab
    window.navigateToNextTab = function(tabId) {
        if (window.switchTab) {
            window.switchTab('nursing-tabs-container', tabId);
        }
    };
    
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
    
// Get status badge
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
    
// Load patients into dropdown - no longer needed as patient-select tab is removed
async function loadPatients() {
    // Patient selection is now done from appointments tab
    // This function is kept for backward compatibility but does nothing
    return;
}
    
    // Note: loadAppointments is already defined above as window.loadAppointments
    
// Remove medication item
function removeMedicationItem(id) {
        const item = document.getElementById(`medication-${id}`);
        if (item) {
            item.remove();
        }
    }
    
// Create medication item HTML
function createMedicationItem(id) {
        const div = document.createElement('div');
        div.className = 'medication-item';
        div.id = `medication-${id}`;
        div.innerHTML = `
            <div class="form-group">
                <input type="text" name="medicationName_${id}" 
                       placeholder="Drug Name" class="form-input" required>
            </div>
            <div class="form-group">
                <input type="text" name="medicationDosage_${id}" 
                       placeholder="Dosage (e.g., 500mg)" class="form-input" required>
            </div>
            <div class="form-group">
                <input type="text" name="medicationFrequency_${id}" 
                       placeholder="Frequency (e.g., Twice daily)" class="form-input" required>
            </div>
            <button type="button" class="remove-medication" onclick="removeMedicationItem(${id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        return div;
    }
    
    // Make removeMedicationItem available globally
    window.removeMedicationItem = removeMedicationItem;

