/**
 * Arogya CMS - Backend Server
 * Production-level SQLite database connection
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'acms.db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Database connection
let db = null;

function initDatabase() {
    return new Promise((resolve, reject) => {
        // Ensure data directory exists
        const fs = require('fs');
        const dataDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
            } else {
                console.log('Connected to SQLite database:', DB_PATH);
                createTables().then(resolve).catch(reject);
            }
        });
    });
}

function createTables() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Patients table
            db.run(`
                CREATE TABLE IF NOT EXISTS patients (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patientId TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    phone TEXT,
                    dateOfBirth TEXT,
                    primaryComplaint TEXT,
                    complaintNotes TEXT,
                    pastConditions TEXT,
                    knownAllergies TEXT,
                    familyHistory TEXT,
                    previousSurgeries TEXT,
                    ongoingTherapies TEXT,
                    medications TEXT,
                    documents TEXT,
                    nursingNotes TEXT,
                    treatmentOptions TEXT,
                    patientConcerns TEXT,
                    counselorRecommendations TEXT,
                    estimatedCost REAL,
                    paymentPlanType TEXT,
                    installmentAmount REAL,
                    installmentCount INTEGER,
                    paymentDiscussion TEXT,
                    paymentStatus TEXT,
                    counselingNotes TEXT,
                    diagnosis TEXT,
                    secondaryDiagnosis TEXT,
                    observations TEXT,
                    recommendations TEXT,
                    prescriptions TEXT,
                    labTests TEXT,
                    scans TEXT,
                    customTests TEXT,
                    status TEXT DEFAULT 'registered',
                    registrationDate TEXT,
                    nursingDate TEXT,
                    counselingDate TEXT,
                    consultationDate TEXT,
                    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Appointments table
            db.run(`
                CREATE TABLE IF NOT EXISTS appointments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patientId TEXT NOT NULL,
                    patientName TEXT,
                    date TEXT NOT NULL,
                    time TEXT,
                    status TEXT,
                    type TEXT,
                    notes TEXT,
                    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (patientId) REFERENCES patients(patientId)
                )
            `);

            // Treatment plans table
            db.run(`
                CREATE TABLE IF NOT EXISTS treatment_plans (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patientId TEXT NOT NULL,
                    templateId TEXT,
                    planName TEXT NOT NULL,
                    startDate TEXT,
                    phases TEXT,
                    notes TEXT,
                    status TEXT DEFAULT 'draft',
                    createdBy TEXT,
                    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (patientId) REFERENCES patients(patientId)
                )
            `);

            // Treatment phase status table
            db.run(`
                CREATE TABLE IF NOT EXISTS treatment_phase_status (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    treatmentPlanId INTEGER NOT NULL,
                    patientId TEXT NOT NULL,
                    phaseName TEXT NOT NULL,
                    phaseStatus TEXT DEFAULT 'pending',
                    startDate TEXT,
                    endDate TEXT,
                    completedDate TEXT,
                    notes TEXT,
                    updatedBy TEXT,
                    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (treatmentPlanId) REFERENCES treatment_plans(id),
                    FOREIGN KEY (patientId) REFERENCES patients(patientId)
                )
            `);

            // Patient timeline table
            db.run(`
                CREATE TABLE IF NOT EXISTS patient_timeline (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patientId TEXT NOT NULL,
                    phase TEXT NOT NULL,
                    status TEXT NOT NULL,
                    completedDate TEXT,
                    notes TEXT,
                    createdBy TEXT,
                    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (patientId) REFERENCES patients(patientId)
                )
            `);

            // Users table
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    name TEXT NOT NULL,
                    role TEXT NOT NULL,
                    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    reject(err);
                } else {
                    insertDefaultUsers().then(resolve).catch(reject);
                }
            });
        });
    });
}

function insertDefaultUsers() {
    return new Promise((resolve) => {
        const defaultUsers = [
            ['admin', process.env.ADMIN_PASSWORD || 'admin123', 'Admin User', 'admin'],
            ['reception', process.env.RECEPTION_PASSWORD || 'reception123', 'Reception Staff', 'reception'],
            ['nurse', process.env.NURSE_PASSWORD || 'nurse123', 'Nurse Staff', 'nurse'],
            ['counselor', process.env.COUNSELOR_PASSWORD || 'counselor123', 'Counselor Staff', 'counselor'],
            ['doctor', process.env.DOCTOR_PASSWORD || 'doctor123', 'Dr. Smith', 'doctor'],
            ['embryologist', process.env.EMBRYOLOGIST_PASSWORD || 'embryo123', 'Embryologist Staff', 'embryologist']
        ];

        const stmt = db.prepare('INSERT OR IGNORE INTO users (username, password, name, role) VALUES (?, ?, ?, ?)');
        defaultUsers.forEach(([username, password, name, role]) => {
            stmt.run([username, password, name, role]);
        });
        stmt.finalize();
        
        // Run migrations after creating tables
        runMigrations().then(resolve).catch(resolve);
    });
}

function runMigrations() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Migration: Add notes column to appointments table if it doesn't exist
            db.run(`
                ALTER TABLE appointments 
                ADD COLUMN notes TEXT
            `, (err) => {
                // Ignore error if column already exists
                if (err && !err.message.includes('duplicate column name')) {
                    console.warn('Migration warning (expected if column exists):', err.message);
                }
            });
            
            // Add more migrations here as needed
            resolve();
        });
    });
}

// API Routes - Will be registered after database initialization
let patientsRouter, appointmentsRouter, treatmentPlansRouter, authRouter, timelineRouter;

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'connected' });
});

// Initialize and start server
initDatabase()
    .then(() => {
        // Register routes after database is initialized
        patientsRouter = require('./routes/patients');
        appointmentsRouter = require('./routes/appointments');
        treatmentPlansRouter = require('./routes/treatment-plans');
        authRouter = require('./routes/auth');
        timelineRouter = require('./routes/timeline');

        app.use('/api/patients', patientsRouter(db));
        app.use('/api/appointments', appointmentsRouter(db));
        app.use('/api/treatment-plans', treatmentPlansRouter(db));
        app.use('/api/auth', authRouter(db));
        app.use('/api/timeline', timelineRouter(db));

        // Serve frontend - MUST be last, after all API routes
        // Only serve HTML for non-API routes
        app.get('*', (req, res) => {
            // Skip API routes (shouldn't reach here if API routes are working)
            if (req.path.startsWith('/api/')) {
                return res.status(404).json({ error: 'API endpoint not found' });
            }
            // Serve HTML files
            const filePath = path.join(__dirname, '..', req.path === '/' ? 'login.html' : req.path);
            res.sendFile(filePath, (err) => {
                if (err) {
                    // If file doesn't exist, serve login.html
                    res.sendFile(path.join(__dirname, '..', 'login.html'));
                }
            });
        });

        app.listen(PORT, () => {
            console.log(`\n${'='.repeat(50)}`);
            console.log(`Arogya CMS Server running on port ${PORT}`);
            console.log(`Database: ${DB_PATH}`);
            console.log(`Frontend: http://localhost:${PORT}/login.html`);
            console.log(`${'='.repeat(50)}\n`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize server:', err);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGINT', () => {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed');
            }
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

module.exports = { app, db };

