import { ThemeProvider } from './ThemeContext';
import Navigation from './Navigation';

export default function App() {
  return (
    <ThemeProvider>
      <Navigation />
    </ThemeProvider>
  );
}
