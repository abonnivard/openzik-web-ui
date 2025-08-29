// Offline download service for native platforms
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { hasOfflineSupport } from '../utils/platform';
import { getApiBaseUrl } from '../utils';

const MUSIC_DIRECTORY = 'OfflineMusic';
const METADATA_FILE = 'offline_tracks.json';

class OfflineDownloadService {
  constructor() {
    this.downloads = new Map(); // trackId -> download progress
    this.offlineTracks = new Map(); // trackId -> local file info
    this.initializeOfflineStorage();
  }

  async initializeOfflineStorage() {
    if (!hasOfflineSupport()) return;

    try {
      // Create offline music directory if it doesn't exist
      await Filesystem.mkdir({
        path: MUSIC_DIRECTORY,
        directory: Directory.Documents,
        recursive: true
      });

      // Load existing offline tracks metadata
      await this.loadOfflineMetadata();
    } catch (error) {
      console.log('Initializing offline storage:', error);
    }
  }

  async loadOfflineMetadata() {
    try {
      const result = await Filesystem.readFile({
        path: `${MUSIC_DIRECTORY}/${METADATA_FILE}`,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

      const metadata = JSON.parse(result.data);
      this.offlineTracks = new Map(Object.entries(metadata));
    } catch (error) {
      // File doesn't exist yet, that's ok
      console.log('No existing offline metadata found');
    }
  }

  async saveOfflineMetadata() {
    try {
      const metadata = Object.fromEntries(this.offlineTracks);
      await Filesystem.writeFile({
        path: `${MUSIC_DIRECTORY}/${METADATA_FILE}`,
        directory: Directory.Documents,
        data: JSON.stringify(metadata, null, 2),
        encoding: Encoding.UTF8
      });
    } catch (error) {
      console.error('Failed to save offline metadata:', error);
    }
  }

  // Download a track for offline use
  async downloadTrack(track, onProgress = null, playlistInfo = null) {
    if (!hasOfflineSupport()) {
      throw new Error('Offline downloads not supported on this platform');
    }

    const trackId = track.id.toString();
    console.log('Starting download for track:', trackId, track.title);
    
    // Check if already downloaded
    if (this.isTrackOffline(trackId)) {
      throw new Error('Track already downloaded offline');
    }

    // Check if already downloading
    if (this.downloads.has(trackId)) {
      throw new Error('Track download already in progress');
    }

    try {
      this.downloads.set(trackId, { progress: 0, status: 'starting' });
      console.log('Set download progress for track:', trackId);
      
      // Get the audio file URL
      const audioUrl = `${getApiBaseUrl()}/${track.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`;
      console.log('Downloading from URL:', audioUrl);
      
      // Download the file
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
      }

      const totalSize = parseInt(response.headers.get('content-length') || '0');
      let downloadedSize = 0;
      console.log('Total file size:', totalSize, 'bytes');

      // Read the response as array buffer for iOS compatibility
      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        downloadedSize += value.length;

        const progress = totalSize > 0 ? (downloadedSize / totalSize) * 100 : 0;
        this.downloads.set(trackId, { progress, status: 'downloading' });
        
        if (onProgress) {
          onProgress(progress);
        }
      }

      // Combine chunks into a single array buffer
      const audioData = new Uint8Array(downloadedSize);
      let offset = 0;
      for (const chunk of chunks) {
        audioData.set(chunk, offset);
        offset += chunk.length;
      }

      // Generate filename
      const fileExtension = track.file_path.split('.').pop() || 'mp3';
      const fileName = `${trackId}.${fileExtension}`;
      const filePath = `${MUSIC_DIRECTORY}/${fileName}`;
      console.log('Saving file to:', filePath);

      // Save to device storage
      await Filesystem.writeFile({
        path: filePath,
        directory: Directory.Documents,
        data: this.arrayBufferToBase64(audioData.buffer)
      });
      console.log('File saved successfully');

      // Save track metadata
      const offlineTrack = {
        ...track,
        localPath: filePath,
        downloadedAt: new Date().toISOString(),
        fileSize: downloadedSize,
        playlistName: playlistInfo?.name || null,
        playlistId: playlistInfo?.id || null
      };

      this.offlineTracks.set(trackId, offlineTrack);
      await this.saveOfflineMetadata();
      console.log('Track metadata saved:', trackId);

      // Clean up download tracking
      this.downloads.delete(trackId);
      console.log('Download completed successfully for:', track.title);

      return offlineTrack;

    } catch (error) {
      console.error('Download failed for track:', trackId, error);
      this.downloads.delete(trackId);
      throw error;
    }
  }

  // Check if a track is available offline
  isTrackOffline(trackId) {
    return this.offlineTracks.has(trackId.toString());
  }

  // Get offline track info
  getOfflineTrack(trackId) {
    return this.offlineTracks.get(trackId.toString());
  }

  // Get all offline tracks
  async getAllOfflineTracks() {
    if (!hasOfflineSupport()) {
      return [];
    }
    
    try {
      // Ensure the service is initialized
      if (this.offlineTracks.size === 0) {
        await this.loadOfflineMetadata();
      }
      return Array.from(this.offlineTracks.values());
    } catch (error) {
      console.error('Error getting offline tracks:', error);
      return [];
    }
  }

  // Get all offline playlists (placeholder for now)
  async getAllOfflinePlaylists() {
    // For now, return empty array as playlists aren't implemented yet
    return [];
  }

  // Get download progress for a track
  getDownloadProgress(trackId) {
    return this.downloads.get(trackId.toString());
  }

  // Delete offline track
  async deleteOfflineTrack(trackId) {
    const trackIdStr = trackId.toString();
    const offlineTrack = this.offlineTracks.get(trackIdStr);
    
    if (!offlineTrack) return false;

    try {
      // Delete the file
      await Filesystem.deleteFile({
        path: offlineTrack.localPath,
        directory: Directory.Documents
      });

      // Remove from metadata
      this.offlineTracks.delete(trackIdStr);
      await this.saveOfflineMetadata();

      return true;
    } catch (error) {
      console.error('Failed to delete offline track:', error);
      return false;
    }
  }

  // Get local file URI for playing
  async getOfflineTrackUri(trackId) {
    const offlineTrack = this.getOfflineTrack(trackId);
    if (!offlineTrack) return null;

    try {
      const result = await Filesystem.getUri({
        directory: Directory.Documents,
        path: offlineTrack.localPath
      });
      return result.uri;
    } catch (error) {
      console.error('Failed to get offline track URI:', error);
      return null;
    }
  }

  // Get offline storage stats
  async getStorageStats() {
    const tracks = this.getAllOfflineTracks();
    const totalTracks = tracks.length;
    const totalSize = tracks.reduce((sum, track) => sum + (track.fileSize || 0), 0);

    return {
      totalTracks,
      totalSize,
      totalSizeFormatted: this.formatFileSize(totalSize)
    };
  }

  // Utility functions
  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Create singleton instance
export const offlineDownloadService = new OfflineDownloadService();
export default offlineDownloadService;
