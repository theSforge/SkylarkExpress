# Skylark Tracking - Courier Tracking Website

A modern, responsive courier tracking website built with HTML, CSS, JavaScript, and Firebase Firestore integration featuring glassmorphism design and cutting-edge UI/UX.

## Features

- **Real-time Package Tracking**: Search and track packages using tracking IDs
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Firebase Integration**: Uses Firestore for data storage and retrieval
- **Contact Form**: Allows customers to submit inquiries with Firestore storage
- **Timeline View**: Visual tracking history with status updates
- **Modern UI**: Glassmorphism design with smooth animations and micro-interactions
- **Latest Design Trends**: CSS custom properties, modern typography, and advanced visual effects

## Pages

1. **Homepage** (`index.html`) - Package tracking search and company overview
2. **About Us** (`about.html`) - Company information, team, and mission
3. **Services** (`services.html`) - Detailed service offerings and pricing
4. **Contact** (`contact.html`) - Contact form and company contact information

## Project Structure

```
SKYLARK/
├── index.html          # Homepage with tracking functionality
├── about.html          # About us page
├── services.html       # Services page
├── contact.html        # Contact page
├── styles.css          # Main stylesheet
├── script.js           # JavaScript functionality
├── firebase-config.js  # Firebase configuration
└── README.md          # This file
```

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Firestore Database:
   - Go to "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in test mode" for development
4. Get your Firebase configuration:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Click "Web" icon to add a web app
   - Copy the configuration object

### 2. Configure Firebase

1. Open `firebase-config.js`
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-actual-sender-id",
    appId: "your-actual-app-id"
};
```

### 3. Firestore Database Structure

Create the following collections in your Firestore database:

#### Packages Collection (`packages`)
Document ID: Tracking ID (e.g., "TRK123456789")

```json
{
  "trackingId": "TRK123456789",
  "status": "in-transit",
  "currentLocation": "Distribution Center, New York",
  "lastUpdated": "2024-01-15T10:30:00Z",
  "recipient": "John Doe",
  "destination": "Los Angeles, CA",
  "estimatedDelivery": "2024-01-17T18:00:00Z",
  "history": [
    {
      "date": "2024-01-13T09:00:00Z",
      "status": "Package picked up",
      "location": "Origin Facility, Chicago",
      "isCurrent": false
    },
    {
      "date": "2024-01-14T14:30:00Z",
      "status": "In transit",
      "location": "Sorting Facility, Denver",
      "isCurrent": false
    },
    {
      "date": "2024-01-15T10:30:00Z",
      "status": "Arrived at facility",
      "location": "Distribution Center, New York",
      "isCurrent": true
    }
  ]
}
```

#### Contact Messages Collection (`contact-messages`)
Auto-generated document IDs

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "tracking",
  "trackingId": "TRK123456789",
  "message": "I need help with my package tracking",
  "newsletter": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 4. Deployment

1. Upload all files to your web hosting provider
2. Ensure your hosting supports HTTPS (required for Firebase)
3. Update Firebase project settings to include your domain in authorized domains

## Demo Data

The website includes demo tracking data that works without Firebase configuration:

- **TRK123456789** - In-transit package
- **TRK987654321** - Delivered package

## Status Types

The system supports the following package statuses:

- `pending` - Package is being prepared
- `picked-up` - Package has been picked up
- `in-transit` - Package is in transit
- `out-for-delivery` - Package is out for delivery
- `delivered` - Package has been delivered
- `exception` - Exception occurred during delivery
- `returned` - Package has been returned

## Customization

### Styling
- Modify `styles.css` to change colors, fonts, and layout
- The CSS uses CSS Grid and Flexbox for responsive design
- Modern color scheme with CSS custom properties and glassmorphism effects
- Uses Inter and Space Grotesk fonts for modern typography
- Includes hover animations, micro-interactions, and smooth transitions

### Functionality
- Add new tracking statuses in the `formatStatus()` function in `script.js`
- Modify the Firestore collection structure as needed
- Add email notifications by integrating with email services

### Branding
- Replace "Skylark Tracking" with your company name throughout all files
- Update contact information in all HTML files (currently set to info@skylarktracking.com)
- Replace placeholder content with your actual company information

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Security Notes

1. **Firebase Rules**: Update Firestore security rules for production:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow read access to packages
       match /packages/{document} {
         allow read: if true;
       }
       // Allow write access to contact messages
       match /contact-messages/{document} {
         allow create: if true;
       }
     }
   }
   ```

2. **API Keys**: Firebase web API keys are safe to include in client-side code, but ensure your Firestore rules properly restrict access.

3. **HTTPS**: Always use HTTPS in production for security and Firebase compatibility.

## Troubleshooting

### Common Issues

1. **Firebase not loading**: Check that your API keys are correct and the project ID matches
2. **Tracking not working**: Verify Firestore rules allow read access to the packages collection
3. **Contact form not submitting**: Check Firestore rules allow write access to contact-messages collection
4. **Mobile menu not working**: Ensure JavaScript is enabled and loading properly

### Demo Mode
If Firebase is not configured, the website automatically falls back to demo data for testing purposes.

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support or questions about this courier tracking website, please contact your development team or create an issue in the project repository.
