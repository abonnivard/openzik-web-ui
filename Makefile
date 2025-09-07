# Makefile for Music Stack iOS Development
# Quick commands for building and running the iOS app

.PHONY: help ios-build ios-open ios-dev ios-clean ios-full

# Default target
help:
	@echo "Music Stack iOS Development Commands:"
	@echo ""
	@echo "  make ios-build    - Build the iOS app (quick build)"
	@echo "  make ios-open     - Open the iOS project in Xcode"
	@echo "  make ios-dev      - Build and open in Xcode (development)"
	@echo "  make ios-full     - Full clean build and open in Xcode"
	@echo "  make ios-clean    - Clean iOS build cache"
	@echo ""
	@echo "  make help         - Show this help message"

# Quick iOS build
ios-build:
	@echo "🔨 Building iOS app..."
	npm run ios:build

# Open Xcode project
ios-open:
	@echo "📱 Opening iOS project in Xcode..."
	open music-web-frontend/ios/App/App.xcworkspace

# Development workflow: build and open
ios-dev: ios-build ios-open
	@echo "✅ iOS app built and opened in Xcode!"

# Full clean build
ios-full: ios-clean ios-build ios-open
	@echo "✅ Full iOS build completed and opened in Xcode!"

# Clean iOS build cache
ios-clean:
	@echo "🧹 Cleaning iOS build cache..."
	rm -rf music-web-frontend/build/
	rm -rf music-web-frontend/ios/App/App/public/
	npx cap clean ios

# Install dependencies (if needed)
ios-setup:
	@echo "⚙️ Setting up iOS development environment..."
	npm install
	npx cap add ios
	npx cap sync ios

# Run in iOS simulator (requires Xcode command line tools)
ios-sim:
	@echo "📱 Launching in iOS Simulator..."
	npx cap run ios

# Update Capacitor plugins
ios-sync:
	@echo "🔄 Syncing Capacitor plugins..."
	npx cap sync ios

# Show iOS project info
ios-info:
	@echo "📋 iOS Project Information:"
	@echo "Frontend path: music-web-frontend/"
	@echo "iOS project: music-web-frontend/ios/App/App.xcworkspace"
	@echo "Build output: music-web-frontend/build/"
	@echo ""
	npx cap doctor
