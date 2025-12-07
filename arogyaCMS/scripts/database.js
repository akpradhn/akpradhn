/**
 * Database Layer - API Client Wrapper
 * All database operations go through the backend API
 * Uses production SQLite database file
 */

class Database {
    constructor() {
        // Check if API client is available
        if (typeof api === 'undefined') {
            console.warn('API client not loaded. Make sure api-client.js is included.');
        }
    }

    /**
     * Get all patients
     */
    async getPatients() {
        try {
            return await api.getPatients();
        } catch (error) {
            console.error('Error getting patients:', error);
            return [];
        }
    }
    
    /**
     * Get patient by ID
     */
    async getPatient(patientId) {
        try {
            return await api.getPatient(patientId);
        } catch (error) {
            console.error('Error getting patient:', error);
            return null;
        }
    }
    
    /**
     * Save patient
     */
    async savePatient(patientData) {
        try {
            return await api.savePatient(patientData);
        } catch (error) {
            console.error('Error saving patient:', error);
            return null;
        }
    }
    
    /**
     * Get appointments
     */
    async getAppointments(date = null) {
        try {
            return await api.getAppointments(date);
        } catch (error) {
            console.error('Error getting appointments:', error);
            return [];
        }
    }
    
    /**
     * Save appointment
     */
    async saveAppointment(appointmentData) {
        try {
            return await api.saveAppointment(appointmentData);
        } catch (error) {
            console.error('Error saving appointment:', error);
            return null;
        }
    }
    
    /**
     * Get treatment plans
     */
    async getTreatmentPlans(patientId = null) {
        try {
            console.log('Database.getTreatmentPlans called with patientId:', patientId);
            const result = await api.getTreatmentPlans(patientId);
            console.log('API returned:', result);
            console.log('Result type:', typeof result);
            console.log('Is array:', Array.isArray(result));
            return result || [];
        } catch (error) {
            console.error('Error getting treatment plans:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            // Return empty array instead of throwing
            return [];
        }
    }
    
    /**
     * Save treatment plan
     */
    async saveTreatmentPlan(planData) {
        try {
            return await api.saveTreatmentPlan(planData);
        } catch (error) {
            console.error('Error saving treatment plan:', error);
            return null;
        }
    }
    
    /**
     * Update treatment plan
     */
    async updateTreatmentPlan(planId, updates) {
        try {
            return await api.updateTreatmentPlan(planId, updates);
        } catch (error) {
            console.error('Error updating treatment plan:', error);
            return null;
        }
    }

    /**
     * Update treatment phase status
     */
    async updatePhaseStatus(patientId, phaseName, status, notes = '', updatedBy = '') {
        try {
            return await api.updatePhaseStatus(patientId, phaseName, status, notes, updatedBy);
        } catch (error) {
            console.error('Error updating phase status:', error);
            return null;
        }
    }

    /**
     * Get patient timeline
     */
    async getPatientTimeline(patientId) {
        try {
            return await api.getPatientTimeline(patientId);
        } catch (error) {
            console.error('Error getting timeline:', error);
            return [];
        }
    }

    /**
     * Add timeline entry
     */
    async addTimelineEntry(patientId, phase, status, notes = '', createdBy = '') {
        try {
            return await api.addTimelineEntry(patientId, phase, status, notes, createdBy);
        } catch (error) {
            console.error('Error adding timeline entry:', error);
            return null;
        }
    }

    /**
     * Get treatment templates
     */
    getTreatmentTemplates() {
        // Return static templates (can be moved to API later)
        return [
            {
                id: 'ivf_standard',
                name: 'IVF Standard Cycle',
                type: 'ivf',
                phases: [
                    {
                        phase: 'I. Preparation',
                        steps: 'Testing, uterine check, and protocol setup',
                        duration: '2-4 Weeks',
                        startTime: 'Prior to cycle start (often with prior menstrual period)'
                    },
                    {
                        phase: 'II. Stimulation',
                        steps: 'Ovarian Stimulation: Daily hormone injections and frequent monitoring',
                        duration: '8-14 Days',
                        startTime: 'Day 2 or 3 of menstrual cycle'
                    },
                    {
                        phase: 'III. Retrieval',
                        steps: 'The Trigger Shot: Final injection to mature eggs',
                        duration: '34-36 Hours',
                        startTime: 'Mid-cycle, when follicles are mature'
                    },
                    {
                        phase: 'IV. Laboratory',
                        steps: 'Egg Retrieval & Sperm Collection: Collection of gametes',
                        duration: '1 Day',
                        startTime: '34-36 hours after trigger shot'
                    },
                    {
                        phase: 'V. Embryo Culture',
                        steps: 'Fertilization: Eggs and sperm combine',
                        duration: '3-6 Days',
                        startTime: 'Starts immediately after retrieval'
                    },
                    {
                        phase: 'VI. Transfer',
                        steps: 'Embryo Transfer: Selected embryo placed into uterus',
                        duration: '1 Day',
                        startTime: 'Day 3 or Day 5 after retrieval'
                    },
                    {
                        phase: 'VII. Result',
                        steps: 'Luteal Support: Medication to maintain uterine lining. Pregnancy Test: Blood test for hCG',
                        duration: '9-14 Days',
                        startTime: 'Begins immediately after transfer (Two-Week Wait)'
                    }
                ]
            },
            {
                id: 'iui_standard',
                name: 'IUI Standard Cycle',
                type: 'iui',
                phases: [
                    {
                        phase: 'I. Preparation',
                        steps: 'Baseline testing and monitoring',
                        duration: '1-2 Weeks',
                        startTime: 'Day 1 of menstrual cycle'
                    },
                    {
                        phase: 'II. Stimulation',
                        steps: 'Ovulation induction',
                        duration: '5-10 Days',
                        startTime: 'Day 3-5 of cycle'
                    },
                    {
                        phase: 'III. Insemination',
                        steps: 'IUI procedure',
                        duration: '1 Day',
                        startTime: 'When ovulation is detected'
                    },
                    {
                        phase: 'IV. Result',
                        steps: 'Pregnancy test',
                        duration: '14 Days',
                        startTime: '14 days after insemination'
                    }
                ]
            }
        ];
    }
}

// Create global database instance
const db = new Database();
