/**
 * Admin Projects Page
 *
 * Displays all projects with their status for tracking project progress.
 * Allows filtering by project status and searching by client or business name.
 */

import { ProjectList } from '@/components/admin/projects';

export default function ProjectsPage() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track project progress across all clients. Update status, add notes, and manage go-live dates.
        </p>
      </div>

      {/* Project list */}
      <ProjectList />
    </div>
  );
}
