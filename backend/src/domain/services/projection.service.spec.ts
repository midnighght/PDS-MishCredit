// tests basicos para projection service sin acentos ni punto final
import { ProjectionService } from './projection.service';

describe('ProjectionService', () => {
  const malla = [
    { codigo: 'A', asignatura: 'A', creditos: 6, nivel: 1, prereq: '' },
    { codigo: 'B', asignatura: 'B', creditos: 6, nivel: 1, prereq: '' },
    { codigo: 'C', asignatura: 'C', creditos: 6, nivel: 2, prereq: 'A' },
    { codigo: 'D', asignatura: 'D', creditos: 8, nivel: 2, prereq: 'B' },
  ];

  it('prioriza reprobados y respeta prerequisitos', () => {
    const avance = [
      {
        nrc: '1',
        period: '202310',
        student: 'x',
        course: 'A',
        excluded: false,
        inscriptionType: 'REG',
        status: 'APROBADO',
      },
      {
        nrc: '2',
        period: '202320',
        student: 'x',
        course: 'B',
        excluded: false,
        inscriptionType: 'REG',
        status: 'REPROBADO',
      },
    ];

    const res = ProjectionService.build({ malla, avance, topeCreditos: 14 });
    // B reprobado debe ir primero
    expect(res.seleccion[0].codigo).toBe('B');
    // C requiere A y A esta aprobado, puede entrar
    const codigos = res.seleccion.map((c) => c.codigo);
    expect(codigos).toContain('C');
    // tope de creditos respetado
    expect(res.totalCreditos).toBeLessThanOrEqual(14);
  });
});
