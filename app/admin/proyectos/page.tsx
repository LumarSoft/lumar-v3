"use client"

import { CrudSection } from "@/components/admin/crud-section"
import { PROYECTOS_SCHEMA } from "@/lib/admin/schemas"

export default function ProyectosPage() {
  return <CrudSection schema={PROYECTOS_SCHEMA} />
}
