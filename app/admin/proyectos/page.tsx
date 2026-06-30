import { redirect } from "next/navigation";

// Proyectos se unificó con Clientes (cada cliente es un proyecto).
export default function ProyectosRedirect() {
  redirect("/admin/clientes");
}
