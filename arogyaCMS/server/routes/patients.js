/**
 * Patients API Routes
 */

const express = require('express');

function patientsRouter(db) {
    const router = express.Router();

    // Get all patients
    router.get('/', (req, res) => {
        const query = 'SELECT * FROM patients ORDER BY createdAt DESC';
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error fetching patients:', err);
                return res.status(500).json({ error: 'Failed to fetch patients' });
            }
            res.json(rows.map(row => parsePatientRow(row)));
        });
    });

    // Get patient by ID
    router.get('/:patientId', (req, res) => {
        const { patientId } = req.params;
        const query = 'SELECT * FROM patients WHERE patientId = ?';
        db.get(query, [patientId], (err, row) => {
            if (err) {
                console.error('Error fetching patient:', err);
                return res.status(500).json({ error: 'Failed to fetch patient' });
            }
            if (!row) {
                return res.status(404).json({ error: 'Patient not found' });
            }
            res.json(parsePatientRow(row));
        });
    });

    // Create or update patient
    router.post('/', (req, res) => {
        const patientData = req.body;
        const now = new Date().toISOString();

        // Check if patient exists
        db.get('SELECT * FROM patients WHERE patientId = ?', [patientData.patientId], (err, existing) => {
            if (err) {
                console.error('Error checking patient:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (existing) {
                // Update existing patient
                updatePatient(db, patientData, now, (updateErr, result) => {
                    if (updateErr) {
                        return res.status(500).json({ error: 'Failed to update patient' });
                    }
                    res.json(result);
                });
            } else {
                // Insert new patient
                insertPatient(db, patientData, now, (insertErr, result) => {
                    if (insertErr) {
                        return res.status(500).json({ error: 'Failed to create patient' });
                    }
                    res.status(201).json(result);
                });
            }
        });
    });

    // Update patient
    router.put('/:patientId', (req, res) => {
        const { patientId } = req.params;
        const patientData = { ...req.body, patientId };
        const now = new Date().toISOString();

        updatePatient(db, patientData, now, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to update patient' });
            }
            res.json(result);
        });
    });

    return router;
}

function insertPatient(db, data, now, callback) {
    // Count: 39 columns (excluding id which is AUTOINCREMENT)
    const query = `
        INSERT INTO patients (
            patientId, name, phone, dateOfBirth, primaryComplaint, complaintNotes,
            pastConditions, knownAllergies, familyHistory, previousSurgeries,
            ongoingTherapies, medications, documents, nursingNotes,
            treatmentOptions, patientConcerns, counselorRecommendations,
            estimatedCost, paymentPlanType, installmentAmount, installmentCount,
            paymentDiscussion, paymentStatus, counselingNotes,
            diagnosis, secondaryDiagnosis, observations, recommendations,
            prescriptions, labTests, scans, customTests, status,
            registrationDate, nursingDate, counselingDate, consultationDate,
            createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Count: 39 values to match 39 columns
    const values = [
        data.patientId,
        data.name || null,
        data.phone || null,
        data.dateOfBirth || null,
        data.primaryComplaint || null,
        data.complaintNotes || null,
        serializeValue(data.pastConditions),
        serializeValue(data.knownAllergies),
        serializeValue(data.familyHistory),
        serializeValue(data.previousSurgeries),
        serializeValue(data.ongoingTherapies),
        serializeValue(data.medications),
        serializeValue(data.documents),
        data.nursingNotes || null,
        data.treatmentOptions || null,
        data.patientConcerns || null,
        data.counselorRecommendations || null,
        data.estimatedCost || null,
        data.paymentPlanType || null,
        data.installmentAmount || null,
        data.installmentCount || null,
        data.paymentDiscussion || null,
        data.paymentStatus || null,
        data.counselingNotes || null,
        data.diagnosis || null,
        data.secondaryDiagnosis || null,
        data.observations || null,
        data.recommendations || null,
        serializeValue(data.prescriptions),
        serializeValue(data.labTests),
        serializeValue(data.scans),
        data.customTests || null,
        data.status || 'registered',
        data.registrationDate || now,
        data.nursingDate || null,
        data.counselingDate || null,
        data.consultationDate || null,
        now,  // createdAt
        now   // updatedAt
    ];

    db.run(query, values, function(err) {
        if (err) {
            console.error('Error inserting patient:', err);
            return callback(err);
        }
        // Fetch the created patient
        db.get('SELECT * FROM patients WHERE patientId = ?', [data.patientId], (fetchErr, row) => {
            if (fetchErr) return callback(fetchErr);
            callback(null, parsePatientRow(row));
        });
    });
}

function updatePatient(db, data, now, callback) {
    const query = `
        UPDATE patients SET
            name = COALESCE(?, name),
            phone = COALESCE(?, phone),
            dateOfBirth = COALESCE(?, dateOfBirth),
            primaryComplaint = COALESCE(?, primaryComplaint),
            complaintNotes = COALESCE(?, complaintNotes),
            pastConditions = COALESCE(?, pastConditions),
            knownAllergies = COALESCE(?, knownAllergies),
            familyHistory = COALESCE(?, familyHistory),
            previousSurgeries = COALESCE(?, previousSurgeries),
            ongoingTherapies = COALESCE(?, ongoingTherapies),
            medications = COALESCE(?, medications),
            documents = COALESCE(?, documents),
            nursingNotes = COALESCE(?, nursingNotes),
            treatmentOptions = COALESCE(?, treatmentOptions),
            patientConcerns = COALESCE(?, patientConcerns),
            counselorRecommendations = COALESCE(?, counselorRecommendations),
            estimatedCost = COALESCE(?, estimatedCost),
            paymentPlanType = COALESCE(?, paymentPlanType),
            installmentAmount = COALESCE(?, installmentAmount),
            installmentCount = COALESCE(?, installmentCount),
            paymentDiscussion = COALESCE(?, paymentDiscussion),
            paymentStatus = COALESCE(?, paymentStatus),
            counselingNotes = COALESCE(?, counselingNotes),
            diagnosis = COALESCE(?, diagnosis),
            secondaryDiagnosis = COALESCE(?, secondaryDiagnosis),
            observations = COALESCE(?, observations),
            recommendations = COALESCE(?, recommendations),
            prescriptions = COALESCE(?, prescriptions),
            labTests = COALESCE(?, labTests),
            scans = COALESCE(?, scans),
            customTests = COALESCE(?, customTests),
            status = COALESCE(?, status),
            registrationDate = COALESCE(?, registrationDate),
            nursingDate = COALESCE(?, nursingDate),
            counselingDate = COALESCE(?, counselingDate),
            consultationDate = COALESCE(?, consultationDate),
            updatedAt = ?
        WHERE patientId = ?
    `;

    const values = [
        data.name, data.phone, data.dateOfBirth, data.primaryComplaint, data.complaintNotes,
        serializeValue(data.pastConditions), serializeValue(data.knownAllergies),
        serializeValue(data.familyHistory), serializeValue(data.previousSurgeries),
        serializeValue(data.ongoingTherapies), serializeValue(data.medications),
        serializeValue(data.documents), data.nursingNotes, data.treatmentOptions,
        data.patientConcerns, data.counselorRecommendations, data.estimatedCost,
        data.paymentPlanType, data.installmentAmount, data.installmentCount,
        data.paymentDiscussion, data.paymentStatus, data.counselingNotes,
        data.diagnosis, data.secondaryDiagnosis, data.observations,
        data.recommendations, serializeValue(data.prescriptions),
        serializeValue(data.labTests), serializeValue(data.scans),
        data.customTests, data.status, data.registrationDate,
        data.nursingDate, data.counselingDate, data.consultationDate,
        now, data.patientId
    ];

    db.run(query, values, function(err) {
        if (err) {
            console.error('Error updating patient:', err);
            return callback(err);
        }
        // Fetch updated patient
        db.get('SELECT * FROM patients WHERE patientId = ?', [data.patientId], (fetchErr, row) => {
            if (fetchErr) return callback(fetchErr);
            callback(null, parsePatientRow(row));
        });
    });
}

function serializeValue(val) {
    if (val === null || val === undefined) return null;
    return typeof val === 'object' ? JSON.stringify(val) : val;
}

function parsePatientRow(row) {
    if (!row) return null;
    const parsed = { ...row };
    
    // Parse JSON fields
    const jsonFields = ['medications', 'documents', 'prescriptions', 'labTests', 'scans'];
    jsonFields.forEach(field => {
        if (parsed[field] && typeof parsed[field] === 'string') {
            try {
                parsed[field] = JSON.parse(parsed[field]);
            } catch (e) {
                // Keep as string if not valid JSON
            }
        }
    });
    
    return parsed;
}

module.exports = patientsRouter;

