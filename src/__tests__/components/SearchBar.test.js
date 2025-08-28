import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SearchBar from '../../components/SearchBar';

// Create a theme for testing
const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('SearchBar Component', () => {
  const mockSetQuery = jest.fn();
  const mockOnSearch = jest.fn();
  const defaultProps = {
    query: '',
    setQuery: mockSetQuery,
    onSearch: mockOnSearch,
  };

  beforeEach(() => {
    mockSetQuery.mockClear();
    mockOnSearch.mockClear();
  });

  test('renders search input with correct placeholder', () => {
    renderWithTheme(<SearchBar {...defaultProps} />);
    
    const searchInput = screen.getByLabelText(/search music, artist or album/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('renders search button', () => {
    renderWithTheme(<SearchBar {...defaultProps} />);
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeInTheDocument();
  });

  test('displays current query value', () => {
    const queryValue = 'The Beatles';
    renderWithTheme(
      <SearchBar {...defaultProps} query={queryValue} />
    );
    
    const searchInput = screen.getByDisplayValue(queryValue);
    expect(searchInput).toBeInTheDocument();
  });

  test('calls setQuery when user types in input', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SearchBar {...defaultProps} />);
    
    const searchInput = screen.getByLabelText(/search music, artist or album/i);
    await user.type(searchInput, 'Beatles');
    
    expect(mockSetQuery).toHaveBeenCalledTimes(7); // Called for each character
    expect(mockSetQuery).toHaveBeenLastCalledWith('Beatles');
  });

  test('calls onSearch when Enter key is pressed', () => {
    renderWithTheme(<SearchBar {...defaultProps} />);
    
    const searchInput = screen.getByLabelText(/search music, artist or album/i);
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  test('calls onSearch when search button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SearchBar {...defaultProps} />);
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);
    
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  test('does not call onSearch when other keys are pressed', () => {
    renderWithTheme(<SearchBar {...defaultProps} />);
    
    const searchInput = screen.getByLabelText(/search music, artist or album/i);
    fireEvent.keyDown(searchInput, { key: 'Tab', code: 'Tab' });
    fireEvent.keyDown(searchInput, { key: 'Escape', code: 'Escape' });
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  test('input has correct styling properties', () => {
    renderWithTheme(<SearchBar {...defaultProps} />);
    
    const searchInput = screen.getByLabelText(/search music, artist or album/i);
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  test('handles empty query correctly', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SearchBar {...defaultProps} query="" />);
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);
    
    // Should still call onSearch even with empty query
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  test('updates when query prop changes', () => {
    const { rerender } = renderWithTheme(
      <SearchBar {...defaultProps} query="initial" />
    );
    
    expect(screen.getByDisplayValue('initial')).toBeInTheDocument();
    
    rerender(
      <ThemeProvider theme={theme}>
        <SearchBar {...defaultProps} query="updated" />
      </ThemeProvider>
    );
    
    expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
  });
});
