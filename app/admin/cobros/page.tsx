"use client";

import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { CrudSection, type ExtraColumn } from "@/components/admin/crud-section";
import { Button } from "@/components/ui/button";
import { COBROS_SCHEMA } from "@/lib/admin/schemas";
import {
  cobroDueDate,
  cobroPaidForMonth,
  cobroPeriodo,
  isInstancia,
  isRecurrente,
  monthKey,
  nextPeriodo,
  periodoDate,
} from "@/lib/admin/cobros";
import { daysUntil } from "@/lib/admin/format";
import { useCollection, type DocRecord } from "@/lib/admin/use-collection";

/**
 * Antes, un recurrente sin `periodo` guardado calculaba su mes pendiente como
 * "el mes real de hoy" (ver cobroPeriodo). Eso hacía que, apenas cambiaba el
 * mes calendario, un cliente que todavía no había pagado (ej. Heroica, Mutual)
 * pasara de "debe junio" a "debe julio" sin que nadie lo cobrara: el pago de
 * junio "desaparecía". Acá fijamos el período pendiente en Firestore la
 * primera vez que falta, para que deje de depender del reloj.
 */
function inferPeriodo(row: DocRecord, allCobros: DocRecord[]): string {
  const paid = allCobros
    .filter(
      (c) => isInstancia(c) && c.cliente === row.cliente && c.periodoPagado,
    )
    .map((c) => String(c.periodoPagado))
    .sort();
  if (paid.length > 0) return nextPeriodo(paid[paid.length - 1]);
  const createdAt = row.createdAt?.toDate?.() as Date | undefined;
  return monthKey(createdAt ?? new Date());
}

const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];
function labelMes(periodo: string): string {
  const [y, m] = periodo.split("-").map(Number);
  return `${MESES[m - 1]} ${y}`;
}
function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Saldados al fondo; el resto, lo que vence más pronto arriba.
function sortCobros(a: DocRecord, b: DocRecord): number {
  const aDone = cobroPaidForMonth(a) ? 1 : 0;
  const bDone = cobroPaidForMonth(b) ? 1 : 0;
  if (aDone !== bDone) return aDone - bDone;
  const da = daysUntil(cobroDueDate(a)) ?? 99999;
  const db = daysUntil(cobroDueDate(b)) ?? 99999;
  return da - db;
}

export default function CobrosPage() {
  const cobros = useCollection("cobros");
  const clientes = useCollection("clientes");

  // Autocorrección: fija el período pendiente de cualquier recurrente que
  // todavía no lo tenga guardado, para que no siga corriendo con la fecha real.
  useEffect(() => {
    if (cobros.loading) return;
    for (const row of cobros.data) {
      if (isRecurrente(row) && !row.periodo) {
        const periodo = inferPeriodo(row, cobros.data);
        cobros.update(row.id, { periodo }).catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cobros.loading]);

  async function cobrarMes(row: DocRecord) {
    const periodo = cobroPeriodo(row);
    const dia = Number(row.diaCobro) || 1;
    try {
      // 1) Registro real del pago de ese mes (asiento histórico).
      await cobros.add({
        concepto: `${String(row.concepto ?? "Cobro")} (${labelMes(periodo)})`,
        categoria: "Recurrente mensual",
        esInstancia: true,
        cliente: row.cliente ?? null,
        monto: row.monto ?? null,
        estado: "Cobrar",
        vencimiento: periodoDate(periodo, dia),
        periodoPagado: periodo,
        fechaCobro: hoyISO(),
        metodo: row.metodo ?? null,
      });
      // 2) La cuenta recurrente avanza al mes siguiente.
      await cobros.update(row.id, { periodo: nextPeriodo(periodo) });
      toast.success(
        `Cobrado ${labelMes(periodo)}. Próximo: ${labelMes(nextPeriodo(periodo))}.`,
      );
      // 3) Aviso de aumento si la revisión del cliente ya venció.
      const cli = clientes.data.find((c) => c.cliente === row.cliente);
      if (cli?.proximaRevision) {
        const d = daysUntil(String(cli.proximaRevision));
        if (d !== null && d <= 0) {
          toast.warning(
            `Revisá el monto de ${String(row.cliente)} por inflación — puede corresponder aumento.`,
          );
        }
      }
    } catch {
      toast.error("No se pudo registrar el cobro");
    }
  }

  const extraColumns = useMemo<ExtraColumn[]>(
    () => [
      {
        key: "esteMes",
        label: "Cobro del mes",
        render: (row: DocRecord) => {
          if (!isRecurrente(row)) {
            return row.esInstancia ? (
              <span className="text-xs text-emerald-400">pago registrado</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            );
          }
          const periodo = cobroPeriodo(row);
          const count = cobros.data.filter(
            (c) => c.esInstancia && c.cliente === row.cliente,
          ).length;
          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => cobrarMes(row)}
              >
                Cobrar {labelMes(periodo)}
              </Button>
              {count > 0 ? (
                <span className="text-xs text-muted-foreground">✓ {count}</span>
              ) : null}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cobros.data, clientes.data],
  );

  return (
    <CrudSection
      schema={COBROS_SCHEMA}
      extraColumns={extraColumns}
      sortRows={sortCobros}
    />
  );
}
