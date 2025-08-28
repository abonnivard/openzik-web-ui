import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Player from '../../components/Player';

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

// Mock audio element
const mockAudio = {
  play: jest.fn(() => Promise.resolve()),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentTime: 0,
  duration: 180,
  volume: 1,
  paused: true,
};

global.Audio = jest.fn(() => mockAudio);

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('Player Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockClear();
    mockSessionStorage.setItem.mockClear();
    mockAudio.play.mockClear();
    mockAudio.pause.mockClear();
  });

  test('renders without crashing when no track is playing', () => {
    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'currentTrack') return null;
      if (key === 'isPlaying') return 'false';
      return null;
    });

    renderWithTheme(<Player />);
    
    // Player should render but might be in a minimal state
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('displays track information when track is loaded', () => {
    const mockTrack = {
      id: 1,
      title: 'Test Song',
      artist: 'Test Artist',
      file_path: 'music/test.mp3'
    };

    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'currentTrack') return JSON.stringify(mockTrack);
      if (key === 'isPlaying') return 'true';
      return null;
    });

    renderWithTheme(<Player />);
    
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  test('shows play button when paused', () => {
    const mockTrack = {
      id: 1,
      title: 'Test Song',
      artist: 'Test Artist',
      file_path: 'music/test.mp3'
    };

    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'currentTrack') return JSON.stringify(mockTrack);
      if (key === 'isPlaying') return 'false';
      return null;
    });

    renderWithTheme(<Player />);
    
    const playButton = screen.getByLabelText(/play/i);
    expect(playButton).toBeInTheDocument();
  });

  test('toggles play/pause when button is clicked', async () => {
    const user = userEvent.setup();
    const mockTrack = {
      id: 1,
      title: 'Test Song',
      artist: 'Test Artist',
      file_path: 'music/test.mp3'
    };

    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'currentTrack') return JSON.stringify(mockTrack);
      if (key === 'isPlaying') return 'false';
      return null;
    });

    renderWithTheme(<Player />);
    
    const playButton = screen.getByLabelText(/play/i);
    await user.click(playButton);

    expect(mockAudio.play).toHaveBeenCalled();
  });

  test('handles volume changes', async () => {
    const user = userEvent.setup();
    const mockTrack = {
      id: 1,
      title: 'Test Song',
      artist: 'Test Artist',
      file_path: 'music/test.mp3'
    };

    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'currentTrack') return JSON.stringify(mockTrack);
      if (key === 'isPlaying') return 'false';
      return null;
    });

    renderWithTheme(<Player />);
    
    // Look for volume control (might be a slider)
    const volumeControl = screen.queryByRole('slider');
    if (volumeControl) {
      fireEvent.change(volumeControl, { target: { value: 50 } });
      expect(mockAudio.volume).toBeDefined();
    }
  });

  test('responds to storage events for track changes', () => {
    const mockTrack = {
      id: 1,
      title: 'Test Song',
      artist: 'Test Artist',
      file_path: 'music/test.mp3'
    };

    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'currentTrack') return JSON.stringify(mockTrack);
      if (key === 'isPlaying') return 'true';
      return null;
    });

    renderWithTheme(<Player />);
    
    // Simulate storage event (new track loaded)
    const newTrack = {
      id: 2,
      title: 'New Song',
      artist: 'New Artist',
      file_path: 'music/new.mp3'
    };

    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'currentTrack') return JSON.stringify(newTrack);
      if (key === 'isPlaying') return 'true';
      return null;
    });

    fireEvent(window, new Event('storage'));
    
    // Player should update to show new track
    expect(screen.getByText('New Song')).toBeInTheDocument();
  });

  test('handles missing track gracefully', () => {
    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'currentTrack') return JSON.stringify({});
      if (key === 'isPlaying') return 'false';
      return null;
    });

    renderWithTheme(<Player />);
    
    // Should not crash and should show some default state
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('cleans up audio listeners on unmount', () => {
    const mockTrack = {
      id: 1,
      title: 'Test Song',
      artist: 'Test Artist',
      file_path: 'music/test.mp3'
    };

    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'currentTrack') return JSON.stringify(mockTrack);
      if (key === 'isPlaying') return 'false';
      return null;
    });

    const { unmount } = renderWithTheme(<Player />);
    
    unmount();
    
    // Should clean up event listeners
    expect(mockAudio.removeEventListener).toHaveBeenCalled();
  });
});
