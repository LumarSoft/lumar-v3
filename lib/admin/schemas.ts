// Schema definitions that drive the generic CRUD sections.
// Plain data only (no JSX) so it can be imported anywhere.

export type FieldType = "text" | "textarea" | "number" | "currency" | "date" | "select" | "secret"

export type OptionColor =
  | "gray"
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "red"
  | "purple"
  | "pink"

export interface SelectOption {
  value: string
  color?: OptionColor
}

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  options?: SelectOption[]
  placeholder?: string
  required?: boolean
  /** Show as a column in the table. Defaults to true. */
  inTable?: boolean
  helpText?: string
  /** For date fields: show a "vence en X días" badge next to the date. */
  showDaysLeft?: boolean
  /** For select fields: resolve options at runtime from another collection. */
  dynamicSource?: "clientes"
  /** For date fields: show a quick "+N meses" button (e.g. revisión cada 3 meses). */
  reviewCycle?: number
  /** For the form: only show this field when another field equals a value. */
  showWhen?: { field: string; equals: string }
}

export interface SectionSchema {
  /** Firestore collection name. */
  collection: string
  title: string
  description?: string
  /** Singular noun for buttons, e.g. "cliente". */
  itemNoun: string
  /** The field used as the row title (first column, required). */
  titleKey: string
  fields: FieldDef[]
  /** If set, the section shows filter tabs by this select field's options. */
  filterKey?: string
}

export const MIEMBRO_OPTIONS: SelectOption[] = [
  { value: "Lucas", color: "blue" },
  { value: "Marcelo", color: "green" },
  { value: "Mateo", color: "purple" },
]

const MIEMBRO_OPTIONS_OPCIONAL: SelectOption[] = [...MIEMBRO_OPTIONS, { value: "Sin asignar", color: "gray" }]

// ── Clientes (cada cliente ES el proyecto) ───────────────────────────────
export const CLIENTES_SCHEMA: SectionSchema = {
  collection: "clientes",
  title: "Clientes",
  description: "Perfil de cada cliente. Las cobranzas (recurrente + puntuales) se gestionan en Cobros.",
  itemNoun: "cliente",
  titleKey: "cliente",
  filterKey: "tipo",
  fields: [
    { key: "cliente", label: "Cliente", type: "text", required: true },
    {
      key: "tipo",
      label: "Tipo",
      type: "select",
      options: [
        { value: "Cliente", color: "blue" },
        { value: "Producto propio", color: "purple" },
      ],
    },
    {
      key: "estado",
      label: "Estado",
      type: "select",
      options: [
        { value: "Produccion", color: "green" },
        { value: "En desarrollo", color: "blue" },
        { value: "Pausado", color: "gray" },
        { value: "Cerrado", color: "red" },
      ],
    },
    {
      key: "proximaRevision",
      label: "Próx. revisión monto",
      type: "date",
      showDaysLeft: true,
      reviewCycle: 3,
      helpText: "Revisión del monto por inflación. El botón +3 meses agenda la siguiente.",
    },
    {
      key: "salud",
      label: "Salud",
      type: "select",
      options: [
        { value: "Estable", color: "green" },
        { value: "Crecimiento", color: "blue" },
        { value: "Atencion", color: "yellow" },
        { value: "Riesgo", color: "red" },
      ],
    },
    { key: "notas", label: "Notas", type: "textarea", inTable: false },
  ],
}

// ── Cobros (manuales, cliente como select relacional) ────────────────────
export const COBROS_SCHEMA: SectionSchema = {
  collection: "cobros",
  title: "Cobros",
  description: "Qué hay que cobrar, a quién, cuándo y en qué estado.",
  itemNoun: "cobro",
  titleKey: "concepto",
  filterKey: "categoria",
  fields: [
    { key: "concepto", label: "Concepto", type: "text", required: true },
    {
      key: "categoria",
      label: "Categoría",
      type: "select",
      options: [
        { value: "Recurrente mensual", color: "green" },
        { value: "Fijo desarrollo", color: "blue" },
      ],
    },
    { key: "cliente", label: "Cliente", type: "select", dynamicSource: "clientes" },
    { key: "monto", label: "Monto", type: "currency" },
    {
      key: "estado",
      label: "Estado",
      type: "select",
      showWhen: { field: "categoria", equals: "Fijo desarrollo" },
      options: [
        { value: "Pendiente", color: "yellow" },
        { value: "Cobrar", color: "green" },
        { value: "Vencido", color: "red" },
      ],
    },
    {
      key: "diaCobro",
      label: "Día de cobro",
      type: "number",
      placeholder: "1-31",
      showWhen: { field: "categoria", equals: "Recurrente mensual" },
      helpText: "Día del mes en que se cobra (para recurrentes).",
    },
    {
      key: "vencimiento",
      label: "Vencimiento",
      type: "date",
      showDaysLeft: true,
      showWhen: { field: "categoria", equals: "Fijo desarrollo" },
    },
    {
      key: "metodo",
      label: "Método",
      type: "select",
      options: [
        { value: "Transferencia", color: "blue" },
        { value: "Efectivo", color: "green" },
        { value: "MercadoPago", color: "purple" },
        { value: "USD/Cripto", color: "orange" },
        { value: "Otro", color: "gray" },
      ],
    },
    { key: "notas", label: "Notas", type: "textarea", inTable: false },
  ],
}

// ── Datos relevantes (secretos) ──────────────────────────────────────────
export const DATOS_SCHEMA: SectionSchema = {
  collection: "datos_relevantes",
  title: "Datos relevantes",
  description:
    "Variables, .env y credenciales que hoy andan sueltas. Sensible: solo el equipo lo ve, y queda registrado en la base.",
  itemNoun: "dato",
  titleKey: "nombre",
  fields: [
    { key: "nombre", label: "Nombre", type: "text", required: true, placeholder: "Ej: API Key Triunfo" },
    {
      key: "categoria",
      label: "Categoría",
      type: "select",
      options: [
        { value: "ENV", color: "blue" },
        { value: "Credencial", color: "orange" },
        { value: "API Key", color: "purple" },
        { value: "URL", color: "green" },
        { value: "Otro", color: "gray" },
      ],
    },
    { key: "cliente", label: "Cliente", type: "select", dynamicSource: "clientes" },
    {
      key: "valor",
      label: "Valor",
      type: "secret",
      placeholder: "Pegá acá el valor (clave, token, .env, etc.)",
      helpText: "Se guarda en Firestore. Solo los mails del allowlist pueden leerlo.",
    },
    { key: "notas", label: "Notas", type: "textarea", inTable: false },
  ],
}

// ── Tareas (Kanban + backlog) ────────────────────────────────────────────
export const TAREAS_SCHEMA: SectionSchema = {
  collection: "tareas",
  title: "Tareas",
  description: "Tablero + backlog. Cada tarea pertenece a un cliente y tiene un tipo.",
  itemNoun: "tarea",
  titleKey: "tarea",
  fields: [
    { key: "tarea", label: "Tarea", type: "text", required: true },
    { key: "cliente", label: "Cliente", type: "select", dynamicSource: "clientes" },
    {
      key: "tipo",
      label: "Tipo",
      type: "select",
      options: [
        { value: "Bug", color: "red" },
        { value: "Mejora", color: "blue" },
        { value: "Implementación", color: "purple" },
      ],
    },
    { key: "asignado", label: "Asignado a", type: "select", options: MIEMBRO_OPTIONS_OPCIONAL },
    {
      key: "estado",
      label: "Estado",
      type: "select",
      options: [
        { value: "To do", color: "gray" },
        { value: "En curso", color: "blue" },
        { value: "Probando", color: "yellow" },
        { value: "Hecho", color: "green" },
      ],
    },
    {
      key: "prioridad",
      label: "Prioridad",
      type: "select",
      options: [
        { value: "Alta", color: "red" },
        { value: "Media", color: "yellow" },
        { value: "Baja", color: "gray" },
      ],
    },
    { key: "vence", label: "Vence", type: "date", showDaysLeft: true },
    { key: "notas", label: "Notas", type: "textarea", inTable: false },
  ],
}

/** Estados del tablero Kanban, en orden de columnas. */
export const TAREAS_ESTADOS: SelectOption[] = TAREAS_SCHEMA.fields.find(
  (f) => f.key === "estado",
)!.options!

// ── Vencimientos (servicios y gastos NUESTROS, no cobros a clientes) ─────
export const VENCIMIENTOS_SCHEMA: SectionSchema = {
  collection: "vencimientos",
  title: "Vencimientos",
  description: "Servicios y gastos internos que pagamos nosotros (hosting, dominios, herramientas).",
  itemNoun: "vencimiento",
  titleKey: "concepto",
  filterKey: "tipo",
  fields: [
    { key: "concepto", label: "Concepto", type: "text", required: true, placeholder: "Ej: Hosting VPS, dominio, Adobe, Vercel" },
    {
      key: "tipo",
      label: "Tipo",
      type: "select",
      options: [
        { value: "Servidor interno", color: "blue" },
        { value: "Gasto interno", color: "orange" },
      ],
    },
    { key: "proveedor", label: "Proveedor", type: "text" },
    { key: "monto", label: "Monto", type: "currency" },
    { key: "vencimiento", label: "Vence", type: "date", showDaysLeft: true },
    {
      key: "recurrencia",
      label: "Recurrencia",
      type: "select",
      options: [
        { value: "Único", color: "gray" },
        { value: "Mensual", color: "blue" },
        { value: "Anual", color: "purple" },
      ],
    },
    { key: "pagadoPor", label: "Pagado por", type: "select", options: MIEMBRO_OPTIONS_OPCIONAL },
    {
      key: "estado",
      label: "Estado",
      type: "select",
      options: [
        { value: "Pendiente", color: "yellow" },
        { value: "Pagar", color: "green" },
        { value: "Vencido", color: "red" },
      ],
    },
    { key: "notas", label: "Notas", type: "textarea", inTable: false },
  ],
}
