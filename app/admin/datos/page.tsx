"use client"

import { CrudSection } from "@/components/admin/crud-section"
import { DATOS_SCHEMA } from "@/lib/admin/schemas"
import { ShieldAlert } from "lucide-react"

export default function DatosPage() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200/90">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          Sección sensible. Estos valores se guardan en Firestore y solo los ven los mails del
          allowlist. No la compartas fuera del equipo y revisá que las reglas de seguridad estén
          deployadas.
        </p>
      </div>
      <CrudSection schema={DATOS_SCHEMA} />
    </div>
  )
}
