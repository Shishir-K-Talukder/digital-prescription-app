

# Full-Stack Backend Plan for Rx Prescription App

## Summary
Set up Lovable Cloud (Supabase) with authentication, database tables, and integrate everything so doctors can log in, save/load prescriptions, manage patients, and persist all their settings.

## What Gets Built

### 1. Enable Lovable Cloud & Database
- Enable Lovable Cloud with Supabase integration
- Set up authentication (email/password login for doctors)

### 2. Database Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | Doctor info | name, degrees, specialization, bmdc_no, chamber_address, phone |
| `patients` | Patient records | name, age, sex, mobile, address, user_id (FK to doctor) |
| `prescriptions` | Saved prescriptions | patient_id, clinical_data (JSON), medicines (JSON), advice (JSON), created_at |
| `doctor_settings` | Print setup + medicine options | user_id, print_settings (JSON), medicine_options (JSON) |

All tables have RLS policies so each doctor only sees their own data.

### 3. Auth Pages
- **Login page** (`/login`) — email & password
- **Signup page** (`/signup`) — register new doctor
- **Protected routes** — redirect to login if not authenticated

### 4. Save & Load Features
- **Doctor profile**: Auto-loads on login, replaces localStorage
- **Print settings**: Saved per doctor in `doctor_settings` table
- **Medicine options** (dose/duration presets): Saved per doctor
- **Prescriptions**: Save button stores full prescription; history list to reload past prescriptions
- **Patient records**: Auto-saved when creating prescriptions; searchable patient list with history

### 5. UI Changes
- Add login/signup pages
- Add "Save Prescription" button in header
- Add "Prescription History" tab or sidebar
- Add "Patient List" accessible from the app
- Doctor info auto-populates from profile on login
- Print settings persist to cloud instead of localStorage

## Technical Details
- Lovable Cloud (Supabase) for database, auth, and RLS
- `onAuthStateChange` listener for session management
- Database trigger to auto-create doctor profile on signup
- JSON columns for flexible clinical/medicine/advice data storage
- All existing localStorage usage migrated to cloud storage

