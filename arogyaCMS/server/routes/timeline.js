/**
 * Patient Timeline API Routes
 */

const express = require('express');

function timelineRouter(db) {
    const router = express.Router();

    // Get patient timeline
    router.get('/:patientId', (req, res) => {
        const { patientId } = req.params;
        const query = 'SELECT * FROM patient_timeline WHERE patientId = ? ORDER BY createdAt ASC';
        
        db.all(query, [patientId], (err, rows) => {
            if (err) {
                console.error('Error fetching timeline:', err);
                return res.status(500).json({ error: 'Failed to fetch timeline' });
            }
            res.json(rows);
        });
    });

    // Add timeline entry
    router.post('/', (req, res) => {
        const { patientId, phase, status, notes, createdBy } = req.body;
        const now = new Date().toISOString();

        const query = `
            INSERT INTO patient_timeline (patientId, phase, status, completedDate, notes, createdBy, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            patientId,
            phase,
            status,
            status === 'completed' ? now : null,
            notes || '',
            createdBy || '',
            now
        ];

        db.run(query, values, function(err) {
            if (err) {
                console.error('Error adding timeline entry:', err);
                return res.status(500).json({ error: 'Failed to add timeline entry' });
            }
            res.status(201).json({ id: this.lastID, ...req.body });
        });
    });

    // Update phase status
    router.post('/phase-status', (req, res) => {
        const { patientId, phaseName, status, notes, updatedBy } = req.body;
        const now = new Date().toISOString();

        // Get latest treatment plan for patient
        db.get('SELECT id FROM treatment_plans WHERE patientId = ? ORDER BY createdAt DESC LIMIT 1', 
            [patientId], (err, plan) => {
                if (err || !plan) {
                    return res.status(500).json({ error: 'Treatment plan not found' });
                }

                const planId = plan.id;

                // Check if phase status exists
                db.get('SELECT * FROM treatment_phase_status WHERE treatmentPlanId = ? AND phaseName = ?',
                    [planId, phaseName], (err, existing) => {
                        if (err) {
                            return res.status(500).json({ error: 'Database error' });
                        }

                        if (existing) {
                            // Update existing
                            const updateQuery = `
                                UPDATE treatment_phase_status 
                                SET phaseStatus = ?, notes = ?, updatedBy = ?, updatedAt = ?, completedDate = ?
                                WHERE treatmentPlanId = ? AND phaseName = ?
                            `;
                            db.run(updateQuery, 
                                [status, notes || '', updatedBy || '', now, 
                                 status === 'completed' ? now : null, planId, phaseName],
                                (updateErr) => {
                                    if (updateErr) {
                                        return res.status(500).json({ error: 'Failed to update phase status' });
                                    }
                                    // Add timeline entry
                                    addTimelineEntry(db, patientId, phaseName, status, notes, updatedBy);
                                    res.json({ success: true });
                                });
                        } else {
                            // Insert new
                            const insertQuery = `
                                INSERT INTO treatment_phase_status 
                                (treatmentPlanId, patientId, phaseName, phaseStatus, notes, updatedBy, updatedAt, completedDate)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            `;
                            db.run(insertQuery,
                                [planId, patientId, phaseName, status, notes || '', updatedBy || '', now,
                                 status === 'completed' ? now : null],
                                (insertErr) => {
                                    if (insertErr) {
                                        return res.status(500).json({ error: 'Failed to create phase status' });
                                    }
                                    // Add timeline entry
                                    addTimelineEntry(db, patientId, phaseName, status, notes, updatedBy);
                                    res.json({ success: true });
                                });
                        }
                    });
            });
    });

    return router;
}

function addTimelineEntry(db, patientId, phase, status, notes, createdBy) {
    const now = new Date().toISOString();
    const query = `
        INSERT INTO patient_timeline (patientId, phase, status, completedDate, notes, createdBy, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [patientId, phase, status, status === 'completed' ? now : null, notes || '', createdBy || '', now],
        (err) => {
            if (err) console.error('Error adding timeline entry:', err);
        });
}

module.exports = timelineRouter;



