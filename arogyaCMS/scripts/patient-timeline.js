/**
 * Patient Timeline Component
 * Shows the phases a patient has visited
 */

class PatientTimeline {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.phases = [
            { id: 'registration', name: 'Registration', icon: 'fa-user-plus', color: '#008080' },
            { id: 'nursing', name: 'Nursing', icon: 'fa-user-nurse', color: '#1E90FF' },
            { id: 'counseling', name: 'Counseling', icon: 'fa-comments', color: '#90EE90' },
            { id: 'consultation', name: 'Consultation', icon: 'fa-stethoscope', color: '#FFA500' },
            { id: 'treatment-plan', name: 'Treatment Plan', icon: 'fa-calendar-check', color: '#9370DB' }
        ];
    }

    /**
     * Render timeline for a patient
     */
    async render(patientId) {
        if (!this.container) return;

        const patient = await db.getPatient(patientId);
        if (!patient) {
            this.container.innerHTML = '<p>Patient not found</p>';
            return;
        }

        const timeline = await db.getPatientTimeline(patientId);
        
        // Determine phase statuses from patient data
        const phaseStatuses = this.getPhaseStatuses(patient, timeline);

        let html = '<div class="patient-timeline">';
        
        this.phases.forEach((phase, index) => {
            const status = phaseStatuses[phase.id] || 'pending';
            const isCompleted = status === 'completed';
            const isCurrent = status === 'in-progress';
            const isPending = status === 'pending';

            html += `
                <div class="timeline-item ${status}" data-phase="${phase.id}">
                    <div class="timeline-marker">
                        <i class="fas ${phase.icon}"></i>
                    </div>
                    <div class="timeline-content">
                        <h4>${phase.name}</h4>
                        <span class="timeline-status">${this.getStatusText(status)}</span>
                    </div>
                    ${index < this.phases.length - 1 ? '<div class="timeline-connector"></div>' : ''}
                </div>
            `;
        });

        html += '</div>';
        this.container.innerHTML = html;
    }

    /**
     * Get phase statuses from patient data
     */
    getPhaseStatuses(patient, timeline) {
        const statuses = {};

        // Registration
        if (patient.registrationDate) {
            statuses.registration = 'completed';
        } else {
            statuses.registration = 'pending';
        }

        // Nursing
        if (patient.nursingDate || patient.pastConditions) {
            statuses.nursing = 'completed';
        } else if (statuses.registration === 'completed') {
            statuses.nursing = 'pending';
        }

        // Counseling
        if (patient.counselingDate || patient.paymentPlanType) {
            statuses.counseling = 'completed';
        } else if (statuses.nursing === 'completed') {
            statuses.counseling = 'pending';
        }

        // Consultation
        if (patient.consultationDate || patient.diagnosis) {
            statuses.consultation = 'completed';
        } else if (statuses.counseling === 'completed') {
            statuses.consultation = 'pending';
        }

        // Treatment Plan
        // Check if treatment plan exists
        if (patient.treatmentPlanId) {
            statuses['treatment-plan'] = 'completed';
        } else if (statuses.consultation === 'completed') {
            statuses['treatment-plan'] = 'pending';
        }

        // Update from timeline if available
        timeline.forEach(entry => {
            const phaseId = entry.phase.toLowerCase().replace(/\s+/g, '-');
            if (this.phases.find(p => p.id === phaseId)) {
                statuses[phaseId] = entry.status;
            }
        });

        return statuses;
    }

    /**
     * Get status text
     */
    getStatusText(status) {
        const texts = {
            'completed': 'Completed',
            'in-progress': 'In Progress',
            'pending': 'Pending'
        };
        return texts[status] || 'Pending';
    }
}

// Global timeline instance
let patientTimeline = null;



