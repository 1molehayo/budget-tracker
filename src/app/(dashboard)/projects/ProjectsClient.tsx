"use client";

import { useState, useTransition } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import type { Project, ProjectStatus } from "@/types";
import { Button } from "@/foundations/ui/button/button";
import { Badge } from "@/foundations/ui/badge/badge";
import { Dialog } from "@/foundations/ui/dialog/dialog";
import { Field } from "@/foundations/ui/field/field";
import { Input } from "@/foundations/ui/input/input";
import { Progress } from "@/foundations/ui/progress/progress";
import { Select } from "@/foundations/ui/select/select";
import { Textarea } from "@/foundations/ui/textarea/textarea";
import { toast } from "@/foundations/ui/toaster/toaster";
import { readActionError } from "@/lib/read-action-error";
import { formatCurrency } from "@/utils/format";
import { deriveProjectLifecycleStatus, summarizeProjectLifecycle } from "@/utils/calculations";
import { createProject, updateProject, deleteProject } from "@/app/actions/projects";

interface ProjectsClientProps {
  projects: Project[];
}

function getStatusVariant(status: ProjectStatus): "success" | "info" | "warning" | "neutral" {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "IN_PROGRESS":
      return "info";
    case "PAUSED":
      return "warning";
    default:
      return "neutral";
  }
}

function statusClassName(status: ProjectStatus) {
  return status === "READY" ? "bg-accent/10 text-accent ring-accent/20" : undefined;
}

function getLifecycleOptions(project: Project) {
  const lifecycle = summarizeProjectLifecycle(project);
  const options: Array<{ value: string; label: string }> = [
    {
      value: "AUTO",
      label: `Use derived status (${deriveProjectLifecycleStatus("PENDING", project.targetAmount, lifecycle.fundedAmount)})`,
    },
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
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const editingLifecycle = editingProject ? summarizeProjectLifecycle(editingProject) : null;
  const editingLifecycleOptions = editingProject ? getLifecycleOptions(editingProject) : [];
  const defaultLifecycleOption =
    editingProject && (editingProject.status === "PAUSED" || editingProject.status === "COMPLETED")
      ? editingProject.status
      : "AUTO";

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const error = readActionError(await createProject(formData));
      if (error) {
        toast({ title: error, variant: "negative" });
        return;
      }
      setShowCreate(false);
    });
  }

  function handleUpdate(formData: FormData) {
    if (!editingProject) return;
    startTransition(async () => {
      const error = readActionError(await updateProject(editingProject.id, formData));
      if (error) {
        toast({ title: error, variant: "negative" });
        return;
      }
      setEditingProject(null);
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const project = pendingDelete;
    startTransition(async () => {
      const error = readActionError(await deleteProject(project.id));
      if (error) {
        toast({ title: error, variant: "negative" });
        return;
      }
      setPendingDelete(null);
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Projects</h2>
          <p className="mt-1 text-sm text-foreground-secondary">Track your financial goals</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <PlusIcon className="size-4" />
          New project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-border bg-background px-4 py-16 text-center">
          <h3 className="text-lg font-semibold">No projects yet</h3>
          <p className="mb-6 mt-1 text-sm text-foreground-secondary">
            Set up financial goals and track your progress.
          </p>
          <Button onClick={() => setShowCreate(true)}>Create your first project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {projects.map((project) => {
            const lifecycle = summarizeProjectLifecycle(project);
            return (
              <article key={project.id} className="rounded-xl border border-border bg-background p-4 shadow-xs">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold">{project.title}</h3>
                    {project.notes ? (
                      <p className="mt-0.5 text-xs text-foreground-secondary">{project.notes}</p>
                    ) : null}
                  </div>
                  <Badge
                    size="sm"
                    variant={getStatusVariant(lifecycle.effectiveStatus)}
                    className={statusClassName(lifecycle.effectiveStatus)}
                  >
                    {lifecycle.effectiveStatus}
                  </Badge>
                </div>
                <div className="mb-3">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-foreground-secondary">Funding progress</span>
                    <span className="font-semibold tabular-nums">{lifecycle.progressPercentage}%</span>
                  </div>
                  <Progress value={lifecycle.progressPercentage} />
                </div>
                <dl className="mb-3 grid grid-cols-1 gap-2 text-sm min-[420px]:grid-cols-3">
                  <div className="rounded-lg bg-background-secondary p-2">
                    <dt className="text-xs text-foreground-secondary">Funded</dt>
                    <dd className="font-semibold tabular-nums">{formatCurrency(lifecycle.fundedAmount)}</dd>
                  </div>
                  <div className="rounded-lg bg-background-secondary p-2">
                    <dt className="text-xs text-foreground-secondary">Target</dt>
                    <dd className="font-semibold tabular-nums">{formatCurrency(project.targetAmount)}</dd>
                  </div>
                  <div className="rounded-lg bg-background-secondary p-2">
                    <dt className="text-xs text-foreground-secondary">Left</dt>
                    <dd className={`font-semibold tabular-nums ${lifecycle.remainingAmount > 0 ? "text-warning" : "text-success"}`}>
                      {formatCurrency(lifecycle.remainingAmount)}
                    </dd>
                  </div>
                </dl>
                <p className="mb-3 text-xs text-foreground-secondary">
                  Lifecycle follows active project-linked funding unless the project is paused or completed.
                </p>
                {project.legacySavedAmount > 0 ? (
                  <p className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                    Historical carryover {formatCurrency(project.legacySavedAmount)} is reference only and is not active funding.
                  </p>
                ) : null}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingProject(project)} className="flex-1">
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setPendingDelete(project)}>
                    Delete
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <Dialog.Content>
          <Dialog.Title>New project</Dialog.Title>
          <Dialog.Description>Projects start pending and move as linked savings are added.</Dialog.Description>
          <form action={handleCreate} className="space-y-4">
            <Field>
              <Field.Label>Project title</Field.Label>
              <Field.Control>
                <Input name="title" placeholder="Emergency fund" required />
              </Field.Control>
            </Field>
            <Field>
              <Field.Label>Target amount</Field.Label>
              <Field.Control>
                <Input name="targetAmount" type="number" inputMode="decimal" min="0.01" step="0.01" required />
              </Field.Control>
            </Field>
            <Field>
              <Field.Label>Notes</Field.Label>
              <Field.Control>
                <Textarea name="notes" rows={2} placeholder="Optional notes" />
              </Field.Control>
            </Field>
            <Dialog.Actions>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isPending}>
                Create project
              </Button>
            </Dialog.Actions>
          </form>
        </Dialog.Content>
      </Dialog>

      <Dialog open={Boolean(editingProject)} onOpenChange={(open) => !open && setEditingProject(null)}>
        <Dialog.Content>
          <Dialog.Title>Edit project</Dialog.Title>
          {editingProject && editingLifecycle ? (
            <form action={handleUpdate} className="space-y-4">
              <Field>
                <Field.Label>Project title</Field.Label>
                <Field.Control>
                  <Input name="title" defaultValue={editingProject.title} required />
                </Field.Control>
              </Field>
              <Field>
                <Field.Label>Target amount</Field.Label>
                <Field.Control>
                  <Input
                    name="targetAmount"
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    defaultValue={String(editingProject.targetAmount)}
                    required
                  />
                </Field.Control>
              </Field>
              <Field>
                <Field.Label>Lifecycle state</Field.Label>
                <Field.Control>
                  <Select name="status" defaultValue={defaultLifecycleOption}>
                    {editingLifecycleOptions.map((statusOption) => (
                      <option key={statusOption.value} value={statusOption.value}>
                        {statusOption.label}
                      </option>
                    ))}
                  </Select>
                </Field.Control>
                <Field.Description>
                  Current lifecycle: {editingLifecycle.effectiveStatus}. Completed is available once funding reaches the target.
                </Field.Description>
              </Field>
              {editingProject.legacySavedAmount > 0 ? (
                <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                  Historical carryover {formatCurrency(editingProject.legacySavedAmount)} stays read-only and is not active funding.
                </p>
              ) : null}
              <Field>
                <Field.Label>Notes</Field.Label>
                <Field.Control>
                  <Textarea name="notes" rows={2} defaultValue={editingProject.notes ?? ""} />
                </Field.Control>
              </Field>
              <Dialog.Actions>
                <Button type="button" variant="outline" onClick={() => setEditingProject(null)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isPending}>
                  Save changes
                </Button>
              </Dialog.Actions>
            </form>
          ) : null}
        </Dialog.Content>
      </Dialog>

      <Dialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <Dialog.Content>
          <Dialog.Title>Delete project</Dialog.Title>
          <Dialog.Description>
            Delete {pendingDelete?.title ?? "this project"}? Linked savings must be removed first.
          </Dialog.Description>
          <Dialog.Actions>
            <Button type="button" variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" isLoading={isPending} onClick={confirmDelete}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
