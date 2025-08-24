const XLSX = require('xlsx');
const path = require('path');

// Sample guest data
const guestData = [
  {
    Name: 'John Doe',
    Email: 'john.doe@email.com',
    Phone: '+1234567890',
    'Plus One': 'Yes',
    'Dietary Restrictions': 'None',
    Notes: 'Best man'
  },
  {
    Name: 'Jane Smith',
    Email: 'jane.smith@email.com',
    Phone: '+1234567891',
    'Plus One': 'No',
    'Dietary Restrictions': 'Vegetarian',
    Notes: 'College friend'
  },
  {
    Name: 'Bob Johnson',
    Email: 'bob.johnson@email.com',
    Phone: '+1234567892',
    'Plus One': 'Yes',
    'Dietary Restrictions': 'Gluten-free',
    Notes: 'Work colleague'
  },
  {
    Name: 'Sarah Wilson',
    Email: 'sarah.wilson@email.com',
    Phone: '+1234567893',
    'Plus One': 'No',
    'Dietary Restrictions': 'None',
    Notes: 'Bride\'s sister'
  },
  {
    Name: 'Mike Brown',
    Email: 'mike.brown@email.com',
    Phone: '+1234567894',
    'Plus One': 'Yes',
    'Dietary Restrictions': 'None',
    Notes: 'Groom\'s brother'
  }
];

// Create workbook
const workbook = XLSX.utils.book_new();

// Create instructions worksheet
const instructionsData = [
  ['GUEST LIST TEMPLATE - INSTRUCTIONS'],
  [''],
  ['This template helps you organize your guest list for your wedding website.'],
  [''],
  ['HOW TO USE:'],
  ['1. Fill in your guest information in the "Guest List" tab'],
  ['2. Save the file'],
  ['3. Upload it to your wedding website creation form'],
  [''],
  ['COLUMN DESCRIPTIONS:'],
  ['• Name: Full name of your guest'],
  ['• Email: Guest\'s email address (optional)'],
  ['• Phone: Guest\'s phone number (optional)'],
  ['• Plus One: "Yes" or "No" if guest can bring a plus one'],
  ['• Dietary Restrictions: Any dietary needs (e.g., "Vegetarian", "Gluten-free")'],
  ['• Notes: Any additional information about the guest'],
  [''],
  ['TIPS:'],
  ['• You can add or remove columns as needed'],
  ['• The "Name" column is required - all other columns are optional'],
  ['• Keep the header row (first row) as is'],
  ['• You can have up to 1000 guests in your list'],
  [''],
  ['SUPPORT:'],
  ['If you need help, visit our help center or contact support.']
];

const instructionsWorksheet = XLSX.utils.aoa_to_sheet(instructionsData);

// Set column widths for instructions
instructionsWorksheet['!cols'] = [{ wch: 80 }];

// Create guest list worksheet
const guestWorksheet = XLSX.utils.json_to_sheet(guestData);

// Set column widths for guest list
const columnWidths = [
  { wch: 20 }, // Name
  { wch: 25 }, // Email
  { wch: 15 }, // Phone
  { wch: 12 }, // Plus One
  { wch: 20 }, // Dietary Restrictions
  { wch: 25 }  // Notes
];
guestWorksheet['!cols'] = columnWidths;

// Add worksheets to workbook
XLSX.utils.book_append_sheet(workbook, instructionsWorksheet, 'Instructions');
XLSX.utils.book_append_sheet(workbook, guestWorksheet, 'Guest List');

// Write to file
const outputPath = path.join(__dirname, '../public/guest-list-template.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log('Excel template generated successfully at:', outputPath);
console.log('Template includes:');
console.log('- Instructions tab with usage guide');
console.log('- Guest List tab with sample data');
console.log('- Proper column formatting');
