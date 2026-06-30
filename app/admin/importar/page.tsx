"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DownloadCloud, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCollection } from "@/lib/admin/use-collection";
import {
  SEED_CLIENTES,
  SEED_PROYECTOS,
  SEED_COBROS,
} from "@/lib/admin/seed-data";

export default function ImportarPage() {
  const clientes = useCollection("clientes");
  const proyectos = useCollection("proyectos");
  const cobros = useCollection("cobros");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  async function importAll() {
    setRunning(true);
    let added = 0;
    let skipped = 0;
    try {
      const seed = async (
        coll: ReturnType<typeof useCollection>,
        rows: Record<string, unknown>[],
        titleKey: string,
      ) => {
        const existing = new Set(
          coll.data.map((d) => String(d[titleKey]).toLowerCase()),
        );
        for (const row of rows) {
          const name = String(row[titleKey]).toLowerCase();
          if (existing.has(name)) {
            skipped++;
            continue;
          }
          await coll.add(row);
          added++;
        }
      };
      await seed(clientes, SEED_CLIENTES, "cliente");
      await seed(proyectos, SEED_PROYECTOS, "proyecto");
      await seed(cobros, SEED_COBROS, "concepto");
      setDone(`${added} cargados, ${skipped} ya existían.`);
      toast.success(`Importación lista: ${added} nuevos, ${skipped} omitidos.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al importar");
    } finally {
      setRunning(false);
    }
  }

  const loading = clientes.loading || proyectos.loading || cobros.loading;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Importar datos iniciales
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Carga los clientes, proyectos y cobros recurrentes que ya teníamos
          relevados. Es seguro correrlo más de una vez: no duplica lo que ya
          existe.
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Qué se va a importar</CardTitle>
          <CardDescription>
            {SEED_CLIENTES.length} clientes · {SEED_PROYECTOS.length} proyectos
            · {SEED_COBROS.length} cobros recurrentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              • Clientes: Mutual, Uesevi, Heroica, John BOT, John Web (montos y
              estado).
            </li>
            <li>
              • Proyectos: los 6 frentes, vinculados por nombre de cliente.
            </li>
            <li>• Cobros: el recurrente mensual de cada cliente.</li>
          </ul>
          <Button onClick={importAll} disabled={running || loading} size="lg">
            {done ? (
              <Check className="size-4" />
            ) : (
              <DownloadCloud className="size-4" />
            )}
            {running ? "Importando…" : done ? "Importado" : "Importar todo"}
          </Button>
          {done ? <p className="text-sm text-emerald-400">{done}</p> : null}
          <p className="text-xs text-muted-foreground">
            Después de importar, podés pulir cada registro en su sección y
            borrar este ítem del menú (línea “Importar” en{" "}
            <code>components/admin/nav-items.tsx</code>).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
