import { redirect } from "next/navigation";

// La sección Futuros fue removida.
export default function FuturosRedirect() {
  redirect("/admin");
}
