# Loan Management System

A modern, responsive loan management application built with Nuxt 3 and Tailwind CSS. This application provides a comprehensive interface for managing loan records with features like authentication, data visualization, and detailed loan information.

## Features

- 🔐 **Authentication System**: Secure login with demo credentials
- 📊 **Dashboard Overview**: Statistics and summary cards
- 🔍 **Advanced Filtering**: Search and filter loans by multiple criteria
- 📋 **Detailed Loan Records**: Complete loan information display
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🎨 **Modern UI**: Clean, professional interface with Tailwind CSS

## Demo Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Data Structure

The application uses the following loan data fields:

| Field | Description |
|-------|-------------|
| BranchName | Branch location |
| LoanType | Type of loan (GOLD LOAN, HOME LOAN, Sthavar Taran) |
| AccountNO | Unique account number |
| BorrowerName | Name of the borrower |
| MobileNo | Contact number |
| BorrowerAdd | Borrower's address |
| OpenDate | Loan opening date |
| LoanAmount | Original loan amount |
| ClosingBalance | Current balance |
| InterestRate | Interest rate percentage |
| PERIOD | Loan period in months |
| FirstInstallmentDate | First installment due date |
| InstallmentAmount | Monthly installment amount |
| TotalOverdueAmount | Total overdue amount |
| TotalRecoveryAmount | Total recovered amount |
| EndDate | Loan end date |
| NPAStatus | Non-performing asset status |

## Pages

### 1. Login Page (`/login`)
- Modern authentication interface
- Demo credentials display
- Remember me functionality
- Responsive design

### 2. Dashboard (`/dashboard`)
- Overview statistics cards
- Advanced filtering options
- Search functionality
- Loan records table
- Action buttons for each loan

### 3. Loan Details (`/loan/[id]`)
- Comprehensive loan information
- Financial details
- Borrower information
- Loan terms and conditions
- Installment details

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd loan-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
loan-app/
├── pages/
│   ├── index.vue          # Landing page with redirect
│   ├── login.vue          # Authentication page
│   ├── dashboard.vue      # Main dashboard
│   └── loan/
│       └── [id].vue      # Dynamic loan details page
├── components/
│   ├── ExcelUploader.vue  # Excel/CSV upload component
│   └── MobileNav.vue      # Mobile navigation component
├── middleware/
│   └── auth.ts           # Authentication middleware
├── public/
│   └── sample-loans.csv  # Sample CSV template
├── stores/               # Pinia stores (if needed)
└── nuxt.config.ts       # Nuxt configuration
```

## Data Management

The application uses Excel/CSV files as the primary data source. Users can:

1. **Download Template**: Get a sample CSV file with the correct format
2. **Upload Excel/CSV**: Import their own loan data files
3. **Real-time Processing**: Data is processed and displayed immediately
4. **Data Validation**: Automatic validation of required columns and data types

### Supported File Formats
- **CSV Files**: Full parsing and validation support
- **Excel Files**: XLSX and XLS format support (simulated processing)
- **Template Download**: Sample file with correct column structure

### Data Structure
The application expects Excel/CSV files with the following columns:

| Column | Required | Type | Description |
|--------|----------|------|-------------|
| BranchName | Yes | Text | Branch location |
| LoanType | Yes | Text | Type of loan |
| AccountNO | Yes | Text | Unique account number |
| BorrowerName | Yes | Text | Name of the borrower |
| LoanAmount | Yes | Number | Original loan amount |
| MobileNo | No | Text | Contact number |
| BorrowerAdd | No | Text | Borrower's address |
| OpenDate | No | Date | Loan opening date |
| ClosingBalance | No | Number | Current balance |
| InterestRate | No | Number | Interest rate percentage |
| PERIOD | No | Number | Loan period in months |
| FirstInstallmentDate | No | Date | First installment due date |
| InstallmentAmount | No | Number | Monthly installment amount |
| TotalOverdueAmount | No | Number | Total overdue amount |
| TotalRecoveryAmount | No | Number | Total recovered amount |
| EndDate | No | Date | Loan end date |
| NPAStatus | No | Text | Non-performing asset status |

## Customization

### Adding New Loan Types

1. Update the `getLoanTypeClass` function in dashboard and loan detail pages
2. Add new CSS classes for the loan type styling

### Modifying Data Structure

1. Update the JSON data structure in `public/data/loans.json`
2. Modify the corresponding Vue components to handle new fields
3. Update filtering and search logic

### Styling Changes

The application uses Tailwind CSS for styling. You can:
- Modify the color scheme by updating Tailwind classes
- Add custom CSS in the `<style>` sections
- Create reusable components for common UI elements

## Security Considerations

- The current implementation uses localStorage for authentication (demo only)
- In production, implement proper session management
- Add input validation and sanitization
- Implement proper error handling
- Use HTTPS in production

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
