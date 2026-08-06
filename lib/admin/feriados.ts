// Feriados nacionales de Argentina y cálculo de días hábiles.
//
// Cubre los feriados de la Ley 27.399: inamovibles, trasladables al tercer
// lunes, y los que dependen de Pascua (Carnaval y Viernes Santo).
//
// NO cubre los "días no laborables con fines turísticos" (los puentes), porque
// el Poder Ejecutivo los fija por decreto cada año y no siguen ninguna regla.
// Si un puente te afecta una emisión, corregí la fecha a mano en el formulario.

function iso(y: number, m: number, d: number): string {
  const f = new Date(y, m - 1, d);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(
    f.getDate(),
  ).padStart(2, "0")}`;
}

/**
 * Domingo de Pascua (algoritmo de Meeus/Jones/Butcher, calendario gregoriano).
 * De acá salen Carnaval y Viernes Santo.
 */
function pascua(anio: number): Date {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(anio, mes - 1, dia);
}

function sumarAFecha(base: Date, dias: number): string {
  const f = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() + dias,
  );
  return iso(f.getFullYear(), f.getMonth() + 1, f.getDate());
}

/** Tercer lunes del mes (Ley 27.399, art. 3). */
function tercerLunes(anio: number, mes: number): string {
  const primero = new Date(anio, mes - 1, 1);
  // 1 = lunes. Cuántos días faltan del día 1 al primer lunes.
  const alPrimerLunes = (8 - primero.getDay()) % 7;
  return iso(anio, mes, 1 + alPrimerLunes + 14);
}

const cache = new Map<number, Set<string>>();

/** Todos los feriados nacionales de un año, como set de "YYYY-MM-DD". */
export function feriadosNacionales(anio: number): Set<string> {
  const guardado = cache.get(anio);
  if (guardado) return guardado;

  const domingoPascua = pascua(anio);

  const dias = [
    // Inamovibles
    iso(anio, 1, 1), // Año Nuevo
    iso(anio, 3, 24), // Día de la Memoria
    iso(anio, 4, 2), // Veteranos y Caídos en Malvinas
    iso(anio, 5, 1), // Día del Trabajador
    iso(anio, 5, 25), // Revolución de Mayo
    iso(anio, 6, 20), // Paso a la Inmortalidad de Belgrano
    iso(anio, 7, 9), // Día de la Independencia
    iso(anio, 12, 8), // Inmaculada Concepción
    iso(anio, 12, 25), // Navidad

    // Trasladables al tercer lunes del mes respectivo
    tercerLunes(anio, 8), // Paso a la Inmortalidad de San Martín (17/8)
    tercerLunes(anio, 10), // Respeto a la Diversidad Cultural (12/10)
    tercerLunes(anio, 11), // Soberanía Nacional (20/11)

    // Móviles, atados a Pascua
    sumarAFecha(domingoPascua, -48), // Carnaval (lunes)
    sumarAFecha(domingoPascua, -47), // Carnaval (martes)
    sumarAFecha(domingoPascua, -2), // Viernes Santo
  ];

  const set = new Set(dias);
  cache.set(anio, set);
  return set;
}

export function esFeriado(fechaIso: string): boolean {
  const anio = Number(fechaIso.slice(0, 4));
  return feriadosNacionales(anio).has(fechaIso);
}

/** Día hábil = lunes a viernes y que no sea feriado nacional. */
export function esDiaHabil(fechaIso: string): boolean {
  const [y, m, d] = fechaIso.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  if (dow === 0 || dow === 6) return false;
  return !esFeriado(fechaIso);
}

/** Avanza hasta el primer día hábil (devuelve la misma fecha si ya lo es). */
export function siguienteDiaHabil(fechaIso: string): string {
  let actual = fechaIso;
  // Tope defensivo: nunca hay más de ~5 días no hábiles seguidos.
  for (let i = 0; i < 15 && !esDiaHabil(actual); i++) {
    const [y, m, d] = actual.split("-").map(Number);
    actual = iso(y, m, d + 1);
  }
  return actual;
}

/** Suma N días hábiles a una fecha (no cuenta el día de partida). */
export function sumarDiasHabiles(fechaIso: string, cantidad: number): string {
  let actual = fechaIso;
  let restantes = cantidad;
  while (restantes > 0) {
    const [y, m, d] = actual.split("-").map(Number);
    actual = iso(y, m, d + 1);
    if (esDiaHabil(actual)) restantes--;
  }
  return actual;
}
