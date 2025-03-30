# Verification System Integration Guide

This document explains how to integrate the verification link system into your BVC Dashboard application.

## Overview

The verification system allows you to:

1. Generate custom verification links for candidates
2. Share these links with candidates
3. Allow candidates to upload required verification documents
4. Review and verify uploaded documents
5. Track verification status in your dashboard

## Quick Integration Steps

1. **Add the VerificationSystem.jsx file** to your project in the `src/features/` directory
2. **Update your routing** in App.jsx to include the verification portal
3. **Connect the link generator** in your Overview page
4. **Add verification status tracking** to your candidate profiles
5. **Implement backend endpoints** to handle verification requests

## Detailed Integration Instructions

### 1. Add Routes in App.jsx

```jsx
// App.jsx
import { VerificationPortal } from './features/VerificationSystem';

// In your Routes component:
<Routes>
  {/* Existing routes */}
  <Route path="/verification/:verificationId" element={<VerificationPortal />} />
</Routes>
```

### 2. Connect Link Generator in Overview.jsx

```jsx
// Overview.jsx
import { VerificationLinkModal } from '../features/VerificationSystem';

function Overview() {
  // Add state for the modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  
  // In your JSX:
  return (
    <div>
      {/* Your existing UI */}
      
      {/* Add button to open modal */}
      <button 
        onClick={() => setShowLinkModal(true)}
        className="p-2 hover:bg-background-lighter rounded-lg transition-colors duration-200"
      >
        <LinkIcon className="w-5 h-5 text-gray-400 hover:text-primary" />
      </button>
      
      {/* Add the modal component */}
      <VerificationLinkModal 
        isOpen={showLinkModal} 
        onClose={() => setShowLinkModal(false)} 
        onLinkGenerated={(linkData) => {
          // Optional: Save the generated link data
          console.log('Link generated:', linkData);
        }}
      />
    </div>
  );
}
```

### 3. Add Verification Review to Candidate Profiles

```jsx
// In your candidate profile or details component
import { VerificationReview } from '../features/VerificationSystem';

function CandidateProfile({ candidateId }) {
  return (
    <div>
      {/* Existing candidate information */}
      
      {/* Add verification review panel */}
      <VerificationReview candidateId={candidateId} />
    </div>
  );
}
```

### 4. Backend Integration (API Endpoints)

For a complete solution, implement these endpoints:

```
POST /api/verification/create
- Creates a new verification request
- Request body: { candidateId, types: [] }
- Response: { id, link, expiresAt }

GET /api/verification/:id
- Gets verification details
- Response: { id, types, status, documents }

POST /api/verification/:id/document
- Uploads a document for verification
- Request body: FormData with 'file' and 'type'
- Response: { status, documentId }

PUT /api/verification/:id/status
- Updates verification status
- Request body: { type, status, reason }
- Response: { success, updatedAt }
```

## Workflow After Generating a Link

1. **Generate Link**: You create a verification link with selected requirements
2. **Share Link**: Send the link to candidate via email/message
3. **Candidate Access**: Candidate clicks link and is taken to the verification portal
4. **Document Upload**: Candidate uploads the required documents
5. **Review Process**: Your team reviews the uploaded documents
6. **Status Tracking**: Dashboard displays verification progress for each candidate
7. **Completion**: Verification is marked complete when all documents are verified

## Customizing the Verification System

You can modify:

- **Verification Types**: Edit the `VERIFICATION_TYPES` object to add/remove types
- **UI Appearance**: Update the component JSX/CSS to match your design
- **Validation Rules**: Add custom validation for different document types
- **Notifications**: Integrate with your notification system to alert on document uploads

## Dashboard Improvements

Consider adding these dashboard features to fully leverage the verification system:

1. **Verification Analytics**: Show verification completion rates
2. **Email Templates**: Create templates for sending verification links
3. **Batch Processing**: Generate links for multiple candidates at once
4. **Automated Verification**: Implement AI-based document verification
5. **Expiration Rules**: Add expiration dates to verification links

By following this guide, you'll have a complete verification link system integrated into your dashboard. 