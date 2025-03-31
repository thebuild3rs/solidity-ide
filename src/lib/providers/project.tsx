import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import type { Project, Contract } from '@/lib/types';

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  createProject: (name: string, description: string) => Promise<void>;
  openProject: (id: string) => Promise<void>;
  saveProject: () => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addContract: (contract: Contract) => void;
  removeContract: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType>({
  currentProject: null,
  projects: [],
  createProject: async () => {},
  openProject: async () => {},
  saveProject: async () => {},
  deleteProject: async () => {},
  addContract: () => {},
  removeContract: () => {},
});

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load projects from localStorage on mount
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  const createProject = async (name: string, description: string) => {
    try {
      const newProject: Project = {
        id: Date.now().toString(),
        name,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        contracts: [],
        wallets: [],
      };

      setProjects([...projects, newProject]);
      setCurrentProject(newProject);
      localStorage.setItem('projects', JSON.stringify([...projects, newProject]));

      toast({
        title: 'Project Created',
        description: `Successfully created ${name}`,
      });

      navigate(`/editor/${newProject.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  const openProject = async (id: string) => {
    try {
      const project = projects.find(p => p.id === id);
      if (!project) {
        throw new Error('Project not found');
      }

      setCurrentProject(project);
      navigate(`/editor/${id}`);
    } catch (error) {
      console.error('Failed to open project:', error);
      toast({
        title: 'Error',
        description: 'Failed to open project',
        variant: 'destructive',
      });
    }
  };

  const saveProject = async () => {
    try {
      if (!currentProject) {
        throw new Error('No project selected');
      }

      const updatedProjects = projects.map(p =>
        p.id === currentProject.id ? currentProject : p
      );

      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));

      toast({
        title: 'Project Saved',
        description: 'Changes saved successfully',
      });
    } catch (error) {
      console.error('Failed to save project:', error);
      toast({
        title: 'Error',
        description: 'Failed to save project',
        variant: 'destructive',
      });
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const updatedProjects = projects.filter(p => p.id !== id);
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));

      if (currentProject?.id === id) {
        setCurrentProject(null);
        navigate('/projects');
      }

      toast({
        title: 'Project Deleted',
        description: 'Project deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  const addContract = (contract: Contract) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      contracts: [...currentProject.contracts, contract],
      updatedAt: new Date().toISOString(),
    };

    setCurrentProject(updatedProject);
    setProjects(projects.map(p =>
      p.id === currentProject.id ? updatedProject : p
    ));
  };

  const removeContract = (id: string) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      contracts: currentProject.contracts.filter(c => c.id !== id),
      updatedAt: new Date().toISOString(),
    };

    setCurrentProject(updatedProject);
    setProjects(projects.map(p =>
      p.id === currentProject.id ? updatedProject : p
    ));
  };

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projects,
        createProject,
        openProject,
        saveProject,
        deleteProject,
        addContract,
        removeContract,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => useContext(ProjectContext); 