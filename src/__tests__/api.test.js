import * as api from '../api';

// Mock fetch
global.fetch = jest.fn();

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

// Mock window location
delete window.location;
window.location = { href: '', pathname: '/' };

// Mock window events
window.dispatchEvent = jest.fn();

describe('API Module', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockSessionStorage.getItem.mockClear();
    mockSessionStorage.setItem.mockClear();
    mockSessionStorage.removeItem.mockClear();
    window.dispatchEvent.mockClear();
    window.location.href = '';
    window.location.pathname = '/';
  });

  describe('requestWithToken', () => {
    test('should make request without token when not logged in', async () => {
      mockSessionStorage.getItem.mockReturnValue(null);
      
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      });

      // We need to import requestWithToken function
      // Since it's not exported, we'll test through other functions that use it
      const result = await api.getLibraryStats();
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/stats'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    test('should include Authorization header when token exists', async () => {
      const mockToken = 'test-jwt-token';
      mockSessionStorage.getItem.mockReturnValue(mockToken);
      
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      });

      await api.getLibraryStats();
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/stats'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
    });

    test('should handle 401 unauthorized and dispatch token-expired event', async () => {
      mockSessionStorage.getItem.mockReturnValue('expired-token');
      
      fetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized')
      });

      await expect(api.getLibraryStats()).rejects.toThrow('Session expired');
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'token-expired'
        })
      );
    });

    test('should handle non-401 errors', async () => {
      mockSessionStorage.getItem.mockReturnValue('valid-token');
      
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error')
      });

      await expect(api.getLibraryStats()).rejects.toThrow('Internal Server Error');
    });
  });

  describe('Authentication functions', () => {
    test('login should return user data on success', async () => {
      const mockResponse = { token: 'jwt-token', user: { id: 1, username: 'test' } };
      
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.login('test@example.com', 'password');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password'
          })
        })
      );
      
      expect(result).toEqual(mockResponse);
    });

    test('register should create new user', async () => {
      const mockResponse = { message: 'User created successfully' };
      
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.register('test@example.com', 'password', 'testuser');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/login/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password',
            username: 'testuser'
          })
        })
      );
      
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Search functions', () => {
    test('searchSpotify should return search results', async () => {
      const mockResults = {
        tracks: [{ id: '1', name: 'Test Song', artist: 'Test Artist' }]
      };
      
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResults)
      });

      const result = await api.searchSpotify('test query');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/spotify?q=test%20query')
      );
      
      expect(result).toEqual(mockResults);
    });

    test('searchLocal should return local search results', async () => {
      const mockResults = {
        songs: [{ id: 1, title: 'Local Song', artist: 'Local Artist' }]
      };
      
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResults)
      });

      const result = await api.searchLocal('local query');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/local?q=local%20query')
      );
      
      expect(result).toEqual(mockResults);
    });
  });

  describe('Library functions', () => {
    test('getLibraryStats should return statistics', async () => {
      const mockStats = {
        totalSongs: 100,
        totalArtists: 20,
        totalAlbums: 15
      };
      
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStats)
      });

      const result = await api.getLibraryStats();
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/stats')
      );
      
      expect(result).toEqual(mockStats);
    });
  });
});
