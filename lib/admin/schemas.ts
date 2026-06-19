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
  dynamicSource?: "proyectos"
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

const ESTADO_PROYECTO: SelectOption[] = [
  { value: "Backlog", color: "gray" },
  { value: "Pendiente", color: "orange" },
  { value: "En curso", color: "blue" },
  { value: "En pruebas", color: "purple" },
  { value: "Produccion", color: "green" },
  { value: "Frenado", color: "red" },
]

const PRIORIDAD: SelectOption[] = [
  { value: "Alta", color: "red" },
  { value: "Media", color: "yellow" },
  { value: "Baja", color: "gray" },
]

const IMPACTO_ESFUERZO: SelectOption[] = [
  { value: "Alto", color: "green" },
  { value: "Medio", color: "yellow" },
  { value: "Bajo", color: "gray" },
]

export const CLIENTES_SCHEMA: SectionSchema = {
  collection: "clientes",
  title: "Clientes",
  description: "Cartera activa, montos recurrentes y salud de cada cuenta.",
  itemNoun: "cliente",
  titleKey: "cliente",
  fields: [
    { key: "cliente", label: "Cliente", type: "text", required: true },
    {
      key: "estado",
      label: "Estado",
      type: "select",
      options: [
        { value: "Produccion", color: "green" },
        { value: "En desarrollo", color: "blue" },
        { value: "Pausado", color: "gray" },
      ],
    },
    {
      key: "tipo",
      label: "Tipo",
      type: "select",
      options: [
        { value: "Recurrente", color: "blue" },
        { value: "Puntual", color: "gray" },
      ],
    },
    { key: "montoMensual", label: "Monto mensual", type: "currency" },
    { key: "diaCobro", label: "Día de cobro", type: "number" },
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

export const PROYECTOS_SCHEMA: SectionSchema = {
  collection: "proyectos",
  title: "Proyectos",
  description: "Frentes de desarrollo, producto y comercial en curso.",
  itemNoun: "proyecto",
  titleKey: "proyecto",
  fields: [
    { key: "proyecto", label: "Proyecto", type: "text", required: true },
    { key: "cliente", label: "Cliente", type: "text" },
    { key: "estado", label: "Estado", type: "select", options: ESTADO_PROYECTO },
    { key: "prioridad", label: "Prioridad", type: "select", options: PRIORIDAD },
    { key: "dueno", label: "Dueño", type: "text" },
    { key: "fechaObjetivo", label: "Fecha objetivo", type: "date" },
    {
      key: "tipo",
      label: "Tipo",
      type: "select",
      options: [
        { value: "Comercial", color: "pink" },
        { value: "Desarrollo", color: "blue" },
        { value: "Mantenimiento", color: "gray" },
        { value: "Producto", color: "purple" },
      ],
    },
    { key: "notas", label: "Notas", type: "textarea", inTable: false },
  ],
}

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
    { key: "cliente", label: "Cliente", type: "text" },
    { key: "monto", label: "Monto", type: "currency" },
    {
      key: "estado",
      label: "Estado",
      type: "select",
      options: [
        { value: "Pendiente", color: "yellow" },
        { value: "Cobrado", color: "green" },
        { value: "Vencido", color: "red" },
      ],
    },
    { key: "vencimiento", label: "Vencimiento", type: "date", showDaysLeft: true },
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

export const FUTUROS_SCHEMA: SectionSchema = {
  collection: "futuros",
  title: "Futuros",
  description: "Ideas y oportunidades a futuro: productos propios, nuevas verticales.",
  itemNoun: "idea",
  titleKey: "idea",
  fields: [
    { key: "idea", label: "Idea / oportunidad", type: "text", required: true },
    { key: "descripcion", label: "Descripción", type: "textarea", inTable: false },
    { key: "impacto", label: "Impacto", type: "select", options: IMPACTO_ESFUERZO },
    { key: "esfuerzo", label: "Esfuerzo", type: "select", options: IMPACTO_ESFUERZO },
    {
      key: "estado",
      label: "Estado",
      type: "select",
      options: [
        { value: "Idea", color: "gray" },
        { value: "En evaluacion", color: "blue" },
        { value: "Aprobado", color: "green" },
        { value: "Descartado", color: "red" },
      ],
    },
    { key: "notas", label: "Notas", type: "textarea", inTable: false },
  ],
}

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
    { key: "proyecto", label: "Proyecto / cliente", type: "text" },
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

const MIEMBRO_OPTIONS: SelectOption[] = [
  { value: "Lucas", color: "blue" },
  { value: "Marcelo", color: "green" },
  { value: "Mateo", color: "purple" },
  { value: "Sin asignar", color: "gray" },
]

export const TAREAS_SCHEMA: SectionSchema = {
  collection: "tareas",
  title: "Tareas",
  description: "Tablero + backlog. Cada tarea pertenece a un proyecto y tiene un tipo.",
  itemNoun: "tarea",
  titleKey: "tarea",
  fields: [
    { key: "tarea", label: "Tarea", type: "text", required: true },
    { key: "proyecto", label: "Proyecto", type: "select", dynamicSource: "proyectos" },
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
    { key: "asignado", label: "Asignado a", type: "select", options: MIEMBRO_OPTIONS },
    {
      key: "estado",
      label: "Estado",
      type: "select",
      options: [
        { value: "To do", color: "gray" },
        { value: "En curso", color: "blue" },
        { value: "Bloqueado", color: "red" },
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

export const VENCIMIENTOS_SCHEMA: SectionSchema = {
  collection: "vencimientos",
  title: "Vencimientos",
  description:
    "Servidores y servicios internos, gastos de la empresa, y lo que deben pagar los clientes.",
  itemNoun: "vencimiento",
  titleKey: "concepto",
  filterKey: "tipo",
  fields: [
    { key: "concepto", label: "Concepto", type: "text", required: true, placeholder: "Ej: Hosting VPS, dominio, Adobe, cuota cliente X" },
    {
      key: "tipo",
      label: "Tipo",
      type: "select",
      options: [
        { value: "Servidor interno", color: "blue" },
        { value: "Gasto interno", color: "orange" },
        { value: "Cobro cliente", color: "green" },
      ],
    },
    { key: "referencia", label: "Proveedor / Cliente", type: "text" },
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
    {
      key: "estado",
      label: "Estado",
      type: "select",
      options: [
        { value: "Pendiente", color: "yellow" },
        { value: "Pagado", color: "green" },
        { value: "Vencido", color: "red" },
      ],
    },
    { key: "notas", label: "Notas", type: "textarea", inTable: false },
  ],
}
