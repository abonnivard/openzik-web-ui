# 📱 Offline Download Features

## Overview

OpenZik's iOS app includes powerful offline download capabilities, allowing users to save their favorite tracks locally for listening without an internet connection.

## Features

### ✅ Available Features
- **Download any track** for offline listening
- **Progress tracking** during downloads
- **Local storage management** with file size info
- **Offline library** page to manage downloaded tracks
- **Automatic file organization** in device Documents folder
- **Download status indicators** throughout the app

### 🎯 Platform Support
- **iOS**: Full offline support via Capacitor Filesystem API
- **Web**: Download buttons hidden (not supported)
- **Future**: Android support planned

## How It Works

### For Users

1. **Download Tracks**: Look for the download icon (⬇️) next to any track
2. **Monitor Progress**: Watch the circular progress indicator during download
3. **Manage Downloads**: Visit "Offline Library" from the sidebar
4. **Play Offline**: Downloaded tracks work without internet connection

### For Developers

The offline system consists of several components:

#### Core Files
- `src/services/offlineDownload.js` - Main download service
- `src/components/OfflineDownloadButton.jsx` - Download UI component
- `src/pages/OfflineLibrary.jsx` - Management interface
- `src/utils/platform.js` - Platform detection utilities

#### Technical Details

**Storage Location**: 
- iOS: Documents directory (`/Documents/OfflineMusic/`)
- Metadata: `offline_tracks.json` for track information

**File Handling**:
- Audio files saved with original extensions
- Base64 encoding for iOS Filesystem API compatibility
- Automatic file size tracking and reporting

**Download Process**:
1. Fetch audio file from backend API
2. Stream download with progress tracking
3. Convert to Base64 for Capacitor storage
4. Save metadata for offline access
5. Update UI to reflect completion

## Usage Examples

### Download a Track
```javascript
import offlineDownloadService from '../services/offlineDownload';

// Download with progress callback
await offlineDownloadService.downloadTrack(track, (progress) => {
  console.log(`Download progress: ${progress}%`);
});
```

### Check if Track is Offline
```javascript
const isOffline = offlineDownloadService.isTrackOffline(trackId);
```

### Get Storage Stats
```javascript
const stats = await offlineDownloadService.getStorageStats();
console.log(`${stats.totalTracks} tracks, ${stats.totalSizeFormatted}`);
```

## Configuration

### Environment Variables
- `REACT_APP_API_BASE_URL`: Backend API URL (configured in `.env.ios`)

### Capacitor Plugins Required
```json
{
  "@capacitor/filesystem": "^6.0.0",
  "@capacitor/device": "^6.0.0"
}
```

### iOS Permissions
No special permissions required - uses app's Documents directory.

## Development

### Testing Offline Downloads

1. **Setup**: Ensure backend is running on your local IP
2. **Build**: Run `npm run ios:build` 
3. **Test**: Open in Xcode simulator or device
4. **Verify**: Check Documents directory for downloaded files

### Debugging

- Check browser console for download errors
- Verify network connectivity to backend
- Ensure sufficient device storage space
- Monitor Capacitor plugin logs in Xcode

## Troubleshooting

### Common Issues

**Download fails immediately**:
- Check CORS configuration in backend
- Verify API endpoint accessibility
- Ensure track file exists on server

**Progress stuck at 0%**:
- Backend might not be sending Content-Length header
- Network connection issues
- File too large for device storage

**Files not playing offline**:
- Check file integrity after download
- Verify proper URI generation
- Ensure player supports local file URIs

### Storage Cleanup

Users can manage storage through the Offline Library page:
- View all downloaded tracks
- See individual file sizes
- Delete individual tracks
- Clear entire offline library

## Future Enhancements

- [ ] Android support
- [ ] Automatic cleanup of old downloads
- [ ] Download queue management
- [ ] Offline playlist synchronization
- [ ] Background download support
- [ ] Download over WiFi only option
