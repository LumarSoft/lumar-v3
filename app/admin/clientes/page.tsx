"use client"

import { CrudSection } from "@/components/admin/crud-section"
import { CLIENTES_SCHEMA } from "@/lib/admin/schemas"

export default function ClientesPage() {
  return <CrudSection schema={CLIENTES_SCHEMA} />
}
