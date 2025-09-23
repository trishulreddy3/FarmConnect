# 🌱 FarmConnect - Direct Farm-to-Buyer Marketplace

A modern, full-stack marketplace platform connecting farmers directly with buyers, eliminating middlemen and ensuring fair prices for both parties.

## 🚀 Live Demo

[![Deploy Status](https://img.shields.io/badge/Deploy-Live-brightgreen)](https://farmconnect-9484b.firebaseapp.com)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.2.1-orange)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Integration](#-api-integration)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🌾 For Farmers
- **Crop Management**: Add, edit, and manage crop listings with detailed information
- **Real-time Notifications**: Get instant alerts when buyers place orders
- **Contract System**: Receive and respond to contract requests from buyers
- **Analytics Dashboard**: Track sales, orders, and performance metrics
- **QR Code Generation**: Generate QR codes for easy crop identification
- **Weather Integration**: Real-time weather data for better farming decisions
- **Direct Messaging**: Communicate directly with buyers
- **Order Management**: Track and manage incoming orders

### 🛒 For Buyers
- **Marketplace Browse**: Discover fresh crops from local farmers
- **Advanced Search**: Filter crops by type, location, price, and organic status
- **Direct Orders**: Place orders directly with farmers
- **Contract Creation**: Create custom contracts for specific requirements
- **Analytics Dashboard**: Track purchase history and spending patterns
- **Order Tracking**: Monitor order status from placement to delivery
- **Farmer Communication**: Chat directly with farmers
- **Location Services**: Find farmers and crops near your location

### 🔧 Platform Features
- **Real-time Updates**: Live data synchronization across all devices
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Authentication**: Secure login with Google, Facebook, and email
- **Firebase Integration**: Scalable backend with real-time database
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Progressive Web App**: Installable web application
- **Offline Support**: Basic functionality works offline

## 🛠 Tech Stack

### Frontend
- **React 18.3.1** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **React Hot Toast** - Beautiful notifications

### Backend & Services
- **Firebase Authentication** - User management and security
- **Cloud Firestore** - NoSQL real-time database
- **Firebase Hosting** - Fast, secure web hosting
- **Google Maps API** - Location services and mapping
- **OpenWeatherMap API** - Weather data integration

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Git** - Version control

## 📸 Screenshots

### Authentication
![Authentication](https://via.placeholder.com/800x400/4ade80/ffffff?text=Modern+Authentication+Page)

### Farmer Dashboard
![Farmer Dashboard](https://via.placeholder.com/800x400/10b981/ffffff?text=Farmer+Dashboard+with+Analytics)

### Buyer Marketplace
![Buyer Marketplace](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Buyer+Marketplace+View)

### Order Management
![Order Management](https://via.placeholder.com/800x400/8b5cf6/ffffff?text=Order+Management+System)

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Google Maps API key
- OpenWeatherMap API key

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/farmconnect.git
   cd farmconnect/project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure Firebase**
   - Create a new Firebase project
   - Enable Authentication (Google, Facebook, Email)
   - Create Firestore database
   - Update `src/config/firebase.ts` with your config

5. **Configure APIs**
   - Get Google Maps API key
   - Get OpenWeatherMap API key
   - Update environment variables

6. **Start development server**
   ```bash
   npm run dev
   ```

## ⚙️ Configuration

### Environment Variables
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_WEATHER_API_KEY=your_weather_api_key
```

### Firebase Security Rules
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /crops/{cropId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.farmerId == request.auth.uid || 
         !resource.exists);
    }
    // Add more rules as needed
  }
}
```

## 📱 Usage

### For Farmers
1. **Sign up** as a farmer
2. **Complete profile** with farm details
3. **Add crops** with photos and descriptions
4. **Monitor orders** and respond to buyers
5. **Track analytics** and performance

### For Buyers
1. **Sign up** as a buyer
2. **Browse marketplace** for fresh crops
3. **Place orders** or create contracts
4. **Communicate** with farmers
5. **Track orders** and delivery

## 🔌 API Integration

### Google Maps API
- **Location Services**: Get user location and addresses
- **Distance Calculation**: Calculate distances between farmers and buyers
- **Map Integration**: Display interactive maps

### OpenWeatherMap API
- **Current Weather**: Real-time weather conditions
- **Weather Forecast**: 5-day weather predictions
- **Location-based**: Weather data for specific locations

### Firebase Services
- **Authentication**: User management and security
- **Firestore**: Real-time database for all data
- **Hosting**: Web application hosting

## 🚀 Deployment

### Firebase Hosting
```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy
```

### Environment Setup
1. Configure Firebase project
2. Set up Firestore database
3. Configure authentication providers
4. Deploy to Firebase Hosting

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Write tests for new features
- Update documentation
- Follow the existing code style

## 📊 Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── layout/         # Layout components
│   ├── ui/             # UI components
│   └── widgets/        # Widget components
├── contexts/           # React contexts
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── config/             # Configuration files
```

## 🐛 Known Issues

- Weather API requires valid API key for production
- Google Maps API needs billing enabled for production use
- Some features require HTTPS for full functionality

## 🔮 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Payment integration (Stripe/PayPal)
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Inventory management
- [ ] Supply chain tracking
- [ ] AI-powered crop recommendations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: [Your Name](https://github.com/yourusername)
- **Design**: [Designer Name](https://github.com/designerusername)

## 🙏 Acknowledgments

- Firebase for providing excellent backend services
- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- All contributors and testers

## 📞 Support

If you have any questions or need help:

- 📧 Email: support@farmconnect.com
- 💬 Discord: [Join our community](https://discord.gg/farmconnect)
- 📖 Documentation: [Read the docs](https://docs.farmconnect.com)
- 🐛 Issues: [Report bugs](https://github.com/yourusername/farmconnect/issues)

---

<div align="center">

**Made with ❤️ for farmers and buyers worldwide**

[⭐ Star this repo](https://github.com/yourusername/farmconnect) | [🐛 Report Bug](https://github.com/yourusername/farmconnect/issues) | [💡 Request Feature](https://github.com/yourusername/farmconnect/issues)

</div>