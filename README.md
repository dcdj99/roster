# Staff Multi-Location Daily Rostering

A React-based roster management system that helps organize staff assignments across multiple locations, built with React & Firebase.

## Demo

Try the live demo: [Staff Rostering System](https://rostering.web.app)

## Overview

This application streamlines the process of managing staff assignments across different locations throughout the week. It features:

- Staff management with OOF (Out of Office) preferences
- Location management
- Weekly location requirements
- Fixed day assignments
- Automatic roster generation
- Real-time updates with Firebase
- Mobile-responsive design

## Features

### Staff Management
- Add, edit, and remove staff members
- Set OOF preferences for each staff member
- Mobile-friendly OOF toggle interface

### Location Management
- Add and manage multiple locations
- Rename or remove locations as needed
- Assign fixed locations for specific days

### Roster Generation
- Automatic assignment distribution
- Respects OOF preferences
- Ensures minimum staffing requirements
- Maintains fixed day assignments
- Warning system for insufficient coverage

## Quick Start

1. **Installation**
```bash
# Clone the repository
git clone https://github.com/yourusername/roster.git

# Install dependencies
cd roster
npm install
```

2. **Firebase Setup**
```bash
# Create a .env file in the root directory with your Firebase configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. **Development**
```bash
# Start the development server
npm run dev
```

4. **Building for Production**
```bash
# Create a production build
npm run build
```

## Usage Guide

1. Add staff members through the Staff Management section
2. Create locations in the Location Management section
3. Set weekly location requirements for staff
4. Configure fixed day assignments if needed
5. Use the "Randomize Roster" button to generate assignments
6. Review and adjust the roster as needed

## Technical Stack

- React + Vite
- Firebase (Firestore, Authentication)
- Redux for state management
- React Router for navigation
- Responsive design for mobile support

## Development

### Project Structure
```
roster/
├── src/
│   ├── components/
│   ├── forms/
│   ├── hooks/
│   ├── pages/
│   ├── store/
│   ├── styles/
│   └── utils/
├── public/
└── firebase/
```

### Key Dependencies
- react
- react-router-dom
- @reduxjs/toolkit
- firebase
- vite

## License

MIT License

## Author

Darren Chow
