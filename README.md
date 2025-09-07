# 🎵 OpenZik Frontend

Multi-platform music application frontend supporting both Web and iOS platforms.

## 🌐 Web Application

React-based web interface for the OpenZik music platform.

### Development
```bash
npm install
npm start
```

### Production Build
```bash
npm run build
```

## 📱 iOS Application

Native iOS app built with Capacitor, sharing the same React codebase.

### Prerequisites
- Xcode 14+
- CocoaPods
- iOS 13+

### Development Setup
```bash
# First time setup
npm run ios:setup

# Build and open in Xcode
npm run ios:dev
```

### Manual iOS Development
```bash
# Build React app
npm run build

# Sync with iOS
npm run ios:build

# Open in Xcode
npm run ios:open
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start web development server |
| `npm run build` | Build React app for production |
| `npm test` | Run tests |
| `npm run ios:setup` | Setup iOS project dependencies |
| `npm run ios:build` | Build React and sync to iOS |
| `npm run ios:open` | Open iOS project in Xcode |
| `npm run ios:dev` | Full iOS development workflow |

## 📁 Project Structure

```
├── src/                  # React source code
├── public/              # Web static assets
├── ios-app/             # iOS Capacitor project
│   ├── src/             # iOS-specific React components
│   ├── ios/             # Native iOS project
│   └── capacitor.config.ts
├── build/               # React build output
└── package.json         # Dependencies and scripts
```

## 🚀 Deployment

### Web
Docker image built automatically via GitHub Actions and pushed to GitHub Container Registry.

### iOS
iOS app can be built using GitHub Actions on macOS runners or locally with Xcode.
