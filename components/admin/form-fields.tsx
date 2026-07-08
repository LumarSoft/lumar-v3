"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { addMonths } from "@/lib/admin/format";
import type { FieldDef } from "@/lib/admin/schemas";

export type FormState = Record<string, string | number | undefined>;

/** Estos tipos ocupan todo el ancho; el resto entra en la grilla de 2 columnas. */
function isFullWidth(f: FieldDef): boolean {
  return f.type === "textarea" || f.type === "secret";
}

/**
 * Render de los campos de un formulario a partir del schema de la sección.
 * Único lugar donde se decide cómo se ve cada tipo de campo, así todos los
 * formularios del admin (tablas, tablero, etc.) quedan idénticos.
 */
export function FormFields({
  fields,
  form,
  onChange,
  clientOptions = [],
}: {
  fields: FieldDef[];
  form: FormState;
  onChange: (key: string, value: string | number | undefined) => void;
  clientOptions?: { value: string }[];
}) {
  // Primer campo visible → autofocus al abrir el formulario.
  const firstVisibleKey = fields.find(
    (f) =>
      !f.showWhen ||
      String(form[f.showWhen.field] ?? "") === f.showWhen.equals,
  )?.key;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        if (
          f.showWhen &&
          String(form[f.showWhen.field] ?? "") !== f.showWhen.equals
        ) {
          return null;
        }
        const autoFocus = f.key === firstVisibleKey;
        return (
          <div
            key={f.key}
            className={cn("space-y-1.5", isFullWidth(f) && "sm:col-span-2")}
          >
            <Label htmlFor={f.key}>
              {f.label}
              {f.required ? (
                <span className="ml-0.5 text-destructive">*</span>
              ) : null}
            </Label>

            {f.type === "select" ? (
              <Select
                value={form[f.key] ? String(form[f.key]) : undefined}
                onValueChange={(v) => onChange(f.key, v)}
              >
                <SelectTrigger id={f.key} autoFocus={autoFocus}>
                  <SelectValue
                    placeholder={
                      f.dynamicSource && clientOptions.length === 0
                        ? "Creá un cliente primero"
                        : "Elegí una opción"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(f.dynamicSource ? clientOptions : f.options)?.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : f.type === "textarea" ? (
              <Textarea
                id={f.key}
                value={(form[f.key] as string) ?? ""}
                placeholder={f.placeholder}
                onChange={(e) => onChange(f.key, e.target.value)}
                rows={3}
                autoFocus={autoFocus}
              />
            ) : f.type === "secret" ? (
              <Textarea
                id={f.key}
                value={(form[f.key] as string) ?? ""}
                placeholder={f.placeholder}
                onChange={(e) => onChange(f.key, e.target.value)}
                rows={2}
                className="font-mono text-xs"
                autoFocus={autoFocus}
              />
            ) : f.type === "date" && f.reviewCycle ? (
              <div className="flex gap-2">
                <Input
                  id={f.key}
                  type="date"
                  value={(form[f.key] as string | undefined) ?? ""}
                  onChange={(e) => onChange(f.key, e.target.value)}
                  autoFocus={autoFocus}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0"
                  onClick={() =>
                    onChange(f.key, addMonths(form[f.key] as string, f.reviewCycle!))
                  }
                >
                  +{f.reviewCycle} meses
                </Button>
              </div>
            ) : (
              <Input
                id={f.key}
                type={
                  f.type === "currency" || f.type === "number"
                    ? "number"
                    : f.type === "date"
                      ? "date"
                      : "text"
                }
                value={(form[f.key] as string | number | undefined) ?? ""}
                placeholder={f.placeholder}
                onChange={(e) => onChange(f.key, e.target.value)}
                autoFocus={autoFocus}
              />
            )}

            {f.helpText ? (
              <p className="text-xs text-muted-foreground">{f.helpText}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
