# ⚡ EcoVolt - Electric Vehicle Charging Station Management System
A comprehensive full-stack web application for managing electric vehicle charging stations with real-time monitoring, interactive maps, and role-based administration.

![EcoVolt Banner](https://via.placeholder.com/1200x400/22c55e/ffffff?text=EcoVolt+-+EV+Charging+Station+Management)

## 🌟 Features

### 🔐 **Authentication & User Management**
- **Secure JWT Authentication** with bcrypt password hashing
- **Role-based Access Control** (Admin/User permissions)
- **Password Change Functionality** with current password verification
- **User Profile Management** with statistics and activity tracking

### ⚡ **Charging Station Management**
- **Complete CRUD Operations** for charging stations
- **Real-time Status Monitoring** (Active/Inactive)
- **Technical Specifications** (Power output, connector types)
- **Ownership Management** with user-specific permissions
- **Admin Approval Workflow** for new stations and deletions

### 🗺️ **Interactive Map Integration**
- **OpenStreetMap Integration** with Leaflet.js (free alternative to Google Maps)
- **Custom Markers** with status-based color coding
- **Interactive Popups** with detailed station information
- **Real-time Filtering** by status, connector type, and power output
- **Multiple Map Layers** (Streets, Satellite, Terrain)
- **Deep Linking** to specific stations

### 🎨 **Modern UI/UX Design**
- **Responsive Design** optimized for all devices
- **Dark/Light Theme Toggle** with system preference detection
- **Green Color Scheme** with gradient effects and animations
- **Advanced Animations** with hover effects and micro-interactions
- **Professional Dashboard** with statistics and data visualization

### 👨‍💼 **Admin Features**
- **Pending Approval Dashboard** with real-time counts
- **Station Approval Workflow** for user submissions
- **Deletion Request Management** with reason tracking
- **Full Edit Permissions** on all stations
- **Real-time Notification Badges** in navigation

## 🛠️ Technology Stack

### **Backend**
- **Node.js** with Express.js framework
- **PostgreSQL** database with raw SQL queries
- **JWT Authentication** with 7-day token expiration
- **bcryptjs** for secure password hashing
- **CORS** enabled for cross-origin requests
- **Environment-based Configuration**

### **Frontend**
- **Vue.js 3** with Composition API
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Pinia** for state management
- **Vue Router** with navigation guards
- **Axios** for HTTP requests with interceptors
- **Leaflet.js** for interactive maps

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v16 or higher)
- PostgreSQL database
- Git

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ecovolt.git
cd ecovolt
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file with your database credentials
cp .env.example .env
# Edit .env with your PostgreSQL connection details

# Start the backend server
npm start
# Server runs on http://localhost:3000
```

3. **Frontend Setup**
```bash
cd frontend
npm install

# Start the development server
npm run dev
# Frontend runs on http://localhost:5173
```

## 📚 API Documentation

### **Authentication Endpoints**
```bash
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
GET  /api/auth/me                # Get current user
POST /api/auth/refresh           # Refresh JWT token
POST /api/auth/change-password   # Change user password
```

### **Charging Station Endpoints**
```bash
GET    /api/chargers                    # List all stations (with filters)
GET    /api/chargers/:id                # Get specific station
POST   /api/chargers                    # Create new station
PUT    /api/chargers/:id                # Update station
DELETE /api/chargers/:id                # Delete/request deletion
```

### **Admin Endpoints**
```bash
GET  /api/chargers/pending-counts       # Get pending approval counts
GET  /api/chargers/pending              # Get pending stations
POST /api/chargers/:id/approve          # Approve station
POST /api/chargers/:id/reject           # Reject station
GET  /api/chargers/deletion-requests    # Get deletion requests
POST /api/chargers/deletion-requests/:id/approve  # Approve deletion
POST /api/chargers/deletion-requests/:id/reject   # Reject deletion
```

## 🎯 User Roles & Permissions

### **Regular Users**
- Create charging stations (requires admin approval)
- Edit their own stations
- Request deletion of their stations
- View all approved stations
- Change their password

### **Admin Users**
- Approve/reject new station submissions
- Edit any charging station
- Delete any charging station directly
- Approve/reject deletion requests
- View pending approval dashboard with real-time counts
- All regular user permissions

## 🔒 Security Features

- **Password Hashing**: bcryptjs with 10 salt rounds
- **JWT Tokens**: 7-day expiration with automatic refresh
- **Protected Routes**: Middleware-based authentication
- **Input Validation**: Comprehensive server-side validation
- **SQL Injection Prevention**: Parameterized queries
- **CORS Protection**: Configured for specific origins
- **Role-based Authorization**: Admin/user permission checks

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Enhanced experience on tablets
- **Desktop Features**: Full-featured desktop interface
- **Cross-browser**: Compatible with all modern browsers
- **Accessibility**: WCAG compliant design patterns

## 🎨 Design System

### **Color Palette**
- **Primary**: Sea Green (#43A047) for main actions
- **Accent**: Soft Teal (#80CBC4) for highlights
- **Success**: Green (#22c55e) for active states
- **Warning**: Yellow (#f59e0b) for inactive states
- **Danger**: Red (#ef4444) for delete actions

### **Animations**
- **Hover Effects**: Scale, glow, and shadow animations
- **Loading States**: Smooth loading spinners
- **Transitions**: 300ms smooth transitions
- **Micro-interactions**: Button press feedback

### **Testing Features**
1. **Authentication Flow**: Register new users and test login/logout
2. **Station Management**: Create, edit, and delete charging stations
3. **Admin Workflow**: Test approval/rejection of stations and deletion requests
4. **Map Integration**: View stations on interactive map with filtering
5. **Responsive Design**: Test on different screen sizes and devices
6. **Theme Toggle**: Switch between dark and light modes
7. **Password Change**: Test password update functionality
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- **OpenStreetMap** for free mapping data
- **Leaflet.js** for interactive map functionality
- **Vue.js** community for excellent documentation
- **Tailwind CSS** for utility-first styling
- **PostgreSQL** for robust database management

<div align="center">
  <strong>Built with ❤️ for sustainable transportation</strong>
</div>
