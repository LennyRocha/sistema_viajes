import { BadRequestException } from '@nestjs/common';
import { ConductoresService, CACHE_KEY } from './conductores.service';

const mockJsonResponse = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
  }) as unknown as Response;

describe('ConductoresService', () => {
  let service: ConductoresService;
  let prisma: {
    conductor: {
      update: jest.Mock;
      delete: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let redis: {
    del: jest.Mock;
    get: jest.Mock;
    set: jest.Mock;
  };
  let fetchMock: jest.Mock;

  const conductor = {
    id: 1,
    usuario_id: 7,
    institucion_id: 3,
    estatus: true,
  };

  beforeEach(() => {
    process.env.AUTH_SERVICE_URL = 'http://auth-service.test';
    process.env.INTERNAL_SERVICE_TOKEN = 'internal-token';

    prisma = {
      conductor: {
        update: jest.fn().mockResolvedValue({ ...conductor, estatus: false }),
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    redis = {
      del: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      set: jest.fn(),
    };

    const instituciones = {
      findOne: jest.fn(),
    };

    const logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    service = new ConductoresService(
      prisma as any,
      redis as any,
      instituciones as any,
      logger as any,
    );

    jest.spyOn(service, 'findOne').mockResolvedValue(conductor as any);

    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sincroniza el estatus del usuario al desactivar un conductor', async () => {
    fetchMock
      .mockResolvedValueOnce(mockJsonResponse({ id: 7, estatus: true }))
      .mockResolvedValueOnce(mockJsonResponse({ updated: true }));

    await expect(service.shutdown(1)).resolves.toEqual({ updated: true });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://auth-service.test/usuarios/status/7',
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          'x-internal-service-token': 'internal-token',
        }),
      }),
    );
    expect(prisma.conductor.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { estatus: false },
    });
    expect(redis.del).toHaveBeenCalledWith(CACHE_KEY());
    expect(redis.del).toHaveBeenCalledWith(CACHE_KEY(3));
  });

  it('remove aplica baja logica y no elimina fisicamente al conductor', async () => {
    fetchMock
      .mockResolvedValueOnce(mockJsonResponse({ id: 7, estatus: true }))
      .mockResolvedValueOnce(mockJsonResponse({ updated: true }));

    await expect(service.remove(1)).resolves.toEqual({ deleted: true });

    expect(prisma.conductor.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { estatus: false },
    });
    expect(prisma.conductor.delete).not.toHaveBeenCalled();
  });

  it('restaura el usuario con un payload sanitizado si falla la actualizacion del conductor', async () => {
    const previousUser = {
      id: 7,
      nombres: 'Ana',
      apellido_paterno: 'Lopez',
      apellido_materno: 'Ruiz',
      curp: 'LORA010101MDFPZN01',
      fecha_nacimiento: '2001-01-01T00:00:00.000Z',
      telefono: '5555555555',
      email: 'ana@example.com',
      foto_perfil: '',
      estatus: true,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    };

    fetchMock
      .mockResolvedValueOnce(mockJsonResponse(previousUser))
      .mockResolvedValueOnce(mockJsonResponse({ ...previousUser, nombres: 'Anita' }))
      .mockResolvedValueOnce(mockJsonResponse(previousUser));
    prisma.$transaction.mockRejectedValue(new Error('db failed'));

    await expect(service.update(1, { nombres: 'Anita' })).rejects.toThrow('db failed');

    const patchCalls = fetchMock.mock.calls.filter(
      ([, options]) => (options as RequestInit)?.method === 'PATCH',
    );
    const rollbackBody = JSON.parse(String((patchCalls[1][1] as RequestInit).body));

    expect(rollbackBody).toEqual({
      nombres: 'Ana',
      apellido_paterno: 'Lopez',
      apellido_materno: 'Ruiz',
      curp: 'LORA010101MDFPZN01',
      fecha_nacimiento: '2001-01-01T00:00:00.000Z',
      telefono: '5555555555',
      email: 'ana@example.com',
      foto_perfil: '',
    });
    expect(rollbackBody).not.toHaveProperty('id');
    expect(rollbackBody).not.toHaveProperty('estatus');
    expect(rollbackBody).not.toHaveProperty('createdAt');
    expect(rollbackBody).not.toHaveProperty('updatedAt');
  });

  it('falla antes de tocar conductor si no puede sincronizar el usuario', async () => {
    fetchMock
      .mockResolvedValueOnce(mockJsonResponse({ id: 7, estatus: true }))
      .mockResolvedValueOnce(mockJsonResponse({ message: 'error' }, false, 500));

    await expect(service.shutdown(1)).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.conductor.update).not.toHaveBeenCalled();
  });
});
