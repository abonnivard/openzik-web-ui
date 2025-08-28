import { getFileUrl, getApiBaseUrl } from '../utils';

// Mock environment variables
const originalEnv = process.env;

describe('Utility Functions', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getApiBaseUrl', () => {
    test('should return default localhost URL when REACT_APP_API_BASE_URL is not set', () => {
      delete process.env.REACT_APP_API_BASE_URL;
      const url = getApiBaseUrl();
      expect(url).toBe('http://localhost:3000');
    });

    test('should return environment variable when REACT_APP_API_BASE_URL is set', () => {
      process.env.REACT_APP_API_BASE_URL = 'https://api.example.com';
      // Need to re-import to get the new env var
      jest.resetModules();
      const { getApiBaseUrl: getApiBaseUrlNew } = require('../utils');
      const url = getApiBaseUrlNew();
      expect(url).toBe('https://api.example.com');
    });
  });

  describe('getFileUrl', () => {
    test('should return empty string for null/undefined file path', () => {
      expect(getFileUrl(null)).toBe('');
      expect(getFileUrl(undefined)).toBe('');
      expect(getFileUrl('')).toBe('');
    });

    test('should generate correct URL for simple file path', () => {
      const filePath = 'music/song.mp3';
      const result = getFileUrl(filePath);
      expect(result).toBe('http://localhost:3000/music/song.mp3');
    });

    test('should encode special characters in file path', () => {
      const filePath = 'music/Artist Name - Song Title (Remix).mp3';
      const result = getFileUrl(filePath);
      expect(result).toBe('http://localhost:3000/music/Artist%20Name%20-%20Song%20Title%20(Remix).mp3');
    });

    test('should handle Windows-style paths', () => {
      const filePath = 'music\\Artist\\Album\\song.mp3';
      const result = getFileUrl(filePath);
      expect(result).toBe('http://localhost:3000/music/Artist/Album/song.mp3');
    });

    test('should handle mixed path separators', () => {
      const filePath = 'music/Artist\\song.mp3';
      const result = getFileUrl(filePath);
      expect(result).toBe('http://localhost:3000/music/Artist/song.mp3');
    });

    test('should encode unicode characters', () => {
      const filePath = 'music/Artiste Français - Café.mp3';
      const result = getFileUrl(filePath);
      expect(result).toBe('http://localhost:3000/music/Artiste%20Fran%C3%A7ais%20-%20Caf%C3%A9.mp3');
    });
  });
});
