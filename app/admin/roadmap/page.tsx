import { redirect } from "next/navigation";

// La sección Roadmap y objetivos fue removida.
export default function RoadmapRedirect() {
  redirect("/admin");
}
