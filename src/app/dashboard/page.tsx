// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import Header from '@/components/Header';
import { MindmapLimitBanner } from '@/components/MindmapLimitBanner';
import { SpaceBackground } from '@/components/ui/space-background';

interface Project {
  id: string;
  project_name: string;
  idea: string;
  status: string;
  created_at: string;
  last_accessed_at: string;
  mindmap_data: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'created'>('recent');

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }

    if (user) {
      fetchProjects();
    }
  }, [user, isLoaded, router]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const result = await response.json();
      
      if (result.success) {
        setProjects(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const duplicateProject = async (project: Project) => {
    try {
      const response = await fetch('/api/projects/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      });

      const result = await response.json();

      if (result.success) {
        setProjects([result.data, ...projects]);
      }
    } catch (error) {
      console.error('Error duplicating project:', error);
      alert('Failed to duplicate project');
    }
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter(p => {
      // Filter by status
      if (filter !== 'all' && p.status !== filter) return false;
      
      // Filter by search query
      if (searchQuery && !p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !p.idea.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime();
      } else if (sortBy === 'name') {
        return a.project_name.localeCompare(b.project_name);
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <SpaceBackground variant="subtle">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Loading your projects...</p>
          </div>
        </div>
      </SpaceBackground>
    );
  }

  return (
    <SpaceBackground variant="default">
      <Header title="My Projects" />
      <div className="container mx-auto px-4 py-8">
        {/* Mindmap Limit Banner */}
        <MindmapLimitBanner />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            My Projects
          </h1>
          <p className="text-gray-400 text-lg">
            Transform your ideas into production-ready applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="text-3xl mb-2">📁</div>
            <div className="text-2xl font-bold text-white">{projects.length}</div>
            <div className="text-sm text-gray-300">Total Projects</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-white">
              {projects.filter(p => p.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-300">Draft</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="text-3xl mb-2">🚀</div>
            <div className="text-2xl font-bold text-white">
              {projects.filter(p => p.status === 'active').length}
            </div>
            <div className="text-sm text-gray-300">Active</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-white">
              {projects.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-300">Completed</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full px-4 py-2 border border-purple-500/20 bg-gray-900 text-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-purple-500/20 bg-gray-900 text-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Projects</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-purple-500/20 bg-gray-900 text-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="recent">Recently Accessed</option>
                <option value="created">Date Created</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Create New Project Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Link
            href="/create"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all hover:shadow-lg duration-200 transform hover:scale-105"
          >
            ➕ Create New Project
          </Link>
          <Link
            href="/build"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-cyan-700 transition-all hover:shadow-lg duration-200 transform hover:scale-105 border-2 border-blue-400/30"
          >
            🎯 Interactive Builder (NEW!)
          </Link>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 border-2 border-dashed border-purple-500/30 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-white mb-2">No projects found</h3>
            <p className="text-gray-300 mb-6">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Start by creating your first project!'}
            </p>
            {!searchQuery && filter === 'all' && (
              <Link
                href="/create"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all hover:shadow-lg duration-200 transform hover:scale-105"
              >
                🚀 Create Your First Project
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              // Calculate feature count from mindmap data
              const featureCount = project.mindmap_data?.features?.length || 0;
              const status = project.status as 'planned' | 'in-progress' | 'complete' | 'draft' | 'active' | 'completed';
              
              // Map status to display format
              const displayStatus = status === 'active' ? 'in-progress' : 
                                   status === 'completed' ? 'complete' : 
                                   status === 'draft' ? 'planned' : status;
              
              return (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.project_name}
                  description={project.idea}
                  features={featureCount}
                  status={displayStatus}
                  created_at={project.created_at}
                  last_accessed_at={project.last_accessed_at}
                  onDuplicate={() => duplicateProject(project)}
                  onDelete={() => deleteProject(project.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </SpaceBackground>
  );
}

// Enhanced Project Card Component
function ProjectCard({ 
  id, 
  title, 
  description, 
  features, 
  status,
  created_at,
  last_accessed_at,
  onDuplicate,
  onDelete
}: {
  id: string;
  title: string;
  description: string;
  features: number;
  status: 'planned' | 'in-progress' | 'complete';
  created_at: string;
  last_accessed_at: string;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const statusConfig = {
    'planned': { color: 'text-gray-400', bg: 'bg-gray-800/50', label: 'Planned' },
    'in-progress': { color: 'text-blue-400', bg: 'bg-blue-900/30', label: 'In Progress' },
    'complete': { color: 'text-green-400', bg: 'bg-green-900/30', label: 'Complete' },
  };

  const config = statusConfig[status] || statusConfig.planned;
  const progress = status === 'in-progress' ? Math.min(67, features * 5) : status === 'complete' ? 100 : 0;

  return (
    <div className="group relative">
      {/* Card Glow on Hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur transition duration-500" />
      
      {/* Card Content */}
      <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/70 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
            {config.label}
          </span>
          <span className="text-gray-400 text-sm">{features} {features === 1 ? 'feature' : 'features'}</span>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
          {title}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {description}
        </p>

        {/* Metadata */}
        <div className="text-xs text-gray-500 mb-4 space-y-1">
          <div>Created: {new Date(created_at).toLocaleDateString()}</div>
          <div>Last accessed: {new Date(last_accessed_at).toLocaleDateString()}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/project/${id}`}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Open Project
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            title="Duplicate"
          >
            ⚙️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg transition-colors"
            title="Delete"
          >
            🗑️
          </button>
        </div>

        {/* Progress Bar (for in-progress projects) */}
        {status === 'in-progress' && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Progress</span>
              <span className="text-xs text-blue-400">{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
