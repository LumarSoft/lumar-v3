import { redirect } from "next/navigation";

// Backlog fue unificado dentro de Tareas.
export default function BacklogRedirect() {
  redirect("/admin/tareas");
}
