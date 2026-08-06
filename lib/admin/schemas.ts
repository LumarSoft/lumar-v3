// Schema definitions that drive the generic CRUD sections.
// Plain data only (no JSX) so it can be imported anywhere.

export type FieldType =
  "text" | "textarea" | "number" | "currency" | "date" | "select" | "secret";

export type OptionColor =
  "gray" | "blue" | "green" | "yellow" | "orange" | "red" | "purple" | "pink";

export interface SelectOption {
  value: string;
  color?: OptionColor;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: SelectOption[];
  placeholder?: string;
  required?: boolean;
  /** Show as a column in the table. Defaults to true. */
  inTable?: boolean;
  helpText?: string;
  /** For date fields: show a "vence en X días" badge next to the date. */
  showDaysLeft?: boolean;
  /** For select fields: resolve options at runtime from another collection. */
  dynamicSource?: "clientes";
  /** For date fields: show a quick "+N meses" button (e.g. revisión cada 3 meses). */
  reviewCycle?: number;
  /** For the form: only show this field when another field equals a value. */
  showWhen?: { field: string; equals: string };
  /**
   * Campo que escribe el sistema, no la persona (ej: CAE devuelto por ARCA).
   * Se muestra en la tabla pero no aparece en el formulario de alta/edición.
   */
  readOnly?: boolean;
}

export interface SectionSchema {
  /** Firestore collection name. */
  collection: string;
  title: string;
  description?: string;
  /** Singular noun for buttons, e.g. "cliente". */
  itemNoun: string;
  /** Género del sustantivo, para concordar el artículo ("Nueva factura"). Default: masculino. */
  itemGender?: "m" | "f";
  /** The field used as the row title (first column, required). */
  titleKey: string;
  fields: FieldDef[];
  /** If set, the section shows filter tabs by this select field's options. */
  filterKey?: string;
}

export const MIEMBRO_OPTIONS: SelectOption[] = [
  { value: "Lucas", color: "blue" },
  { value: "Marcelo", color: "green" },
  { value: "Mateo", color: "purple" },
];

const MIEMBRO_OPTIONS_OPCIONAL: SelectOption[] = [
  ...MIEMBRO_OPTIONS,
  { value: "Sin asignar", color: "gray" },
];

// ── Clientes (cada cliente ES el proyecto) ───────────────────────────────
export const CLIENTES_SCHEMA: SectionSchema = {
  collection: "clientes",
  title: "Clientes",
  description:
    "Perfil de cada cliente. Las cobranzas (recurrente + puntuales) se gestionan en Cobros.",
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
      helpText:
        "Revisión del monto por inflación. El botón +3 meses agenda la siguiente.",
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
    // ── Datos fiscales (los usa Facturas para emitir en ARCA) ─────────────
    {
      key: "razonSocial",
      label: "Razón social",
      type: "text",
      inTable: false,
      placeholder: "Como figura en ARCA",
      helpText:
        "Nombre legal para el PDF. Si está vacío se usa el nombre del cliente.",
    },
    {
      key: "docTipo",
      label: "Tipo de documento",
      type: "select",
      inTable: false,
      options: [
        { value: "CUIT", color: "blue" },
        { value: "DNI", color: "gray" },
        { value: "Consumidor final", color: "gray" },
      ],
      helpText:
        "Con qué documento se identifica al receptor en el comprobante.",
    },
    {
      key: "docNro",
      label: "CUIT / DNI",
      type: "text",
      placeholder: "20123456789 (sin guiones)",
      helpText: "Solo números, sin guiones ni puntos.",
    },
    {
      key: "domicilio",
      label: "Domicilio",
      type: "text",
      inTable: false,
      placeholder: "Moreno 58 - Rosario Norte, Santa Fe",
      helpText: "Como figura en ARCA. Va en el comprobante.",
    },
    {
      key: "email",
      label: "Email de facturación",
      type: "text",
      inTable: false,
      placeholder: "administracion@cliente.com",
      helpText:
        "A dónde se manda la factura al emitirla. Si está vacío, no se envía mail.",
    },
    {
      key: "condicionIva",
      label: "Condición IVA",
      type: "select",
      inTable: false,
      options: [
        { value: "Responsable Inscripto", color: "blue" },
        { value: "Monotributista", color: "green" },
        { value: "Exento", color: "purple" },
        { value: "Consumidor Final", color: "gray" },
      ],
      helpText:
        "Obligatorio en el comprobante desde la RG 5616. Sin esto ARCA rechaza la emisión.",
    },
    { key: "notas", label: "Notas", type: "textarea", inTable: false },
  ],
};

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
    {
      key: "cliente",
      label: "Cliente",
      type: "select",
      dynamicSource: "clientes",
    },
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
      key: "periodo",
      label: "Período pendiente",
      type: "text",
      placeholder: "2026-06",
      showWhen: { field: "categoria", equals: "Recurrente mensual" },
      helpText:
        'Mes (AAAA-MM) que todavía se está cobrando. Avanza solo al tocar "Cobrar" — tocalo a mano solo para corregir un error.',
      inTable: false,
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
};

// ── Facturas (emisión electrónica en ARCA) ───────────────────────────────
// Una fila "Fija" se emite una sola vez. Una "Recurrente mensual" es una
// plantilla que se emite mes a mes: al emitir, se guarda la instancia
// histórica y la plantilla avanza al período siguiente (mismo patrón que Cobros).
export const FACTURAS_SCHEMA: SectionSchema = {
  collection: "facturas",
  title: "Facturas",
  description:
    "Emisión electrónica contra ARCA. Cargá el borrador, revisalo y tocá EMITIR: se pide el CAE y se descarga el PDF.",
  itemNoun: "factura",
  itemGender: "f",
  titleKey: "concepto",
  filterKey: "tipo",
  fields: [
    {
      key: "concepto",
      label: "Concepto",
      type: "text",
      required: true,
      placeholder: "Ej: Desarrollo y mantenimiento web",
      helpText:
        "Descripción del servicio. Va en el PDF y en el nombre del archivo.",
    },
    {
      key: "tipo",
      label: "Tipo",
      type: "select",
      options: [
        { value: "Recurrente mensual", color: "green" },
        { value: "Fija", color: "blue" },
      ],
      helpText:
        "Recurrente: se emite todos los meses y avanza sola. Fija: se emite una única vez.",
    },
    {
      key: "cliente",
      label: "Cliente",
      type: "select",
      dynamicSource: "clientes",
      required: true,
      helpText:
        "Los datos fiscales (CUIT, condición IVA) se toman de la ficha del cliente.",
    },
    { key: "importe", label: "Importe", type: "currency", required: true },
    {
      key: "codigo",
      label: "Código",
      type: "text",
      inTable: false,
      placeholder: "SIST",
      helpText:
        "Código interno del servicio. Va en la primera columna del PDF.",
    },
    {
      key: "condicionVenta",
      label: "Condición de venta",
      type: "select",
      inTable: false,
      options: [
        { value: "Transferencia Bancaria", color: "blue" },
        { value: "Contado", color: "green" },
        { value: "Cuenta Corriente", color: "purple" },
        { value: "Otra", color: "gray" },
      ],
      helpText: "Vacío = Transferencia Bancaria.",
    },
    {
      key: "fechaEmision",
      label: "Fecha emisión",
      type: "date",
      helpText:
        "Vacío: las recurrentes toman el primer día hábil del mes del período (saltea fines de semana y feriados); las fijas, hoy. ARCA acepta ±10 días respecto de hoy.",
    },
    {
      key: "servicioDesde",
      label: "Servicio desde",
      type: "date",
      helpText: "Vacío = primer día del período.",
    },
    {
      key: "servicioHasta",
      label: "Servicio hasta",
      type: "date",
      helpText: "Vacío = último día del período.",
    },
    {
      key: "vtoPago",
      label: "Vto. de pago",
      type: "date",
      inTable: false,
      helpText:
        "Obligatorio para servicios. Vacío = 5 días hábiles después de la emisión.",
    },
    {
      key: "periodo",
      label: "Período a emitir",
      type: "text",
      placeholder: "2026-08",
      inTable: false,
      showWhen: { field: "tipo", equals: "Recurrente mensual" },
      helpText:
        "Mes (AAAA-MM) todavía sin emitir. Avanza solo al tocar EMITIR — editalo a mano solo para corregir.",
    },
    {
      key: "estado",
      label: "Estado",
      type: "select",
      readOnly: true,
      options: [
        { value: "Borrador", color: "gray" },
        { value: "Emitida", color: "green" },
        { value: "Error", color: "red" },
      ],
    },
    // ── Devueltos por ARCA. Los escribe el sistema, no se editan a mano ──
    { key: "cae", label: "CAE", type: "text", readOnly: true, inTable: false },
    {
      key: "caeVto",
      label: "Vto. CAE",
      type: "date",
      readOnly: true,
      inTable: false,
    },
    {
      key: "ptoVta",
      label: "Pto. venta",
      type: "number",
      readOnly: true,
      inTable: false,
    },
    {
      key: "cbteNro",
      label: "Nro. comprobante",
      type: "number",
      readOnly: true,
      inTable: false,
    },
    {
      key: "cbteTipo",
      label: "Tipo comprobante",
      type: "number",
      readOnly: true,
      inTable: false,
    },
    {
      key: "ambiente",
      label: "Ambiente",
      type: "text",
      readOnly: true,
      inTable: false,
    },
    { key: "notas", label: "Notas", type: "textarea", inTable: false },
  ],
};

// ── Datos relevantes (secretos) ──────────────────────────────────────────
export const DATOS_SCHEMA: SectionSchema = {
  collection: "datos_relevantes",
  title: "Datos relevantes",
  description:
    "Variables, .env y credenciales que hoy andan sueltas. Sensible: solo el equipo lo ve, y queda registrado en la base.",
  itemNoun: "dato",
  titleKey: "nombre",
  fields: [
    {
      key: "nombre",
      label: "Nombre",
      type: "text",
      required: true,
      placeholder: "Ej: API Key Triunfo",
    },
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
    {
      key: "cliente",
      label: "Cliente",
      type: "select",
      dynamicSource: "clientes",
    },
    {
      key: "valor",
      label: "Valor",
      type: "secret",
      placeholder: "Pegá acá el valor (clave, token, .env, etc.)",
      helpText:
        "Se guarda en Firestore. Solo los mails del allowlist pueden leerlo.",
    },
    { key: "notas", label: "Notas", type: "textarea", inTable: false },
  ],
};

// ── Tareas (Kanban + backlog) ────────────────────────────────────────────
export const TAREAS_SCHEMA: SectionSchema = {
  collection: "tareas",
  title: "Tareas",
  description:
    "Tablero + backlog. Cada tarea pertenece a un cliente y tiene un tipo.",
  itemNoun: "tarea",
  titleKey: "tarea",
  fields: [
    { key: "tarea", label: "Tarea", type: "text", required: true },
    {
      key: "cliente",
      label: "Cliente",
      type: "select",
      dynamicSource: "clientes",
    },
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
    {
      key: "asignado",
      label: "Asignado a",
      type: "select",
      options: MIEMBRO_OPTIONS_OPCIONAL,
    },
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
};

/** Estados del tablero Kanban, en orden de columnas. */
export const TAREAS_ESTADOS: SelectOption[] = TAREAS_SCHEMA.fields.find(
  (f) => f.key === "estado",
)!.options!;

// ── Vencimientos (servicios y gastos NUESTROS, no cobros a clientes) ─────
export const VENCIMIENTOS_SCHEMA: SectionSchema = {
  collection: "vencimientos",
  title: "Vencimientos",
  description:
    "Servicios y gastos internos que pagamos nosotros (hosting, dominios, herramientas).",
  itemNoun: "vencimiento",
  titleKey: "concepto",
  filterKey: "tipo",
  fields: [
    {
      key: "concepto",
      label: "Concepto",
      type: "text",
      required: true,
      placeholder: "Ej: Hosting VPS, dominio, Adobe, Vercel",
    },
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
    {
      key: "pagadoPor",
      label: "Pagado por",
      type: "select",
      options: MIEMBRO_OPTIONS_OPCIONAL,
    },
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
};
