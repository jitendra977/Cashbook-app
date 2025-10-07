# Transaction Management System

A comprehensive full-stack application for managing financial transactions, cashbooks, and store operations with advanced analytics and reporting features.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The Transaction Management System is a modern web application designed to help businesses manage their financial transactions across multiple stores and cashbooks. It provides real-time analytics, comprehensive reporting, and an intuitive user interface for efficient financial operations management.

### Key Capabilities

- Multi-store and multi-cashbook management
- Real-time transaction tracking and analytics
- Advanced filtering and search functionality
- Visual analytics with charts and graphs
- Role-based access control
- Bulk operations support
- Export functionality (CSV, Excel, PDF)
- Mobile-responsive design

---

## ✨ Features

### Transaction Management
- ✅ Create, read, update, and delete transactions
- ✅ Support for multiple transaction types (Income, Expense, Transfer)
- ✅ Category-based organization
- ✅ Recurring transaction support
- ✅ Transaction status tracking (Completed, Pending, Failed, Cancelled)
- ✅ Bulk transaction operations
- ✅ Advanced search and filtering

### Analytics & Reporting
- 📊 Real-time dashboard with key metrics
- 📈 Monthly trend analysis
- 🥧 Category breakdown charts (Pie & Bar)
- 📉 Income vs Expense tracking
- 📅 Customizable date range reporting
- 💰 Balance calculations
- 📊 Summary statistics

### Store & Cashbook Management
- 🏪 Multi-store support
- 💼 Multiple cashbooks per store
- 🔄 Store-specific transaction filtering
- 📱 Cashbook-specific views
- 🎯 Context-aware navigation

### User Experience
- 🎨 Modern Material-UI design
- 📱 Fully responsive (Desktop, Tablet, Mobile)
- 🌙 Dark mode support (optional)
- ⚡ Fast and optimized performance
- 🔍 Intelligent search
- 🎯 Quick actions and shortcuts
- 📌 Breadcrumb navigation

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Django 4.2+
- **REST API:** Django REST Framework 3.14+
- **Database:** PostgreSQL 14+ (SQLite for development)
- **Authentication:** JWT (JSON Web Tokens)
- **CORS:** django-cors-headers
- **Filtering:** django-filter
- **Python:** 3.10+

### Frontend
- **Framework:** React 18+
- **UI Library:** Material-UI (MUI) 5+
- **Routing:** React Router v6
- **State Management:** Context API
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Forms:** React Hook Form (optional)
- **Build Tool:** Vite / Create React App

### Additional Tools
- **Version Control:** Git
- **Package Managers:** pip (backend), npm/yarn (frontend)
- **Development:** Docker (optional)
- **Testing:** Jest, React Testing Library, pytest

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Components  │  │   Contexts   │  │     Hooks    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Services   │  │   Routing    │  │     API      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Django DRF)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   ViewSets   │  │ Serializers  │  │    Models    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │  Permissions │  │   Filters    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                 Database (PostgreSQL)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Stores → Cashbooks → Transactions                   │   │
│  │  Users → Transaction Types → Categories              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 16+** and npm/yarn
- **PostgreSQL 14+** (for production)
- **Git**

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/transaction-management-system.git
cd transaction-management-system
```

2. **Create and activate virtual environment**
```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

Example `.env` file:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

5. **Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Load sample data (optional)**
```bash
python manage.py loaddata fixtures/sample_data.json
```

8. **Run development server**
```bash
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

Example `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Transaction Management System
```

4. **Run development server**
```bash
npm run dev
# or
yarn dev
```

Frontend will be available at `http://localhost:3000` or `http://localhost:5173`

---

## 📁 Project Structure

### Backend Structure
```
backend/
├── manage.py
├── requirements.txt
├── .env
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── accounts/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── stores/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── transactions/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── filters.py
│   │   └── urls.py
│   └── cashbooks/
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       └── urls.py
├── media/
├── static/
└── fixtures/
```

### Frontend Structure
```
frontend/
├── package.json
├── vite.config.js
├── .env
├── public/
│   └── assets/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── api/
│   │   ├── index.js
│   │   ├── transactions.js
│   │   ├── stores.js
│   │   └── cashbooks.js
│   ├── components/
│   │   ├── common/
│   │   │   ├── Loader.jsx
│   │   │   └── ErrorMessage.jsx
│   │   └── transactions/
│   │       ├── TransactionList.jsx
│   │       ├── TransactionForm.jsx
│   │       ├── TransactionFilters.jsx
│   │       ├── CategoryChart.jsx
│   │       ├── MonthlyChart.jsx
│   │       └── SummaryCards.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── TransactionsContext.jsx
│   ├── hooks/
│   │   ├── useTransactions.js
│   │   ├── useAuth.js
│   │   └── useDebounce.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── TransactionsDashboard.jsx
│   │   ├── StoreDetail.jsx
│   │   └── CashbookDetail.jsx
│   ├── routes/
│   │   └── index.jsx
│   ├── styles/
│   │   └── global.css
│   └── utils/
│       ├── constants.js
│       └── helpers.js
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
All API requests require authentication using JWT tokens.

```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Transactions Endpoints

#### Get All Transactions
```http
GET /api/transactions/
Authorization: Bearer {token}
```

Query Parameters:
- `store` - Filter by store ID
- `cashbook` - Filter by cashbook ID
- `type` - Filter by transaction type
- `category` - Filter by category
- `status` - Filter by status
- `start_date` - Filter by start date (YYYY-MM-DD)
- `end_date` - Filter by end date (YYYY-MM-DD)
- `search` - Search in description
- `ordering` - Sort by field (e.g., `-transaction_date`)
- `page` - Page number
- `page_size` - Items per page

#### Get Transactions by Store
```http
GET /api/transactions/by-store/?store={storeId}
Authorization: Bearer {token}
```

#### Get Transactions by Cashbook
```http
GET /api/transactions/by-cashbook/?cashbook={cashbookId}
Authorization: Bearer {token}
```

#### Get Transactions by Store and Cashbook
```http
GET /api/transactions/by-store-and-cashbook/?store={storeId}&cashbook={cashbookId}
Authorization: Bearer {token}
```

#### Create Transaction
```http
POST /api/transactions/
Authorization: Bearer {token}
Content-Type: application/json

{
  "cashbook": 1,
  "type": 1,
  "category": 2,
  "amount": "150.50",
  "transaction_date": "2025-10-07",
  "description": "Office supplies",
  "status": "completed"
}
```

#### Update Transaction
```http
PUT /api/transactions/{id}/
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": "175.75",
  "description": "Updated office supplies"
}
```

#### Delete Transaction
```http
DELETE /api/transactions/{id}/
Authorization: Bearer {token}
```

#### Get Transaction Summary
```http
GET /api/transactions/summary/?store={storeId}&cashbook={cashbookId}&start_date=2025-01-01&end_date=2025-12-31
Authorization: Bearer {token}
```

Response:
```json
{
  "total_transactions": 150,
  "total_amount": 15750.50,
  "total_income": 20000.00,
  "total_expense": 4249.50
}
```

### Stores Endpoints

```http
GET /api/stores/
GET /api/stores/{id}/
POST /api/stores/
PUT /api/stores/{id}/
DELETE /api/stores/{id}/
```

### Cashbooks Endpoints

```http
GET /api/cashbooks/
GET /api/cashbooks/{id}/
POST /api/cashbooks/
PUT /api/cashbooks/{id}/
DELETE /api/cashbooks/{id}/
```

---

## 📖 Usage Guide

### Creating a Transaction

1. Navigate to the Transactions Dashboard
2. Click "New Transaction" button
3. Fill in the form:
   - Select Cashbook
   - Select Transaction Type
   - Select Category (optional)
   - Enter Amount
   - Select Transaction Date
   - Add Description
4. Click "Save"

### Filtering Transactions

1. Click the "Filters" button
2. Select your filter criteria:
   - Store
   - Cashbook
   - Type
   - Category
   - Status
   - Date Range
   - Amount Range
3. Click "Apply Filters"

### Viewing Analytics

1. Navigate to the "Analytics" tab
2. View:
   - Monthly trend chart
   - Category breakdown (Pie/Bar charts)
   - Summary statistics
3. Adjust date range to see different periods

### Exporting Data

1. Apply desired filters
2. Click "Export" button
3. Select format (CSV, Excel, PDF)
4. Download file

---

## ⚙️ Configuration

### Backend Configuration

**Database Settings** (`settings.py`):
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'transaction_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

**CORS Settings**:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
```

**Pagination**:
```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}
```

### Frontend Configuration

**API Configuration** (`src/api/index.js`):
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
```

**Theme Configuration** (`src/theme.js`):
```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});
```

---

## 🚢 Deployment

### Backend Deployment (Heroku Example)

1. **Install Heroku CLI**
2. **Create Heroku app**
```bash
heroku create your-app-name
```

3. **Add PostgreSQL addon**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

4. **Set environment variables**
```bash
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False
```

5. **Deploy**
```bash
git push heroku main
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

### Frontend Deployment (Vercel Example)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
cd frontend
vercel
```

3. **Set environment variables** in Vercel dashboard
4. **Connect to production backend**

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Django REST Framework documentation
- Material-UI team
- React community
- All contributors

---

## 📞 Support

For support, email support@example.com or join our Slack channel.

---

## 🗺️ Roadmap

- [ ] Multi-currency support
- [ ] Invoice generation
- [ ] Automated reconciliation
- [ ] Mobile app (React Native)
- [ ] Advanced reporting (PDF generation)
- [ ] Integration with accounting software
- [ ] Audit trail
- [ ] Real-time notifications
- [ ] Batch imports
- [ ] API webhooks

---

**Last Updated:** October 2025