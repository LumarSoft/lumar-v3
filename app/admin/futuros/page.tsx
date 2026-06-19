"use client"

import { CrudSection } from "@/components/admin/crud-section"
import { FUTUROS_SCHEMA } from "@/lib/admin/schemas"

export default function FuturosPage() {
  return <CrudSection schema={FUTUROS_SCHEMA} />
}
