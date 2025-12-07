# Arogya Clinical Management System (ACMS)

A comprehensive web-based clinical management system for healthcare facilities, featuring patient registration, medical history tracking, counseling, consultations, and treatment plan management.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Installation & Setup](#installation--setup)
- [Login Credentials](#login-credentials)
- [Project Structure](#project-structure)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Workflow](#workflow)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## Features

- **Multi-Role System**: Reception, Nurse, Counselor, Doctor, Embryologist, Admin
- **Complete Patient Flow**: Registration → Nursing → Counseling → Consultation → Treatment Plan
- **Production SQLite Database**: Real `.db` file (compatible with DB Browser for SQLite)
- **RESTful API**: Modular backend with Express.js
- **Environment Variables**: Secure credential management
- **Patient Timeline**: Visual tracking of patient journey
- **Treatment Plans**: Predefined templates (IVF, IUI) with customizable phases

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3 (production-ready `.db` file)
- **API**: RESTful endpoints

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation & Setup

1. **Navigate to project directory**
   ```bash
   cd /Users/amitkp/Documents/github/arogyaCMS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials (optional - defaults work for development)
   ```

4. **Start the server**
   ```bash
   ./start.sh
   ```
   
   This will:
   - Create Python virtual environment (if needed)
   - Install Node.js dependencies
   - Start the backend server
   - Open browser automatically
   
   **Alternative:** `npm start` (manual start)

5. **Access the application**
   - URL: http://localhost:8000/login.html
   - Browser should open automatically

6. **Stop the server**
   ```bash
   ./stop.sh
   # or press Ctrl+C in terminal
   ```

## Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Reception | `reception` | `reception123` |
| Nurse | `nurse` | `nurse123` |
| Counselor | `counselor` | `counselor123` |
| Doctor | `doctor` | `doctor123` |
| Embryologist | `embryologist` | `embryo123` |

**Note**: Change these in `.env` file for production!

## Project Structure

```
arogyaCMS/
├── server/
│   ├── app.js                 # Main server file
│   ├── routes/                # Modular route handlers
│   │   ├── patients.js
│   │   ├── appointments.js
│   │   ├── treatment-plans.js
│   │   ├── auth.js
│   │   └── timeline.js
│   └── data/
│       └── acms.db            # SQLite database file
├── scripts/
│   ├── api-client.js          # Frontend API client
│   ├── database.js            # Database abstraction layer
│   ├── auth.js                # Authentication
│   ├── main.js                # Utilities
│   └── [page-specific].js     # Page scripts
├── styles/
│   └── main.css               # Main stylesheet
├── *.html                     # Frontend pages
├── package.json               # Node.js dependencies
├── .env                       # Environment variables (create from .env.example)
├── start.sh                   # Startup script
└── stop.sh                    # Stop script
```

## Database

The application uses a **production SQLite database** stored at `server/data/acms.db`. This file can be:
- Opened with [DB Browser for SQLite](https://sqlitebrowser.org/)
- Backed up by copying the `.db` file
- Migrated to other SQLite-compatible systems

### Database Schema

- `patients` - Patient information
- `appointments` - Appointment scheduling
- `treatment_plans` - Treatment plan templates and instances
- `treatment_phase_status` - Phase completion tracking
- `patient_timeline` - Patient journey timeline
- `users` - User authentication

## API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:patientId` - Get patient by ID
- `POST /api/patients` - Create/update patient
- `PUT /api/patients/:patientId` - Update patient

### Appointments
- `GET /api/appointments?date=YYYY-MM-DD` - Get appointments
- `POST /api/appointments` - Create appointment

### Treatment Plans
- `GET /api/treatment-plans?patientId=xxx` - Get treatment plans
- `POST /api/treatment-plans` - Create treatment plan
- `PUT /api/treatment-plans/:id` - Update treatment plan

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/users` - Get all users (admin)

### Timeline
- `GET /api/timeline/:patientId` - Get patient timeline
- `POST /api/timeline` - Add timeline entry
- `POST /api/timeline/phase-status` - Update phase status

## Workflow

1. **Registration** (Reception)
   - Register new patient
   - Create appointment

2. **Nursing** (Nurse)
   - Collect medical history
   - Document past conditions, allergies, medications

3. **Counseling** (Counselor)
   - Discuss treatment options
   - Plan payment structure

4. **Consultation** (Doctor)
   - Diagnosis
   - Prescriptions
   - Lab tests

5. **Treatment Plan** (Doctor/Embryologist)
   - Select template (IVF/IUI)
   - Customize phases and dates
   - Track phase completion

6. **Patient Summary**
   - View complete patient journey
   - Timeline visualization

## Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
PORT=8000
NODE_ENV=development
DB_PATH=./server/data/acms.db

# User Credentials
ADMIN_PASSWORD=admin123
RECEPTION_PASSWORD=reception123
NURSE_PASSWORD=nurse123
COUNSELOR_PASSWORD=counselor123
DOCTOR_PASSWORD=doctor123
EMBRYOLOGIST_PASSWORD=embryo123

JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:8000
```

## Development

### Running in Development Mode

```bash
npm run dev  # Uses nodemon for auto-reload
```

### Database Management

The database file is at `server/data/acms.db`. You can:
- Open it with DB Browser for SQLite
- Backup by copying the file
- Reset by deleting the file (will recreate on next start)

## Troubleshooting

### Patients not showing in list
- **Solution**: Ensure backend server is running (`npm start` or `./start.sh`)
- Check browser console (F12) for API errors
- Verify database file exists at `server/data/acms.db`
- Try refreshing the dashboard page

### Port already in use
```bash
./stop.sh  # Stop existing server
# or manually:
lsof -ti:8000 | xargs kill -9
```

### Database errors
- Ensure `server/data/` directory exists (created automatically on first run)
- Check file permissions on `server/data/acms.db`
- Verify `.env` file has correct `DB_PATH` (default: `./server/data/acms.db`)
- Delete `server/data/acms.db` to reset database (will recreate on restart)

### Server won't start
- Check if Node.js is installed: `node --version`
- Check if dependencies are installed: `npm install`
- Check server logs: `cat server.log`
- Verify port 8000 is available

### API connection errors
- Ensure backend server is running
- Check CORS settings in `.env` file
- Verify API base URL in browser console
- Check network tab in browser DevTools

## Production Deployment

### Pre-deployment Checklist

1. **Change default passwords** in `.env` file
2. **Set `NODE_ENV=production`** in `.env`
3. **Update `CORS_ORIGIN`** to your production domain
4. **Change `JWT_SECRET`** to a strong random string
5. **Set up database backups** (copy `server/data/acms.db` regularly)
6. **Use a process manager** (PM2 recommended):
   ```bash
   npm install -g pm2
   pm2 start server/app.js --name acms
   pm2 save
   pm2 startup
   ```
7. **Enable HTTPS** (use reverse proxy like Nginx)
8. **Configure firewall** to allow only necessary ports

### Database Backup

```bash
# Manual backup
cp server/data/acms.db server/data/acms.db.backup.$(date +%Y%m%d)

# Restore from backup
cp server/data/acms.db.backup.YYYYMMDD server/data/acms.db
```

### Using DB Browser for SQLite

1. Download from: https://sqlitebrowser.org/
2. Open `server/data/acms.db`
3. View/edit tables directly
4. Export data as CSV/JSON
5. Run SQL queries

## License

ISC

## Support

For issues and questions:
- Check this README first
- Review browser console for errors
- Check server logs: `cat server.log`
- Verify database with DB Browser for SQLite
