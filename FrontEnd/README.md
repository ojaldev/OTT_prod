# OTT Dashboard Frontend

A comprehensive React-based dashboard for managing and analyzing OTT (Over-The-Top) content across multiple platforms.

## Features

- **Authentication & Authorization**: Secure login/register with role-based access control
- **Dashboard Overview**: Real-time analytics and content statistics
- **Content Management**: CRUD operations for OTT content with advanced filtering
- **Analytics**: Interactive charts and visualizations for data insights
- **Admin Panel**: Bulk operations, CSV import/export, user management
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API + useReducer
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with interceptors
- **Charts**: Chart.js with React Chart.js 2
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard-specific components
│   ├── charts/          # Chart components
│   └── admin/           # Admin panel components
├── context/             # React context providers
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── services/            # API service layer
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── styles/              # Global styles
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend API server running on port 5000

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd OTT/FrontEnd
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.development .env.local
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=OTT Dashboard
VITE_ENABLE_MOCK=false
VITE_REFRESH_INTERVAL=300000
```

## Features Overview

### Authentication
- Secure JWT-based authentication
- Role-based access control (User/Admin)
- Protected routes and components
- Token refresh mechanism

### Dashboard
- Overview statistics and metrics
- Recent content activity
- Quick access to key features
- Responsive chart visualizations

### Content Management
- Advanced filtering and search
- Bulk operations support
- CSV import/export functionality
- Real-time data updates
- Pagination and sorting

### Analytics
- Platform distribution analysis
- Genre trends over time
- Language statistics
- Yearly release patterns
- Dubbing analysis
- Custom date range filtering

### Admin Panel
- User management
- System configuration
- Bulk data operations
- Import/export tools
- Activity monitoring

## API Integration

The frontend integrates with a REST API backend with the following endpoints:

- **Authentication**: `/api/auth/*`
- **Content Management**: `/api/content/*`
- **Analytics**: `/api/analytics/*`
- **User Management**: `/api/users/*`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
