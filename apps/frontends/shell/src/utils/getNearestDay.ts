/**
 * Devuelve la fecha más cercana (hoy o en el futuro) que caiga en el día
 * de la semana indicado por nombre.
 *
 * @param dayName "domingo" | "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado"
 *                (acepta con o sin tilde, mayúsculas/minúsculas)
 * @param fromDate Fecha base desde la que buscar (por defecto: hoy)
 * @param includeToday Si hoy mismo coincide con el día pedido, ¿lo devuelve o busca la próxima semana?
 * @returns Date correspondiente al próximo día solicitado
 */
export function getNearestDateByDay(
  dayName: string,
  fromDate: Date = new Date(),
  includeToday: boolean = true,
): Date {
  const DIAS: Record<string, number> = {
    domingo: 0,
    lunes: 1,
    martes: 2,
    miercoles: 3,
    miércoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
    sábado: 6,
  };

  const normalized = dayName
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita tildes: "miércoles" -> "miercoles"

  const targetDay =
    DIAS[normalized] ?? DIAS[dayName.toLowerCase()];

  if (targetDay === undefined) {
    throw new Error(`Día inválido: "${dayName}"`);
  }

  const result = new Date(fromDate);
  result.setHours(0, 0, 0, 0);

  const currentDay = result.getDay();
  let diff = (targetDay - currentDay + 7) % 7;

  // Si cae hoy y no queremos incluir hoy, saltamos a la próxima semana
  if (diff === 0 && !includeToday) {
    diff = 7;
  }

  result.setDate(result.getDate() + diff);
  return result;
}

/**
 * Igual que getNearestDateByDay pero recibe/devuelve un array de días
 * y regresa la fecha más próxima entre todos ellos.
 * Útil si el usuario puede elegir varios días válidos, ej: ["martes", "jueves"]
 */
export function getNearestDateAmongDays(
  dayNames: string[],
  fromDate: Date = new Date(),
  includeToday: boolean = true,
): Date {
  const dates = dayNames.map((d) =>
    getNearestDateByDay(d, fromDate, includeToday),
  );
  return dates.reduce((closest, current) =>
    current < closest ? current : closest,
  );
}
