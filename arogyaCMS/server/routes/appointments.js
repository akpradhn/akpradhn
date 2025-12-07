/**
 * Appointments API Routes
 */

const express = require('express');

function appointmentsRouter(db) {
    const router = express.Router();

    // Get all appointments or filter by date
    router.get('/', (req, res) => {
        const { date } = req.query;
        let query = 'SELECT * FROM appointments';
        const params = [];

        if (date) {
            query += ' WHERE date = ?';
            params.push(date);
        }

        query += ' ORDER BY createdAt DESC, date DESC, time DESC';

        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Error fetching appointments:', err);
                return res.status(500).json({ error: 'Failed to fetch appointments' });
            }
            res.json(rows);
        });
    });

    // Create appointment
    router.post('/', (req, res) => {
        const appointmentData = req.body;
        const now = new Date().toISOString();

        const query = `
            INSERT INTO appointments (patientId, patientName, date, time, status, type, notes, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            appointmentData.patientId,
            appointmentData.patientName,
            appointmentData.date,
            appointmentData.time,
            appointmentData.status || 'scheduled',
            appointmentData.type || 'consultation',
            appointmentData.notes || '',
            now
        ];

        db.run(query, values, function(err) {
            if (err) {
                console.error('Error creating appointment:', err);
                return res.status(500).json({ error: 'Failed to create appointment' });
            }
            res.status(201).json({ id: this.lastID, ...appointmentData });
        });
    });

    return router;
}

module.exports = appointmentsRouter;

