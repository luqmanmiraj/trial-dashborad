# 🚀 Energy Trading Dashboard

A modern, futuristic, and minimalist dark-themed web application dashboard built with Next.js, featuring real-time commodity price tracking and secure authentication.

![Dashboard Preview](https://via.placeholder.com/800x400/0b0f12/10b981?text=Energy+Trading+Dashboard)

## ✨ Features

### 📊 Real-Time Price Charts
- **BRNT** (Brent Crude Oil)
- **WTI** (West Texas Intermediate)
- **NG** (Natural Gas)
- **EUR/USD** (Currency Pair)
- 24-hour price graphs with color-coded trends (green/red)
- Data sourced from Yahoo Finance API (15-30 min delay acceptable)

### 🔐 Secure Authentication
- SQLite database with bcrypt password hashing
- Cookie-based session management
- User registration and login system
- Protected routes with middleware

### 🎨 Modern UI/UX
- Dark theme with futuristic design
- Responsive sidebar navigation
- Real-time data updates
- Interactive price charts
- Professional trading interface

### ⚡ Technical Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with sqlite3
- **Authentication**: bcryptjs for password hashing
- **Charts**: Recharts library
- **Data Fetching**: SWR for caching and real-time updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17.0 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/trial-dashborad.git
   cd trial-dashborad
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Initialize the database**
   ```bash
   npm run init-db
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Login Credentials
- **Username**: `admin`
- **Password**: `password`

## 📁 Project Structure

```
trial-dashborad/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts      # Login endpoint
│   │   │   │   ├── logout/route.ts     # Logout endpoint
│   │   │   │   └── register/route.ts   # User registration
│   │   │   └── prices/route.ts         # Price data API
│   │   ├── dashboard/page.tsx          # Main dashboard
│   │   ├── login/page.tsx              # Login page
│   │   ├── globals.css                 # Global styles
│   │   └── layout.tsx                  # Root layout
│   ├── lib/
│   │   └── database.ts                 # Database connection
│   └── middleware.ts                   # Route protection
├── scripts/
│   └── init-db.js                      # Database initialization
├── auth.db                             # SQLite database file
├── .gitignore                          # Git ignore rules
└── package.json                        # Dependencies
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run init-db` - Initialize database and create admin user

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Authentication System

### Security Features
- **Password Hashing**: bcrypt with 10 salt rounds
- **SQL Injection Protection**: Parameterized queries
- **Cookie Security**: HttpOnly, SameSite protection
- **Input Validation**: Comprehensive error handling

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration

#### Data
- `GET /api/prices` - Fetch real-time price data

## 📊 Price Data Sources

The application fetches real-time commodity prices from:
- **Yahoo Finance API** (free, open-source)
- **Update Frequency**: Every 30 seconds
- **Data Delay**: 15-30 minutes (acceptable for trading)
- **Symbols Mapped**:
  - BRNT → `BZ=F` (Brent Crude)
  - WTI → `CL=F` (West Texas Intermediate)
  - NG → `NG=F` (Natural Gas)
  - EUR/USD → `EURUSD=X` (Currency)

## 🎯 Trading Features

### Action Buttons (Dummy Implementation)
- Create initial request
- Create first nomination
- Create final nomination
- Generate invoice
- Record trade

*Note: These are currently UI placeholders. Backend logic can be implemented as needed.*

## 🌍 Time Zones

The dashboard displays times in multiple time zones:
- **Local Time** (User's timezone)
- **New York** (EST/EDT)
- **London** (GMT/BST)
- **Hong Kong** (HKT)

## 🚀 Deployment

### 🌐 Live Demo
**Vercel Deployment**: [https://trial-dashborad.vercel.app](https://trial-dashborad.vercel.app)

### 📦 Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy from GitHub**:
   ```bash
   vercel --prod
   ```

3. **Or Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Deploy automatically

### 🔧 Environment Variables
For production deployment, set these in Vercel dashboard:
```env
NODE_ENV=production
```

### 📊 Production Build
```bash
npm run build
npm run start
```

### 🗄️ Database in Production
- **SQLite**: Works on Vercel with serverless functions
- **Database File**: Automatically created on first deployment
- **Admin User**: Created automatically via initialization script

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/luqmanmiraj/trial-dashborad/issues) page
2. Create a new issue with detailed information
3. Include error logs and steps to reproduce

## 🎨 Design Credits

- **Theme**: Dark, futuristic, minimalist
- **Color Scheme**: `#0b0f12` (background), `#10b981` (accent)
- **Typography**: Inter (sans-serif), JetBrains Mono (monospace)
- **Icons**: Custom SVG icons for navigation and UI elements

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**