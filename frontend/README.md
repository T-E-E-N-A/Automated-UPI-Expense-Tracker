# Expense Tracker Frontend

A modern, responsive expense tracking application built with Vite, React, Tailwind CSS, and Clerk authentication.

## Features

- **Authentication**: Secure login/signup with Clerk
- **Dashboard**: Overview of expenses and income with charts
- **Expense Management**: Track and categorize expenses
- **Income Tracking**: Monitor income sources
- **Responsive Design**: Mobile-friendly interface
- **Data Visualization**: Interactive charts using Recharts

## Tech Stack

- **Frontend**: Vite + React + JavaScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Routing**: React Router DOM
- **Charts**: Recharts
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Clerk account and publishable key

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   Create a `.env.local` file in the frontend directory and add your Clerk publishable key:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── charts/         # Chart components
│   │   ├── Header.jsx      # Mobile header
│   │   ├── Sidebar.jsx     # Navigation sidebar
│   │   └── ProtectedRoute.jsx
│   ├── context/            # State management
│   │   └── AppContext.jsx  # Global state context
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── ExpensesPage.jsx
│   │   ├── IncomePage.jsx
│   │   ├── SignInPage.jsx
│   │   └── SignUpPage.jsx
│   ├── App.jsx             # Main app component
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Features Overview

### Authentication
- Secure login and signup using Clerk
- Protected routes for authenticated users
- Automatic redirect to dashboard after login

### Dashboard
- Financial overview with total expenses, income, and net balance
- Recent transactions display
- Interactive charts for expense categories and income trends
- Quick navigation to detailed pages

### Expense Management
- View all expenses for the last 30 days
- Categorized expense tracking
- Merchant/UPI information
- Visual category breakdown

### Income Tracking
- Monitor income sources
- Track income trends over time
- Source-based categorization

### Responsive Design
- Mobile-first approach
- Collapsible sidebar for mobile devices
- Touch-friendly interface
- Optimized for all screen sizes

## Customization

### Adding New Categories
Update the category mappings in the respective page components:
- `ExpensesPage.jsx` for expense categories
- `IncomePage.jsx` for income sources

### Styling
The application uses Tailwind CSS for styling. You can customize:
- Colors in `tailwind.config.js`
- Global styles in `src/index.css`
- Component-specific styles using Tailwind classes

### Mock Data
The application currently uses mock data defined in `src/context/AppContext.jsx`. You can:
- Modify the mock data arrays
- Add new sample data
- Integrate with a real backend API

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new components in the `src/components/` directory
2. Add new pages in the `src/pages/` directory
3. Update routing in `src/App.jsx`
4. Add new state management in `src/context/AppContext.jsx`

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service

3. Ensure environment variables are set in your production environment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.