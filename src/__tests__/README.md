# Frontend Tests

This directory contains comprehensive tests for the React frontend application.

## Test Structure

```
src/__tests__/
├── App.test.js              # Main App component tests
├── api.test.js              # API module tests
├── hooks.test.js            # Custom hooks tests  
├── utils.test.js            # Utility functions tests
├── smoke.test.js            # Basic environment tests
└── components/
    ├── Player.test.js       # Audio player component tests
    ├── SearchBar.test.js    # Search input component tests
    └── TrackItem.test.js    # Track list item component tests
```

## Test Coverage

Our tests cover:

### 🔧 **Utility Functions** (`utils.test.js`)
- API base URL configuration
- File URL generation with encoding
- Path separator handling (Windows/Unix)
- Unicode character encoding

### 🌐 **API Module** (`api.test.js`)
- Authentication token handling
- Request/response processing
- Error handling (401, 500, etc.)
- Session expiration management
- Search functionality (Spotify, local)
- Library statistics

### 🎣 **Custom Hooks** (`hooks.test.js`)
- Token expiration handling
- Event listener management
- Navigation on token expiry
- Session cleanup

### 🎵 **Components**
- **SearchBar**: Input handling, Enter key, button clicks
- **TrackItem**: Play/pause, like/unlike, download, queue management
- **Player**: Audio controls, volume, track switching
- **App**: Routing, theme, responsive design, error handling

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run for CI (no watch mode)
npm run test:ci
```

## Test Configuration

- **Environment**: `jsdom` for DOM testing
- **Framework**: Jest + React Testing Library
- **Coverage**: 70% threshold for branches, functions, lines
- **Mocking**: API calls, sessionStorage, audio elements

## Key Features Tested

✅ **Authentication flow**
✅ **Music playback controls**
✅ **Search functionality**
✅ **Responsive design**
✅ **Error handling**
✅ **File URL generation**
✅ **Queue management**
✅ **Toast notifications**

## CI/CD Integration

Tests run automatically on:
- Pull requests to main
- Pushes to main/develop branches
- Before Docker image builds
- Before releases

Coverage reports are uploaded to Codecov for tracking.
