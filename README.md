# V-Search MVP - Visual Business Discovery Platform

A **canvas-based business cloud visualization** that transforms how event planners find local service providers through an innovative image-based interface.

## 🚀 MVP Features

### Core Visualization
- **Canvas-based business cloud** with 15 sample businesses
- **Category clustering** - businesses of the same type group together
- **Real-time animations** with physics-based movement
- **Interactive business cards** with 6 metric icons
- **Responsive design** that adapts to screen size

### Search & Filtering
- **Category-based filtering** (Catering, Entertainment, Rentals, Staffing, Photography)
- **Sub-category selection** (Italian, DJ, Tables & Chairs, etc.)
- **Location search** with city input
- **Advanced filters** for distance, rating, and price
- **Real-time search results** displayed in the cloud

### User Controls
- **Animation speed control** (0.1x to 3.0x)
- **Play/Pause animation** toggle
- **Clustering on/off** switch
- **Interactive hover and click** on business cards
- **Selected business details** display

### Business Metrics (6 Icons)
1. **Rating** - Star rating (color-coded)
2. **Distance** - Travel distance in miles
3. **Price** - Service cost range
4. **Availability** - Current availability status
5. **Verified** - Business verification status
6. **Featured** - Premium business indicator

## 🛠️ Technical Architecture

### Frontend Stack
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Canvas API** for custom rendering
- **Lucide React** for icons

### Key Components
- `BusinessCloudCanvas` - Core canvas rendering with physics
- `SearchInterface` - Search and filtering controls
- `AnimationControls` - User animation preferences
- `CloudStore` - Zustand state management

### Canvas Implementation
- **Custom physics engine** with collision detection
- **Category-based clustering algorithm**
- **Smooth animations** with requestAnimationFrame
- **High DPI support** for retina displays
- **Touch-friendly interactions** for mobile

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Commands
```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

## 🎨 Sample Business Data

The MVP includes 15 sample businesses across 5 categories:

### Catering (3 businesses)
- Mama Mia Catering (Italian)
- Spice Garden Catering (Asian)  
- Vegan Delights Catering (Vegan)

### Entertainment (3 businesses)
- El Mariachi Band (Live Band)
- DJ Mix Master (DJ)
- Magic Mike Entertainment (Magician)

### Rentals (3 businesses)
- Premier Event Rentals (Tables & Chairs)
- Tent & Party Supplies (Tents)
- Audio Visual Solutions (Audio/Visual)

### Staffing (3 businesses)
- Professional Staffing Co (Servers)
- Bartender Pro Services (Bartenders)
- Security First Guards (Security)

### Photography (3 businesses)
- Capture Moments Photography (Wedding)
- Corporate Event Photos (Corporate)
- Aerial Photography Drone (Aerial)

## 🔧 Configuration

### Animation Settings
- **Default speed**: 1.0x
- **Speed range**: 0.1x - 3.0x
- **Clustering**: Enabled by default
- **Physics damping**: 0.98 (smooth movement)

### Category Colors
- Catering: `#FF6B6B` (Red)
- Entertainment: `#4ECDC4` (Teal)
- Rentals: `#45B7D1` (Blue)
- Staffing: `#96CEB4` (Green)
- Photography: `#FFEAA7` (Yellow)

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual Deployment
```bash
# Build the project
npm run build

# Deploy dist/ folder to your hosting service
```

## 📱 Responsive Design

- **Desktop**: Full canvas with all controls visible
- **Tablet**: Responsive layout with collapsible filters
- **Mobile**: Touch-optimized interactions and controls

## 🔮 Future Enhancements

### Phase 2 Features (Planned)
- **Supabase backend** integration
- **Real business data** and images
- **Admin control panel** for business management
- **User authentication** and profiles
- **Booking system** integration
- **Advanced clustering** algorithms
- **Mobile app** version

### Technical Improvements
- **WebGL rendering** for better performance
- **Real-time collaboration** features
- **Advanced search** with AI recommendations
- **Analytics dashboard** for business insights
- **API integrations** with Google Business Profile

## 🤝 Contributing

This is an MVP version focused on core functionality. The codebase is structured for easy extension and modification.

### Code Structure
```
src/
├── components/          # React components
│   ├── BusinessCloudCanvas.tsx
│   ├── SearchInterface.tsx
│   └── AnimationControls.tsx
├── store/              # Zustand state management
│   └── cloudStore.ts
├── types/              # TypeScript type definitions
│   └── business.ts
├── App.tsx             # Main application component
└── main.tsx           # Application entry point
```

## 📄 License

This project is part of the V-Search visual business discovery platform MVP.

---

**Built with ❤️ using React + TypeScript + Canvas** 