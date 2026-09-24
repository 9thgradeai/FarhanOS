import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { TerminalBootLoader } from './components/TerminalBootLoader/TerminalBootLoader';
import { parseResumeRoute } from './components/ResumeDocument';
import './index.css';

// The printable resume route skips the cinematic boot — visitors arriving
// via #/resume want the document immediately.
const resumeRoute = parseResumeRoute();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {resumeRoute ? (
      <App />
    ) : (
      <TerminalBootLoader>
        <App />
      </TerminalBootLoader>
    )}
  </StrictMode>,
);
