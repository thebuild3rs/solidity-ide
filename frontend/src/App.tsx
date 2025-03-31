import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './utils/theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProjectEditor from './pages/ProjectEditor';
import ProjectList from './pages/ProjectList';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Box sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/project/:id" element={<ProjectEditor />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Box>
        </Layout>
      </Router>
    </ThemeProvider>
  );
};

export default App; 