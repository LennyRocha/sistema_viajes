import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { EstadoSalida } from '../salidas/types/estado-salida';
import { TipoSalida } from '../salidas/types/tipo-salida';
import { buildCalendarioMes } from './calendario-viajes.utils';
import { CalendarioSalidaSource } from './types/calendario-viajes.types';

const baseSalida = {
  id: 1,
  autobusId: 10,
  conductorId: 20,
  viajeBaseId: 30,
  tipoSalida: TipoSalida.UNICA,
  estadoSalida: EstadoSalida.PROGRAMADO,
  capacidadTotal: 40,
  viaje: {
    nombre: 'Campus Norte',
    rutas: [
      {
        orden: 1,
        ruta: {
          origen: { nombre: 'Terminal Norte' },
          destino: { nombre: 'Centro' },
        },
      },
    ],
  },
} satisfies Omit<CalendarioSalidaSource, 'horario_configuracion'>;

describe('buildCalendarioMes', () => {
  it('builds a complete monthly grid and groups salida occurrences by date', () => {
    const result = buildCalendarioMes(
      2026,
      8,
      [
        {
          ...baseSalida,
          id: 1,
          capacidadTotal: 4,
          boletos: [
            {
              estado: 'CONFIRMADA',
              asientos: ['A1'],
            },
            {
              estado: 'PENDIENTE',
              expiraEn: new Date(2026, 7, 15, 12),
              asientos: ['A2'],
            },
          ],
          horario_configuracion: {
            inicio: { fecha: '2026-08-03', hora: '08:00' },
            finCalculado: { fecha: '2026-08-03', hora: '10:00' },
          },
        },
        {
          ...baseSalida,
          id: 2,
          estadoSalida: EstadoSalida.CANCELADO,
          horario_configuracion: {
            inicio: { fecha: '2026-08-03', hora: '06:30' },
            finCalculado: { fecha: '2026-08-03', hora: '08:30' },
          },
        },
        {
          ...baseSalida,
          id: 3,
          tipoSalida: TipoSalida.ESPECIAL,
          estadoSalida: EstadoSalida.EN_CURSO,
          horario_configuracion: {
            ocurrencias: [
              {
                fecha: '2026-08-15',
                horaInicio: '09:00',
                finCalculado: { hora: '11:00' },
              },
            ],
          },
        },
      ],
      new Date(2026, 7, 15),
    );

    const allDays = result.weeks.flatMap((week) => week.days);
    const augustThird = allDays.find((day) => day.date === '2026-08-03');
    const augustFifteenth = allDays.find((day) => day.date === '2026-08-15');

    assert.equal(result.weeks.every((week) => week.days.length === 7), true);
    assert.equal(result.totalEventos, 3);
    assert.equal(augustThird?.total, 2);
    assert.equal(augustThird?.summary.programado, 1);
    assert.equal(augustThird?.summary.cancelado, 1);
    assert.deepEqual(augustThird?.items.map((item) => item.salidaId), [2, 1]);
    assert.equal(augustThird?.items[1].asientosDisponibles, 2);
    assert.equal(augustFifteenth?.isToday, true);
    assert.equal(augustFifteenth?.summary.enCurso, 1);
  });

  it('expands recurring schedules across the visible calendar range', () => {
    const result = buildCalendarioMes(
      2026,
      8,
      [
        {
          ...baseSalida,
          id: 4,
          tipoSalida: TipoSalida.RECURRENTE,
          horario_configuracion: {
            dias: [
              {
                dia: 'lunes',
                horarios: [{ horaInicio: '07:00', horaFinEstimada: '09:00' }],
              },
            ],
          },
        },
      ],
      new Date(2026, 7, 1),
    );

    const mondayDates = result.weeks
      .flatMap((week) => week.days)
      .filter((day) => day.items.some((item) => item.salidaId === 4))
      .map((day) => day.date);

    assert.deepEqual(mondayDates, [
      '2026-07-27',
      '2026-08-03',
      '2026-08-10',
      '2026-08-17',
      '2026-08-24',
      '2026-08-31',
    ]);
    assert.equal(result.totalEventos, 5);
  });
});
