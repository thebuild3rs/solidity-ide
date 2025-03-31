import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { EthereumProvider } from '@/lib/providers/ethereum';
import { ProjectProvider } from '@/lib/providers/project';
import { FileSystemProvider } from '@/lib/providers/fileSystem';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <EthereumProvider>
        <ProjectProvider>
          <FileSystemProvider>
            {children}
            <Toaster />
          </FileSystemProvider>
        </ProjectProvider>
      </EthereumProvider>
    </ThemeProvider>
  );
} 