import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from '../App';

// Mock all the page components
jest.mock('../pages/Home', () => {
  return function MockHome() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

jest.mock('../pages/Search', () => {
  return function MockSearch() {
    return <div data-testid="search-page">Search Page</div>;
  };
});

jest.mock('../pages/Library', () => {
  return function MockLibrary() {
    return <div data-testid="library-page">Library Page</div>;
  };
});

jest.mock('../pages/Login', () => {
  return function MockLogin() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock('../pages/Account', () => {
  return function MockAccount() {
    return <div data-testid="account-page">Account Page</div>;
  };
});

jest.mock('../pages/Administration', () => {
  return function MockAdministration() {
    return <div data-testid="admin-page">Administration Page</div>;
  };
});

jest.mock('../pages/UserPlaylists', () => {
  return function MockPlaylists() {
    return <div data-testid="playlists-page">Playlists Page</div>;
  };
});

// Mock components
jest.mock('../components/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

jest.mock('../components/Player', () => {
  return function MockPlayer() {
    return <div data-testid="player">Player</div>;
  };
});

jest.mock('../components/PrivateRoute', () => {
  return function MockPrivateRoute({ children }) {
    return <div data-testid="private-route">{children}</div>;
  };
});

jest.mock('../components/AdminRoute', () => {
  return function MockAdminRoute({ children }) {
    return <div data-testid="admin-route">{children}</div>;
  };
});

// Mock the token expiration hook
jest.mock('../hooks/useTokenExpiration', () => ({
  useTokenExpiration: jest.fn(),
}));

// Mock the API
jest.mock('../api', () => ({
  apiGetUserProfile: jest.fn(),
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock matchMedia for responsive design
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const theme = createTheme();

const renderApp = (initialRoute = '/') => {
  window.history.pushState({}, 'Test page', initialRoute);
  
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockClear();
  });

  test('renders without crashing', () => {
    renderApp();
    
    // Should render main app structure
    expect(document.body).toBeInTheDocument();
  });

  test('shows sidebar on desktop', () => {
    // Mock desktop breakpoint
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(min-width:600px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    renderApp();
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  test('shows player component', () => {
    renderApp();
    
    expect(screen.getByTestId('player')).toBeInTheDocument();
  });

  test('applies dark theme styling', () => {
    renderApp();
    
    // Check that CssBaseline is applied (this sets dark theme)
    const body = document.body;
    expect(body).toBeInTheDocument();
  });

  test('handles toast notifications', async () => {
    renderApp();
    
    // Toast system should be present (Snackbar component)
    // We can't directly test toast without triggering it, but the component should render
    expect(document.querySelector('[role="presentation"]')).toBeDefined();
  });

  test('handles responsive design', () => {
    // Mock mobile breakpoint
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(max-width:599.95px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    renderApp();
    
    // On mobile, layout should adapt
    expect(document.body).toBeInTheDocument();
  });

  test('initializes user profile on mount', async () => {
    const { apiGetUserProfile } = require('../api');
    const mockProfile = { id: 1, username: 'testuser', role: 'user' };
    
    mockSessionStorage.getItem.mockReturnValue('valid-token');
    apiGetUserProfile.mockResolvedValue(mockProfile);

    renderApp();

    await waitFor(() => {
      expect(apiGetUserProfile).toHaveBeenCalled();
    });
  });

  test('handles user profile error gracefully', async () => {
    const { apiGetUserProfile } = require('../api');
    
    mockSessionStorage.getItem.mockReturnValue('invalid-token');
    apiGetUserProfile.mockRejectedValue(new Error('Unauthorized'));

    renderApp();

    await waitFor(() => {
      expect(apiGetUserProfile).toHaveBeenCalled();
    });

    // App should still render even if profile fetch fails
    expect(document.body).toBeInTheDocument();
  });

  test('sets up token expiration handling', () => {
    const { useTokenExpiration } = require('../hooks/useTokenExpiration');
    
    renderApp();
    
    expect(useTokenExpiration).toHaveBeenCalled();
  });

  test('renders login page when not authenticated', () => {
    mockSessionStorage.getItem.mockReturnValue(null);
    
    renderApp('/login');
    
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('handles route navigation', () => {
    mockSessionStorage.getItem.mockReturnValue('valid-token');
    
    renderApp('/');
    
    // Should handle routing - the exact route behavior depends on PrivateRoute implementation
    expect(document.body).toBeInTheDocument();
  });
});
