/**
 * Treatment Plans API Routes
 */

const express = require('express');

function treatmentPlansRouter(db) {
    const router = express.Router();

    // Get all treatment plans or filter by patientId
    router.get('/', (req, res) => {
        const { patientId } = req.query;
        let query = 'SELECT * FROM treatment_plans';
        const params = [];

        if (patientId) {
            query += ' WHERE patientId = ?';
            params.push(patientId);
        }

        query += ' ORDER BY createdAt DESC';

        console.log('GET /api/treatment-plans - Query:', query);
        console.log('GET /api/treatment-plans - Params:', params);

        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Error fetching treatment plans:', err);
                return res.status(500).json({ error: 'Failed to fetch treatment plans' });
            }
            console.log('GET /api/treatment-plans - Found', rows.length, 'treatment plans');
            if (rows.length > 0) {
                console.log('Sample plan:', rows[0]);
            }
            res.json(rows.map(row => parsePlanRow(row)));
        });
    });

    // Get treatment plan by ID
    router.get('/:id', (req, res) => {
        const { id } = req.params;
        db.get('SELECT * FROM treatment_plans WHERE id = ?', [id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch treatment plan' });
            }
            if (!row) {
                return res.status(404).json({ error: 'Treatment plan not found' });
            }
            res.json(parsePlanRow(row));
        });
    });

    // Create treatment plan
    router.post('/', (req, res) => {
        const planData = req.body;
        const now = new Date().toISOString();

        console.log('POST /api/treatment-plans - Received plan data:', planData);

        const query = `
            INSERT INTO treatment_plans (patientId, templateId, planName, startDate, phases, notes, status, createdBy, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            planData.patientId,
            planData.templateId || null,
            planData.planName,
            planData.startDate,
            JSON.stringify(planData.phases || []),
            planData.notes || '',
            planData.status || 'draft',
            planData.createdBy || null,
            now,
            now
        ];

        console.log('POST /api/treatment-plans - Inserting with values:', values);

        db.run(query, values, function(err) {
            if (err) {
                console.error('Error creating treatment plan:', err);
                console.error('Error details:', {
                    message: err.message,
                    code: err.code,
                    stack: err.stack
                });
                return res.status(500).json({ error: 'Failed to create treatment plan: ' + err.message });
            }
            console.log('Treatment plan created successfully with ID:', this.lastID);
            db.get('SELECT * FROM treatment_plans WHERE id = ?', [this.lastID], (fetchErr, row) => {
                if (fetchErr) {
                    console.error('Error fetching created plan:', fetchErr);
                    return res.status(500).json({ error: 'Failed to fetch created plan' });
                }
                const parsedPlan = parsePlanRow(row);
                console.log('Returning created plan:', parsedPlan);
                res.status(201).json(parsedPlan);
            });
        });
    });

    // Update treatment plan
    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const updates = req.body;
        const now = new Date().toISOString();

        const allowedFields = ['templateId', 'planName', 'startDate', 'phases', 'notes', 'status', 'createdBy'];
        const setParts = [];
        const values = [];

        allowedFields.forEach(field => {
            if (updates.hasOwnProperty(field)) {
                setParts.push(`${field} = ?`);
                const val = updates[field];
                values.push(typeof val === 'object' ? JSON.stringify(val) : val);
            }
        });

        if (setParts.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        setParts.push('updatedAt = ?');
        values.push(now, id);

        const query = `UPDATE treatment_plans SET ${setParts.join(', ')} WHERE id = ?`;

        db.run(query, values, function(err) {
            if (err) {
                console.error('Error updating treatment plan:', err);
                return res.status(500).json({ error: 'Failed to update treatment plan' });
            }
            db.get('SELECT * FROM treatment_plans WHERE id = ?', [id], (fetchErr, row) => {
                if (fetchErr) return res.status(500).json({ error: 'Failed to fetch updated plan' });
                res.json(parsePlanRow(row));
            });
        });
    });

    return router;
}

function parsePlanRow(row) {
    if (!row) return null;
    const parsed = { ...row };
    if (parsed.phases && typeof parsed.phases === 'string') {
        try {
            parsed.phases = JSON.parse(parsed.phases);
        } catch (e) {
            parsed.phases = [];
        }
    }
    return parsed;
}

module.exports = treatmentPlansRouter;


