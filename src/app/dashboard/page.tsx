// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import Header from '@/components/Header';

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header title="My Projects" />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
            📊 My Projects
          </h1>
          <p className="text-gray-300">Manage and track all your CodeLaunch projects</p>
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

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4 items-center">
          <Link
            href="/create"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all hover:shadow-lg duration-200 transform hover:scale-105"
          >
            ➕ Create New Project
          </Link>
          
          <Link
            href="/dashboard/subscription"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 border border-purple-500/20 text-white font-semibold rounded-xl shadow-lg hover:bg-gray-700/50 hover:border-purple-500/40 transition-all hover:shadow-lg duration-200 transform hover:scale-105"
          >
            <CreditCard className="w-5 h-5" />
            Subscription
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
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden group"
              >
                {/* Project Header */}
                <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                    {project.project_name}
                  </h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                {/* Project Body */}
                <div className="p-6">
                  <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                    {project.idea}
                  </p>

                  <div className="text-xs text-gray-400 mb-4">
                    <div>Created: {new Date(project.created_at).toLocaleDateString()}</div>
                    <div>Last accessed: {new Date(project.last_accessed_at).toLocaleDateString()}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/project/${project.id}`}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => duplicateProject(project)}
                      className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      title="Duplicate"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
