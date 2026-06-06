# Weatherboy 🌤️

A modern, full-stack weather application that provides real-time weather information with AI-powered briefings.

## Live Demo

🔗 **[Visit Weather++](https://weatherboy-client.vercel.app/)**

## Features

- **Current Weather Display** - Real-time weather conditions with temperature, humidity, wind speed, and more
- **Hourly Forecast** - Detailed hourly weather predictions for the next 24 hours
- **Daily Summaries** - 7-day weather forecast with daily high/low temperatures and conditions
- **AI-Powered Briefing** - Smart weather analysis and insights powered by Google Gemini AI
- **Location Detection** - Automatic IP-based location detection with reverse geocoding
- **Dynamic UI** - Weather-aware background gradients that change based on conditions
- **Responsive Design** - Fully responsive interface built with React and Tailwind CSS
- **Type-Safe** - Full TypeScript support on both client and server

## Tech Stack

### Client
- **React 19** - UI library
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **React Spinners** - Loading animations

### Server
- **Express** - Fast, unopinionated web framework
- **TypeScript** - Type-safe backend development
- **LangChain** - AI/ML framework for Google Gemini integration
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **API Keys:**
  - Weather API key (OpenWeatherMap or similar)
  - Google Gemini API key (for AI briefing feature)
  - LocationIQ API key (for reverse Geocoding)

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd weather++
```

### 2. Install Dependencies

Install root dependencies:
```bash
cd client
npm install
```

```bash
cd server
npm install
```

The client and server dependencies will be installed automatically and separately.

### 3. Environment Variables

Create a `.env` file in the `server/` directory:

```env
# API Keys
WEATHER_AI_API_KEY=your_weather_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
LOCATIONIQ_API_KEY=your_locationi1_api_key_here
PORT=5174

# Default Location (Optional - defaults to Unknown)
DEFAULT_LAT=-1.2921
DEFAULT_LON=36.8219
DEFAULT_LOCATION_NAME=Unknown
```

## Running Locally

### Development Mode

Run both client and server with hot-reload:

```bash
# Terminal 1 - Start the server
npm run dev:server

# Terminal 2 - Start the client
npm run dev:client
```

- **Client** will be available at: `http://127.0.0.1:5173`
- **Server** will be available at: `http://127.0.0.1:5174`

### Type Checking

Check for TypeScript errors:

```bash
npm run typecheck
```

### Build for Production

Build both client and server:

```bash
npm run build
```

This generates:
- Client build in `client/dist/`
- Server build in `server/dist/`

### Run Production Build

```bash
# Start the compiled server
cd server
npm run start
```

## Project Structure

```
weatherboy/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── AiBriefingPanel.tsx
│   │   │   ├── CurrentWeatherPanel.tsx
│   │   │   ├── DailySummariesPanel.tsx
│   │   │   └── HourlyForecastPanel.tsx
│   │   ├── services/         # API services
│   │   ├── lib/              # Utilities and types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── routes/           # API routes
│   │   │   ├── weatherRoutes.ts
│   │   │   ├── geoCodeRoutes.ts
│   │   │   ├── ipLocationRoutes.ts
│   │   │   └── healthRoutes.ts
│   │   ├── services/         # Business logic
│   │   │   ├── weatherService.ts
│   │   │   ├── ipLocationService.ts
│   │   │   └── reverseGeocode.ts
│   │   ├── middleware/       # Express middleware
│   │   │   ├── errorMiddleware.ts
│   │   │   └── requestLogger.ts
│   │   ├── utils/            # Utilities
│   │   │   ├── env.ts
│   │   │   ├── httpError.ts
│   │   │   └── createServer.ts
│   │   └── index.ts
│   ├── tsconfig.json
│   └── package.json
│
└── package.json              # Root workspace package
```

## API Endpoints

- `GET /api/weather` - Get current weather and forecast
- `GET /api/geocode` - Reverse geocode coordinates to location
- `GET /api/location` - Get user location from IP
- `GET /health` - Health check endpoint

## License

MIT

## Contributing

Contributions are welcome! Feel free to open issues and pull requests.

---
