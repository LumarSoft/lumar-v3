"use client"

import { CrudSection } from "@/components/admin/crud-section"
import { COBROS_SCHEMA } from "@/lib/admin/schemas"

export default function CobrosPage() {
  return <CrudSection schema={COBROS_SCHEMA} />
}
