"use client";

import { useMemo } from "react";
import { CrudSection, type ExtraColumn } from "@/components/admin/crud-section";
import { CLIENTES_SCHEMA } from "@/lib/admin/schemas";
import { useCollection, type DocRecord } from "@/lib/admin/use-collection";
import { formatARS } from "@/lib/admin/format";

function toNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function ClientesPage() {
  const cobros = useCollection("cobros");

  const extraColumns = useMemo<ExtraColumn[]>(
    () => [
      {
        key: "recurrente",
        label: "Recurrente",
        render: (row: DocRecord) => {
          const sum = cobros.data
            .filter(
              (c) =>
                c.cliente === row.cliente &&
                c.categoria === "Recurrente mensual",
            )
            .reduce((acc, c) => acc + toNum(c.monto), 0);
          return sum > 0 ? (
            <span className="whitespace-nowrap font-medium">
              {formatARS(sum)}/mes
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        key: "puntuales",
        label: "Total puntuales",
        render: (row: DocRecord) => {
          const list = cobros.data.filter(
            (c) =>
              c.cliente === row.cliente && c.categoria === "Fijo desarrollo",
          );
          const sum = list.reduce((acc, c) => acc + toNum(c.monto), 0);
          return list.length > 0 ? (
            <span className="whitespace-nowrap">
              {formatARS(sum)}{" "}
              <span className="text-xs text-muted-foreground">
                ({list.length})
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
    ],
    [cobros.data],
  );

  return <CrudSection schema={CLIENTES_SCHEMA} extraColumns={extraColumns} />;
}
