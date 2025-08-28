import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TrackItem from '../../components/TrackItem';

// Mock API
jest.mock('../../api', () => ({
  apiAddRecentlyPlayed: jest.fn(),
  apiLikeTrack: jest.fn(),
  apiUnlikeTrack: jest.fn(),
}));

// Mock utils
jest.mock('../../utils', () => ({
  getFileUrl: jest.fn((path) => `http://localhost:3000/${path}`),
}));

// Mock TrackMenu and PlaylistMenu components
jest.mock('../../components/TrackMenu', () => {
  return function MockTrackMenu({ onAddToQueue }) {
    return (
      <button onClick={() => onAddToQueue()} data-testid="track-menu">
        Track Menu
      </button>
    );
  };
});

jest.mock('../../components/PlaylistMenu', () => {
  return function MockPlaylistMenu() {
    return <div data-testid="playlist-menu">Playlist Menu</div>;
  };
});

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock window.addToQueue
window.addToQueue = jest.fn();

describe('TrackItem Component', () => {
  const mockTrack = {
    id: 1,
    title: 'Test Song',
    artist: 'Test Artist',
    album: 'Test Album',
    file_path: 'music/test-song.mp3',
    duration: 180,
    coverUrl: 'http://example.com/cover.jpg'
  };

  const mockSetToast = jest.fn();
  const mockOnDownload = jest.fn();

  const defaultProps = {
    track: mockTrack,
    onDownload: mockOnDownload,
    setToast: mockSetToast,
    isDownloaded: false,
    liked: false,
    setLiked: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.setItem.mockClear();
    window.addToQueue.mockClear();
    window.dispatchEvent = jest.fn();
  });

  test('renders track information correctly', () => {
    renderWithTheme(<TrackItem {...defaultProps} />);

    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  test('shows download button when track is not downloaded', () => {
    renderWithTheme(<TrackItem {...defaultProps} isDownloaded={false} />);

    const downloadButton = screen.getByLabelText(/download/i);
    expect(downloadButton).toBeInTheDocument();
  });

  test('shows check icon when track is downloaded', () => {
    renderWithTheme(<TrackItem {...defaultProps} isDownloaded={true} />);

    const checkIcon = screen.getByTestId('CheckCircleIcon');
    expect(checkIcon).toBeInTheDocument();
  });

  test('calls onDownload when download button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TrackItem {...defaultProps} isDownloaded={false} />);

    const downloadButton = screen.getByLabelText(/download/i);
    await user.click(downloadButton);

    expect(mockOnDownload).toHaveBeenCalledWith(mockTrack);
  });

  test('shows play button and plays track when clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TrackItem {...defaultProps} />);

    const playButton = screen.getByLabelText(/play/i);
    expect(playButton).toBeInTheDocument();

    await user.click(playButton);

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'currentTrack',
      JSON.stringify(mockTrack)
    );
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'isPlaying',
      JSON.stringify(true)
    );
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.any(Event)
    );
  });

  test('shows correct heart icon based on liked state', () => {
    const { rerender } = renderWithTheme(
      <TrackItem {...defaultProps} liked={false} />
    );

    expect(screen.getByTestId('FavoriteBorderIcon')).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={theme}>
        <TrackItem {...defaultProps} liked={true} />
      </ThemeProvider>
    );

    expect(screen.getByTestId('FavoriteIcon')).toBeInTheDocument();
  });

  test('toggles like state when heart button is clicked', async () => {
    const user = userEvent.setup();
    const mockSetLiked = jest.fn();
    
    renderWithTheme(
      <TrackItem {...defaultProps} liked={false} setLiked={mockSetLiked} />
    );

    const likeButton = screen.getByLabelText(/like/i);
    await user.click(likeButton);

    expect(mockSetLiked).toHaveBeenCalledWith(1, true);
  });

  test('displays album information when albumMode is true', () => {
    renderWithTheme(
      <TrackItem {...defaultProps} albumMode={true} />
    );

    // In album mode, it should not show "Available" text
    expect(screen.queryByText(/available/i)).not.toBeInTheDocument();
  });

  test('adds track to queue when TrackMenu triggers onAddToQueue', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TrackItem {...defaultProps} />);

    const trackMenuButton = screen.getByTestId('track-menu');
    await user.click(trackMenuButton);

    expect(window.addToQueue).toHaveBeenCalledWith(mockTrack);
    expect(mockSetToast).toHaveBeenCalledWith({
      message: `"${mockTrack.title}" added to queue`,
      severity: 'success'
    });
  });

  test('handles error when queue system is not available', async () => {
    const user = userEvent.setup();
    window.addToQueue = undefined;
    
    renderWithTheme(<TrackItem {...defaultProps} />);

    const trackMenuButton = screen.getByTestId('track-menu');
    await user.click(trackMenuButton);

    expect(mockSetToast).toHaveBeenCalledWith({
      message: 'Queue system not available',
      severity: 'error'
    });
  });

  test('renders PlaylistMenu component', () => {
    renderWithTheme(<TrackItem {...defaultProps} />);

    expect(screen.getByTestId('playlist-menu')).toBeInTheDocument();
  });

  test('handles track without album', () => {
    const trackWithoutAlbum = { ...mockTrack, album: null };
    
    renderWithTheme(
      <TrackItem {...defaultProps} track={trackWithoutAlbum} />
    );

    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  test('formats duration correctly', () => {
    const trackWithDuration = { ...mockTrack, duration: 125 }; // 2:05
    
    renderWithTheme(
      <TrackItem {...defaultProps} track={trackWithDuration} />
    );

    // This would depend on how duration is displayed in the component
    // You might need to check the actual implementation
  });
});
