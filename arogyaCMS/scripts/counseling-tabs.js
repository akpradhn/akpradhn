/**
 * Initialize tabs for counseling page
 */
function initCounselingTabs() {
    const tabs = [
        {
            id: 'appointments',
            label: 'Appointments',
            icon: 'fas fa-calendar-day',
            content: `
                <div id="counseling-appointments-container">
                    <table class="data-table" id="counseling-appointments-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Patient ID</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Appointments will be loaded here -->
                        </tbody>
                    </table>
                    <p id="no-counseling-appointments" style="text-align: center; padding: 20px; display: none;">No counseling appointments scheduled for today.</p>
                </div>
            `
        },
        {
            id: 'treatment-discussion',
            label: 'Treatment Discussion',
            icon: 'fas fa-hand-holding-heart',
            content: `
                <div class="form-group">
                    <label for="treatment-options">Treatment Options Discussed</label>
                    <textarea id="treatment-options" name="treatmentOptions" 
                              rows="5" placeholder="Discuss available treatment options, procedures, and expected outcomes with the patient..."
                              class="form-input"></textarea>
                </div>
                <div class="form-group">
                    <label for="patient-concerns">Patient Concerns & Questions</label>
                    <textarea id="patient-concerns" name="patientConcerns" 
                              rows="4" placeholder="Document any concerns, questions, or preferences expressed by the patient..."
                              class="form-input"></textarea>
                </div>
                <div class="form-group">
                    <label for="counselor-recommendations">Counselor Recommendations</label>
                    <textarea id="counselor-recommendations" name="counselorRecommendations" 
                              rows="4" placeholder="Your recommendations based on the discussion..."
                              class="form-input"></textarea>
                </div>
                <div class="form-group">
                    <label>Treatment Discussion Documents</label>
                    <div class="upload-area" id="upload-area-treatment-discussion" style="min-height: 120px;">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Drag and drop files here or click to browse</p>
                        <input type="file" id="file-upload-treatment-discussion" multiple accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                        <button type="button" class="btn btn-secondary btn-small" onclick="document.getElementById('file-upload-treatment-discussion').click()">
                            Browse Files
                        </button>
                    </div>
                    <div id="uploaded-files-treatment-discussion" class="uploaded-files-list">
                        <!-- Uploaded files will appear here -->
                    </div>
                </div>
                <div class="form-actions" style="margin-top: 20px;">
                    <button type="button" class="btn btn-primary btn-large" onclick="navigateToNextCounselingTab('payment-plan')">
                        Next: Payment Plan <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `
        },
        {
            id: 'payment-plan',
            label: 'Payment Plan',
            icon: 'fas fa-money-bill-wave',
            content: `
                <div class="form-group">
                    <label for="estimated-cost">Estimated Treatment Cost</label>
                    <input type="number" id="estimated-cost" name="estimatedCost" 
                           placeholder="Enter estimated cost in ₹" class="form-input" step="0.01" min="0">
                </div>
                <div class="form-group">
                    <label for="payment-plan-type">Payment Plan Type</label>
                    <select id="payment-plan-type" name="paymentPlanType" class="form-input">
                        <option value="">Select payment plan...</option>
                        <option value="full-payment">Full Payment (Upfront)</option>
                        <option value="installment">Installment Plan</option>
                        <option value="insurance">Insurance Coverage</option>
                        <option value="partial">Partial Payment + Installment</option>
                        <option value="discount">Discounted Plan</option>
                    </select>
                </div>
                <div id="installment-details" style="display: none;">
                    <div class="form-group">
                        <label for="installment-amount">Installment Amount (₹)</label>
                        <input type="number" id="installment-amount" name="installmentAmount" 
                               placeholder="Monthly installment amount" class="form-input" step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <label for="installment-count">Number of Installments</label>
                        <input type="number" id="installment-count" name="installmentCount" 
                               placeholder="Number of months" class="form-input" min="1">
                    </div>
                </div>
                <div class="form-group">
                    <label for="payment-discussion">Payment Discussion Notes</label>
                    <textarea id="payment-discussion" name="paymentDiscussion" 
                              rows="4" placeholder="Document the payment plan discussion, patient's financial situation, and agreed terms..."
                              class="form-input"></textarea>
                </div>
                <div class="form-group">
                    <label for="payment-status">Payment Agreement Status</label>
                    <select id="payment-status" name="paymentStatus" class="form-input">
                        <option value="pending">Pending Discussion</option>
                        <option value="agreed">Agreed</option>
                        <option value="needs-review">Needs Review</option>
                        <option value="alternative">Alternative Plan Required</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Payment Plan Documents</label>
                    <div class="upload-area" id="upload-area-payment-plan" style="min-height: 120px;">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Drag and drop files here or click to browse</p>
                        <input type="file" id="file-upload-payment-plan" multiple accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                        <button type="button" class="btn btn-secondary btn-small" onclick="document.getElementById('file-upload-payment-plan').click()">
                            Browse Files
                        </button>
                    </div>
                    <div id="uploaded-files-payment-plan" class="uploaded-files-list">
                        <!-- Uploaded files will appear here -->
                    </div>
                </div>
                <div class="form-actions" style="margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="navigateToNextCounselingTab('treatment-discussion')">
                        <i class="fas fa-arrow-left"></i> Previous
                    </button>
                    <button type="button" class="btn btn-primary btn-large" onclick="navigateToNextCounselingTab('notes')">
                        Next: Counseling Notes <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `
        },
        {
            id: 'notes',
            label: 'Counseling Notes',
            icon: 'fas fa-sticky-note',
            content: `
                <div class="form-group">
                    <label for="counseling-notes">Additional Notes</label>
                    <textarea id="counseling-notes" name="counselingNotes" 
                              rows="6" placeholder="Any additional notes from the counseling session..."
                              class="form-input"></textarea>
                </div>
                <div class="form-group">
                    <label>Counseling Notes Documents</label>
                    <div class="upload-area" id="upload-area-counseling-notes" style="min-height: 120px;">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Drag and drop files here or click to browse</p>
                        <input type="file" id="file-upload-counseling-notes" multiple accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                        <button type="button" class="btn btn-secondary btn-small" onclick="document.getElementById('file-upload-counseling-notes').click()">
                            Browse Files
                        </button>
                    </div>
                    <div id="uploaded-files-counseling-notes" class="uploaded-files-list">
                        <!-- Uploaded files will appear here -->
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.location.href='nursing.html'">
                        <i class="fas fa-arrow-left"></i> Back to Nursing
                    </button>
                    <button type="button" class="btn btn-primary btn-large" onclick="handleCounselingFormSubmit()">
                        <i class="fas fa-check-circle"></i>
                        Counseling Complete: Route to Doctor Consultation
                    </button>
                </div>
            `
        }
    ];
    
    initTabs('counseling-tabs-container', tabs);
    
    // Re-initialize event handlers after tabs are created
    setTimeout(() => {
        initializeCounselingHandlers();
        // Auto-load appointments and switch to appointments tab
        setTimeout(() => {
            if (window.loadTodayAppointments) {
                window.loadTodayAppointments();
            }
            if (window.switchTab) {
                window.switchTab('counseling-tabs-container', 'appointments');
            }
        }, 200);
    }, 100);
}

function initializeCounselingHandlers() {
    const paymentPlanType = document.getElementById('payment-plan-type');
    const installmentDetails = document.getElementById('installment-details');
    
    // Patient selection is now handled in appointments tab - removed patient-select tab
    
    // Initialize document uploads for counseling sections
    initializeCounselingDocumentUploads();
    
    // Show/hide installment details based on payment plan type
    if (paymentPlanType && installmentDetails) {
        paymentPlanType.addEventListener('change', function() {
            if (this.value === 'installment' || this.value === 'partial') {
                installmentDetails.style.display = 'block';
            } else {
                installmentDetails.style.display = 'none';
            }
        });
    }
}

// Navigate to next counseling tab and update patient status
window.navigateToNextCounselingTab = async function(tabId) {
    if (window.switchTab) {
        window.switchTab('counseling-tabs-container', tabId);
        
        // Update patient status based on current tab
        const patientId = window.currentCounselingPatientId;
        if (patientId) {
            try {
                const patient = await db.getPatient(patientId);
                if (patient) {
                    let newStatus = patient.status;
                    
                    // Update status based on which tab we're moving to
                    if (tabId === 'payment-plan' && patient.status === 'counseling_in_progress') {
                        newStatus = 'counseling_payment_discussion';
                    } else if (tabId === 'notes' && (patient.status === 'counseling_in_progress' || patient.status === 'counseling_payment_discussion')) {
                        newStatus = 'counseling_finalizing';
                    }
                    
                    if (newStatus !== patient.status) {
                        const updatedPatient = { ...patient, status: newStatus };
                        await db.savePatient(updatedPatient);
                    }
                }
            } catch (error) {
                console.error('Error updating patient status:', error);
            }
        }
    }
};

// Initialize document uploads for counseling sections
function initializeCounselingDocumentUploads() {
    // Treatment Discussion documents
    const uploadAreaTreatment = document.getElementById('upload-area-treatment-discussion');
    const fileUploadTreatment = document.getElementById('file-upload-treatment-discussion');
    if (uploadAreaTreatment && fileUploadTreatment) {
        setupCounselingFileUpload(uploadAreaTreatment, fileUploadTreatment, 'uploaded-files-treatment-discussion');
    }
    
    // Payment Plan documents
    const uploadAreaPayment = document.getElementById('upload-area-payment-plan');
    const fileUploadPayment = document.getElementById('file-upload-payment-plan');
    if (uploadAreaPayment && fileUploadPayment) {
        setupCounselingFileUpload(uploadAreaPayment, fileUploadPayment, 'uploaded-files-payment-plan');
    }
    
    // Counseling Notes documents
    const uploadAreaNotes = document.getElementById('upload-area-counseling-notes');
    const fileUploadNotes = document.getElementById('file-upload-counseling-notes');
    if (uploadAreaNotes && fileUploadNotes) {
        setupCounselingFileUpload(uploadAreaNotes, fileUploadNotes, 'uploaded-files-counseling-notes');
    }
}

// Setup file upload for counseling sections
function setupCounselingFileUpload(uploadArea, fileUpload, uploadedFilesListId) {
    if (!uploadArea || !fileUpload) return;
    
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
        handleCounselingFiles(files, uploadedFilesListId);
    });
    
    fileUpload.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        handleCounselingFiles(files, uploadedFilesListId);
    });
}

// Handle files for counseling sections
let counselingUploadedFiles = [];
function handleCounselingFiles(files, uploadedFilesListId) {
    files.forEach(file => {
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
            counselingUploadedFiles.push({
                name: file.name,
                size: file.size,
                type: file.type,
                section: uploadedFilesListId
            });
            displayCounselingUploadedFile(file.name, file.type, uploadedFilesListId);
        } else {
            showNotification('Please upload only PDF or image files', 'error');
        }
    });
}

// Display uploaded file for counseling sections
function displayCounselingUploadedFile(fileName, fileType, uploadedFilesListId) {
    const uploadedFilesList = document.getElementById(uploadedFilesListId);
    if (!uploadedFilesList) return;
    
    const fileDiv = document.createElement('div');
    fileDiv.className = 'uploaded-file';
    
    const icon = fileType === 'application/pdf' ? 'fa-file-pdf' : 'fa-file-image';
    fileDiv.innerHTML = `
        <i class="fas ${icon}"></i>
        <span style="flex: 1;">${fileName}</span>
        <button type="button" class="btn-icon" onclick="removeCounselingFileFromSection('${fileName}', '${uploadedFilesListId}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    uploadedFilesList.appendChild(fileDiv);
}

// Remove file from counseling section
window.removeCounselingFileFromSection = function(fileName, sectionId) {
    counselingUploadedFiles = counselingUploadedFiles.filter(f => !(f.name === fileName && f.section === sectionId));
    const uploadedFilesList = document.getElementById(sectionId);
    if (!uploadedFilesList) return;
    
    const fileDivs = uploadedFilesList.querySelectorAll('.uploaded-file');
    fileDivs.forEach(div => {
        if (div.textContent.includes(fileName)) {
            div.remove();
        }
    });
};

// Make functions available globally
window.initCounselingTabs = initCounselingTabs;


