"use client";

import { useState, useTransition } from "react";
import type { Project, ProjectStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/utils/format";
import { summarizeProjectLifecycle } from "@/utils/calculations";
import { createProject, updateProject, deleteProject } from "@/app/actions/projects";

interface ProjectsClientProps {
  projects: Project[];
}

function getStatusVariant(status: ProjectStatus) {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "READY":
      return "purple";
    case "PAUSED":
      return "warning";
    case "IN_PROGRESS":
      return "info";
    default:
      return "default";
  }
}

function getLifecycleOptions(project: Project) {
  const lifecycle = summarizeProjectLifecycle(project);
  const options: Array<{ value: string; label: string }> = [
    { value: "AUTO", label: `Use Derived Status (${lifecycle.effectiveStatus})` },
    { value: "PAUSED", label: "PAUSED" },
  ];

  if (lifecycle.canMarkCompleted || project.status === "COMPLETED") {
    options.push({ value: "COMPLETED", label: "COMPLETED" });
  }

  return options;
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const editingLifecycle = editingProject ? summarizeProjectLifecycle(editingProject) : null;
  const editingLifecycleOptions = editingProject ? getLifecycleOptions(editingProject) : [];
  const defaultLifecycleOption =
    editingProject && (editingProject.status === "PAUSED" || editingProject.status === "COMPLETED")
      ? editingProject.status
      : "AUTO";

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createProject(formData);
      setShowCreate(false);
    });
  }

  function handleUpdate(formData: FormData) {
    if (!editingProject) return;
    startTransition(async () => {
      await updateProject(editingProject.id, formData);
      setEditingProject(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    startTransition(() => deleteProject(id));
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-500 mt-1">Track your financial goals</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No projects yet</h3>
          <p className="text-gray-500 mb-6">Set up financial goals and track your progress.</p>
          <Button onClick={() => setShowCreate(true)}>Create your first project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((project) => {
            const lifecycle = summarizeProjectLifecycle(project);

            return (
              <Card key={project.id} className="relative overflow-hidden">
                <CardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      {project.notes && (
                        <p className="text-xs text-gray-500 mt-0.5">{project.notes}</p>
                      )}
                    </div>
                    <Badge variant={getStatusVariant(lifecycle.effectiveStatus)}>
                      {lifecycle.effectiveStatus}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-500">Funding Progress</span>
                      <span className="font-semibold text-gray-900">{lifecycle.progressPercentage}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all bg-gradient-to-r from-violet-500 to-purple-600"
                        style={{ width: `${lifecycle.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-gray-50 rounded-xl p-2">
                      <p className="text-xs text-gray-500">Funded</p>
                      <p className="text-sm font-bold text-violet-700">
                        {formatCurrency(lifecycle.fundedAmount)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2">
                      <p className="text-xs text-gray-500">Target</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(project.targetAmount)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2">
                      <p className="text-xs text-gray-500">Left</p>
                      <p
                        className={`text-sm font-bold ${
                          lifecycle.remainingAmount > 0 ? "text-amber-600" : "text-emerald-600"
                        }`}
                      >
                        {formatCurrency(lifecycle.remainingAmount)}
                      </p>
                    </div>
                  </div>

                  <p className="mb-3 text-xs text-gray-500">
                    Lifecycle is derived from active project-linked funding unless the project is manually paused or completed.
                  </p>

                  {project.legacySavedAmount > 0 && (
                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      Historical manual carryover: {formatCurrency(project.legacySavedAmount)}. This is preserved for reference only and is not counted as active project funding.
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingProject(project)} className="flex-1">
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(project.id)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Project" size="md">
        <form action={handleCreate} className="space-y-4">
          <Input name="title" label="Project Title" placeholder="e.g. Emergency Fund" required />
          <Input
            name="targetAmount"
            label="Target Amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="5000"
            required
          />
          <p className="text-xs text-gray-500">
            New projects start in PENDING and move through the lifecycle from project-linked savings activity.
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea
              name="notes"
              rows={2}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              placeholder="Any notes about this project..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={isPending}>Create Project</Button>
          </div>
        </form>
      </Modal>

      {editingProject && editingLifecycle && (
        <Modal isOpen={!!editingProject} onClose={() => setEditingProject(null)} title="Edit Project" size="md">
          <form action={handleUpdate} className="space-y-4">
            <Input name="title" label="Project Title" defaultValue={editingProject.title} required />
            <Input
              name="targetAmount"
              label="Target Amount"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={String(editingProject.targetAmount)}
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Lifecycle State</label>
              <select
                name="status"
                defaultValue={defaultLifecycleOption}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {editingLifecycleOptions.map((statusOption) => (
                  <option key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Current lifecycle: {editingLifecycle.effectiveStatus}. COMPLETED is only available once derived funding reaches the target.
              </p>
            </div>
            {editingProject.legacySavedAmount > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Historical manual carryover: {formatCurrency(editingProject.legacySavedAmount)}. This remains read-only during the migration transition and is not counted as active funding.
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <textarea
                name="notes"
                rows={2}
                defaultValue={editingProject.notes ?? ""}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingProject(null)}>Cancel</Button>
              <Button type="submit" loading={isPending}>Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
