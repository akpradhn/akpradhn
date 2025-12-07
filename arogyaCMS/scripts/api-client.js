/**
 * API Client - Frontend interface to backend API
 * Replaces direct database access with HTTP API calls
 */

const API_BASE_URL = window.location.origin + '/api';

class APIClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Make API request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('API returned non-JSON response:', text.substring(0, 200));
                throw new Error(`API returned HTML instead of JSON. Check if server is running and API routes are registered.`);
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // Patients API
    async getPatients() {
        return this.request('/patients');
    }

    async getPatient(patientId) {
        return this.request(`/patients/${patientId}`);
    }

    async savePatient(patientData) {
        return this.request('/patients', {
            method: 'POST',
            body: patientData
        });
    }

    async updatePatient(patientId, updates) {
        return this.request(`/patients/${patientId}`, {
            method: 'PUT',
            body: updates
        });
    }

    // Appointments API
    async getAppointments(date = null) {
        const endpoint = date ? `/appointments?date=${date}` : '/appointments';
        return this.request(endpoint);
    }

    async saveAppointment(appointmentData) {
        return this.request('/appointments', {
            method: 'POST',
            body: appointmentData
        });
    }

    // Treatment Plans API
    async getTreatmentPlans(patientId = null) {
        const endpoint = patientId ? `/treatment-plans?patientId=${patientId}` : '/treatment-plans';
        console.log('APIClient.getTreatmentPlans - endpoint:', endpoint);
        try {
            const result = await this.request(endpoint);
            console.log('APIClient.getTreatmentPlans - result:', result);
            return result;
        } catch (error) {
            console.error('APIClient.getTreatmentPlans - error:', error);
            throw error;
        }
    }

    async saveTreatmentPlan(planData) {
        return this.request('/treatment-plans', {
            method: 'POST',
            body: planData
        });
    }

    async updateTreatmentPlan(planId, updates) {
        return this.request(`/treatment-plans/${planId}`, {
            method: 'PUT',
            body: updates
        });
    }

    // Timeline API
    async getPatientTimeline(patientId) {
        return this.request(`/timeline/${patientId}`);
    }

    async addTimelineEntry(patientId, phase, status, notes = '', createdBy = '') {
        return this.request('/timeline', {
            method: 'POST',
            body: { patientId, phase, status, notes, createdBy }
        });
    }

    async updatePhaseStatus(patientId, phaseName, status, notes = '', updatedBy = '') {
        return this.request('/timeline/phase-status', {
            method: 'POST',
            body: { patientId, phaseName, status, notes, updatedBy }
        });
    }

    // Auth API
    async login(username, password, role) {
        return this.request('/auth/login', {
            method: 'POST',
            body: { username, password, role }
        });
    }
}

// Create global API client instance
const api = new APIClient();

