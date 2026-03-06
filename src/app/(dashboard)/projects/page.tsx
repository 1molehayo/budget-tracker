import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const projects = await prisma.project.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
  });

  return <ProjectsClient projects={projects} />;
}
