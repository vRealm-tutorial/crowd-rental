# Real Estate Rental App

A comprehensive mobile application built with React Native and Expo for connecting tenants, landlords, and agents in the Nigerian real estate market.

## 📱 Overview

This application aims to streamline the property rental process by providing a platform for:

- **Tenants** to discover, save, and book viewings for rental properties
- **Landlords** to list their properties and manage viewing requests
- **Agents** to facilitate property viewings and connect tenants with landlords

## ✨ Features

### User Authentication & Roles

- Multi-role registration (Tenant, Landlord, Agent)
- Email and phone authentication with OTP verification
- Role-specific dashboards and features

### Property Management

- Property listings with detailed information and photos
- Location-based property search with Google Maps integration
- Advanced filtering options (price, bedrooms, features, etc.)
- Save favorite properties for later viewing

### Booking System

- Schedule property viewings based on availability
- Manage viewing appointments (confirm, cancel, reschedule)
- Subscription-based viewing quota system
- Real-time notifications for booking updates

### User Experience

- Both list and map views for property discovery
- Proximity detection for nearby properties
- Intuitive user interface with modern design patterns
- Dark/Light theme support

## 🛠️ Technical Stack

### Frontend

- **Framework**: React Native with Expo
- **Navigation**: React Navigation/Expo Router
- **State Management**: Zustand
- **Maps Integration**: React Native Maps with Google Maps
- **Form Handling**: Custom form hooks with Zod validation
- **UI Components**: Custom components with theming support

### Design & Styling

- Custom color scheme with light/dark mode support
- Responsive design patterns
- Consistent UI components library
- Ionicons for iconography

## 📂 Project Structure

```
├── app/                       # Main application screens and navigation
├── assets/                    # Static assets (images, fonts)
├── components/                # Reusable UI components
│   ├── property/              # Property-related components
│   ├── ui/                    # Generic UI components
├── constants/                 # App constants and configuration
├── hooks/                     # Custom React hooks
│   ├── useAuthStore.ts        # Authentication state management
│   ├── useBookingStore.ts     # Booking state management
│   ├── useForm.ts             # Form handling with validation
│   ├── usePropertyStore.ts    # Property state management
├── services/                  # API and service integrations
│   ├── api.ts                 # API client setup
│   ├── location.ts            # Location services
├── utils/                     # Utility functions and helpers
│   ├── validationSchemas.ts   # Zod validation schemas
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm, yarn, or Bun
- Expo CLI
- iOS Simulator (for macOS) or Android Emulator

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/real-estate-rental-app.git
cd real-estate-rental-app
```

2. Install dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using bun
bun install
```

3. Start the development server

```bash
# Using npm/yarn
npx expo start

# Using bun
bun expo start
```

4. Run on your preferred platform

```bash
# For iOS (npm/yarn)
npx expo run:ios
# For iOS (bun)
bun expo run:ios

# For Android (npm/yarn)
npx expo run:android
# For Android (bun)
bun expo run:android
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Google Maps API

For the map functionality to work properly, you'll need to:

1. Obtain a Google Maps API key from the Google Cloud Console
2. Enable the Maps SDK for iOS and Android
3. Add the API key to your environment variables

## 📖 User Flows

### Tenant Flow

1. Register as a tenant
2. Browse properties (list or map view)
3. Filter properties based on preferences
4. View property details
5. Save favorite properties
6. Book property viewings
7. Manage upcoming and past viewings

### Landlord Flow

1. Register as a landlord
2. List properties for rent
3. Upload property images and details
4. Manage property listings
5. Approve/reject viewing requests
6. Track property views and bookings

### Agent Flow

1. Register as an agent
2. Browse available properties
3. Facilitate property viewings
4. Connect tenants with landlords
5. Manage viewing schedule

## 🧪 Testing

To run tests:

```bash
# Using npm
npm test

# Using yarn
yarn test

# Using bun
bun test
```

## 📱 Screen Showcase

The application consists of various screens, including:

- Welcome Screen
- Login/Registration Screens
- Role Selection Screen
- OTP Verification Screen
- Home Screen (Property Listings)
- Map View Screen
- Property Details Screen
- Booking Screen
- Viewing Confirmation Screen
- Search Filters Screen
- User Profile Screens

## 🌟 Future Enhancements

- In-app messaging between users
- Payment integration for booking fees and rent
- Virtual property tours
- Lease agreement generation
- AI-powered property recommendations
- Analytics dashboard for landlords

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributors

- [Olawale Ajuwon](https://github.com/Olawill) - Initial work
- [Victoria Ajuwon](https://github.com/abiolaah) - Initial work

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing React Native toolchain
- [React Navigation](https://reactnavigation.org/) for the robust navigation system
- [Zustand](https://github.com/pmndrs/zustand) for the simple yet powerful state management
- [Zod](https://github.com/colinhacks/zod) for type validation
