import { renderHook } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useTokenExpiration, triggerTokenExpiration } from '../hooks/useTokenExpiration';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

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

describe('useTokenExpiration Hook', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSessionStorage.removeItem.mockClear();
    // Clear any existing event listeners
    window.removeEventListener('token-expired', jest.fn());
  });

  const wrapper = ({ children }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  test('should add event listener for token-expired event', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useTokenExpiration(), { wrapper });

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'token-expired',
      expect.any(Function)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'token-expired',
      expect.any(Function)
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test('should handle token expiration event', () => {
    renderHook(() => useTokenExpiration(), { wrapper });

    // Simulate token expiration event
    const tokenExpiredEvent = new CustomEvent('token-expired');
    window.dispatchEvent(tokenExpiredEvent);

    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  test('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useTokenExpiration(), { wrapper });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'token-expired',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });
});

describe('triggerTokenExpiration', () => {
  test('should dispatch token-expired event', () => {
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

    triggerTokenExpiration();

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'token-expired'
      })
    );

    dispatchEventSpy.mockRestore();
  });
});
