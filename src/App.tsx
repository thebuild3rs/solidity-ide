import { Routes, Route, Navigate } from 'react-router-dom';
import { IDELayout } from '@/components/ide-layout';
import { TemplateGallery } from '@/components/protocol-templates/template-gallery';
import { Dashboard } from '@/components/analytics/dashboard';
import { Chat } from '@/components/collaboration/chat';
import { Settings } from '@/pages/Settings';
import { ProjectList } from '@/pages/ProjectList';
import { ProjectEditor } from '@/pages/ProjectEditor';
import { useTheme } from '@/components/theme-provider';

function App() {
  const { theme } = useTheme();

  return (
    <div className={`h-screen w-screen bg-background text-foreground ${theme}`}>
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/editor/:projectId" element={<ProjectEditor />} />
        <Route path="/templates" element={<TemplateGallery />} />
        <Route path="/analytics" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
}

export default App;