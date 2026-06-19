"use client"

import { CrudSection } from "@/components/admin/crud-section"
import { VENCIMIENTOS_SCHEMA } from "@/lib/admin/schemas"

export default function VencimientosPage() {
  return <CrudSection schema={VENCIMIENTOS_SCHEMA} />
}
