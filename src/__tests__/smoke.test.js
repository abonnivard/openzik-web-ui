import { render, screen } from '@testing-library/react';

// Simple smoke test
describe('Test Environment', () => {
  test('testing environment is working', () => {
    expect(true).toBe(true);
  });

  test('can render a simple div', () => {
    render(<div data-testid="test-div">Hello Test</div>);
    expect(screen.getByTestId('test-div')).toBeInTheDocument();
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });

  test('Math utilities work', () => {
    expect(2 + 2).toBe(4);
    expect(Math.max(1, 2, 3)).toBe(3);
  });

  test('Array operations work', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
  });

  test('String operations work', () => {
    const str = 'Hello World';
    expect(str.toLowerCase()).toBe('hello world');
    expect(str.split(' ')).toEqual(['Hello', 'World']);
  });
});
