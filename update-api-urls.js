// Script to update all localhost references to use API config
const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'frontend/src/pages/Clients.jsx',
  'frontend/src/pages/Cases.jsx',
  'frontend/src/pages/auth/ForgotPassword.jsx',
  'frontend/src/pages/auth/EmailVerification.jsx',
  'frontend/src/pages/auth/OAuthCallback.jsx',
  'frontend/src/pages/auth/ResetPassword.jsx',
  'frontend/src/pages/Users.jsx',
  'frontend/src/pages/documents/UploadDocument.jsx',
  'frontend/src/pages/cases/CaseTimeline.jsx',
  'frontend/src/pages/cases/CaseParties.jsx',
  'frontend/src/pages/cases/CaseNotes.jsx',
  'frontend/src/pages/cases/CaseCalendar.jsx',
  'frontend/src/pages/cases/CaseBilling.jsx',
  'frontend/src/pages/cases/CaseAnalytics.jsx',
  'frontend/src/pages/users/EditUser.jsx',
  'frontend/src/pages/users/AddUser.jsx',
  'frontend/src/pages/users/ActivityLogs.jsx',
  'frontend/src/pages/clients/ConflictCheck.jsx',
  'frontend/src/pages/clients/ClientDocuments.jsx',
  'frontend/src/pages/clients/ClientCommunication.jsx',
  'frontend/src/pages/clients/ClientBillingSummary.jsx',
  'frontend/src/pages/clients/ClientAssociatedCases.jsx',
  'frontend/src/pages/users/RoleManagement.jsx',
  'frontend/src/pages/users/OrganizationProfile.jsx',
  'frontend/src/pages/dashboard/AdminDashboard.jsx',
  'frontend/src/pages/dashboard/ParalegalDashboard.jsx',
  'frontend/src/pages/users/SubscriptionManagement.jsx',
  'frontend/src/pages/dashboard/LawyerDashboard.jsx',
  'frontend/src/pages/users/TeamManagement.jsx',
  'frontend/src/pages/dashboard/FinanceDashboard.jsx',
  'frontend/src/pages/users/UserProfile.jsx',
  'frontend/src/pages/Documents.jsx',
  'frontend/src/pages/dashboard/ClientDashboard.jsx',
  'frontend/src/pages/Tasks.jsx',
  'frontend/src/pages/Invoices.jsx',
  'frontend/src/pages/ClientDetail.jsx',
  'frontend/src/pages/InvoiceDetail.jsx',
  'frontend/src/pages/CaseDetail.jsx',
  'frontend/src/pages/TimeTracking.jsx',
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Add import if not present and file uses axios or localhost
    if (content.includes('http://localhost:5000') && !content.includes('from "../config/api"')) {
      // Find the last import statement
      const importMatch = content.match(/(import.*from.*;[\s]*\n)+/);
      if (importMatch) {
        const lastImport = importMatch[0];
        const newImport = 'import { getApiUrl } from "../config/api";\n';
        if (!content.includes('getApiUrl')) {
          content = content.replace(lastImport, lastImport + newImport);
          modified = true;
        }
      } else if (content.includes('import')) {
        // Try to add after first import
        content = content.replace(/(import.*from.*;)/, '$1\nimport { getApiUrl } from "../config/api";');
        modified = true;
      }
    }
    
    // Replace localhost URLs
    content = content.replace(/http:\/\/localhost:5000\/api\/([^\s"`']+)/g, (match, endpoint) => {
      modified = true;
      return `getApiUrl("${endpoint}")`;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${file}`);
    }
  }
});

console.log('Done updating files!');
