// Datos iniciales importados desde Notion. Se cargan una vez desde /admin/importar.
// El usuario los pule después en cada sección.

export const SEED_CLIENTES: Record<string, unknown>[] = [
  {
    cliente: "Mutual de Gendarmería",
    estado: "Produccion",
    tipo: "Recurrente",
    montoMensual: 50000,
    salud: "Estable",
    notas: "0 trabajo. Ingreso pasivo. Sin módulos nuevos pendientes ni planeados.",
  },
  {
    cliente: "Uesevi",
    estado: "Produccion",
    tipo: "Recurrente",
    montoMensual: 264000,
    salud: "Estable",
    notas: "Poco trabajo: responder dudas. Sin módulos nuevos.",
  },
  {
    cliente: "Heroica",
    estado: "Produccion",
    tipo: "Recurrente",
    montoMensual: 450000,
    salud: "Atencion",
    notas:
      "Sistema grande con dependencia. Módulo 2 (RRHH) en pruebas. Módulos nuevos hablados sin presupuestar. 49% de la recurrencia = riesgo de concentración.",
  },
  {
    cliente: "John - BOT",
    estado: "En desarrollo",
    tipo: "Recurrente",
    montoMensual: 101000,
    salud: "Crecimiento",
    notas: "Bot WhatsApp + IA. 1 número hoy, escala a 4. Base del SaaS para PAS.",
  },
  {
    cliente: "John - Web",
    estado: "Produccion",
    tipo: "Recurrente",
    montoMensual: 59000,
    salud: "Estable",
    notas: "Pocas consultas y arreglos.",
  },
]

export const SEED_PROYECTOS: Record<string, unknown>[] = [
  {
    proyecto: "Heroica - Presupuestar módulos nuevos",
    cliente: "Heroica",
    estado: "Pendiente",
    prioridad: "Alta",
    tipo: "Comercial",
    fechaObjetivo: "2026-06-26",
    notas: "Hablados pero sin presupuestar. Plata en la mesa.",
  },
  {
    proyecto: "Heroica - Módulo RRHH (Módulo 2)",
    cliente: "Heroica",
    estado: "En pruebas",
    prioridad: "Alta",
    tipo: "Desarrollo",
    notas: "Terminado, esperando devolución. Al pasar a prod sube hosting + mantenimiento.",
  },
  {
    proyecto: "John - BOT escala a 4 números",
    cliente: "John - BOT",
    estado: "En curso",
    prioridad: "Alta",
    tipo: "Desarrollo",
    notas: "Presupuesto cerrado. De 1 a 4 números.",
  },
  {
    proyecto: "John - Web mantenimiento",
    cliente: "John - Web",
    estado: "Produccion",
    prioridad: "Baja",
    tipo: "Mantenimiento",
    notas: "Pocas consultas y arreglos.",
  },
  {
    proyecto: "SaaS Bot para PAS - Productización",
    estado: "Pendiente",
    prioridad: "Alta",
    tipo: "Producto",
    notas: "Empaquetar el bot multi-tenant para vender a otros PAS. Motor de recurrencia.",
  },
  {
    proyecto: "Bot para complejos de pádel",
    estado: "Backlog",
    prioridad: "Baja",
    tipo: "Producto",
    notas: "Misma lógica de vertical. Después de validar PAS.",
  },
]

export const SEED_COBROS: Record<string, unknown>[] = [
  { concepto: "Mensual · Mutual de Gendarmería", categoria: "Recurrente mensual", cliente: "Mutual de Gendarmería", monto: 50000, estado: "Pendiente" },
  { concepto: "Mensual · Uesevi", categoria: "Recurrente mensual", cliente: "Uesevi", monto: 264000, estado: "Pendiente" },
  { concepto: "Mensual · Heroica", categoria: "Recurrente mensual", cliente: "Heroica", monto: 450000, estado: "Pendiente" },
  { concepto: "Mensual · John BOT", categoria: "Recurrente mensual", cliente: "John - BOT", monto: 101000, estado: "Pendiente" },
  { concepto: "Mensual · John Web", categoria: "Recurrente mensual", cliente: "John - Web", monto: 59000, estado: "Pendiente" },
]
