// tests basicos para schedule service sin acentos ni punto final
import { ScheduleService } from './schedule.service';
import type { OfferSlot } from '../entities/offer.entity';

describe('ScheduleService', () => {
  it('toMinutes convierte hh:mm a minutos', () => {
    expect(ScheduleService.toMinutes('00:00')).toBe(0);
    expect(ScheduleService.toMinutes('01:30')).toBe(90);
    expect(ScheduleService.toMinutes('08:05')).toBe(8 * 60 + 5);
  });

  it('overlap detecta cruce mismo dia', () => {
    const a = { dia: 'LU', inicio: '08:00', fin: '09:20' } as const;
    const b = { dia: 'LU', inicio: '09:10', fin: '10:00' } as const;
    const c = { dia: 'MA', inicio: '08:00', fin: '09:20' } as const;
    const d = { dia: 'LU', inicio: '09:20', fin: '10:00' } as const;

    expect(ScheduleService.overlap(a, b)).toBe(true);
    expect(ScheduleService.overlap(a, c)).toBe(false);
    expect(ScheduleService.overlap(a, d)).toBe(false);
  });

  it('anyOverlap detecta cruce entre listas', () => {
    const slotsA: OfferSlot[] = [
      { dia: 'LU', inicio: '08:00', fin: '09:20' },
      { dia: 'MI', inicio: '08:00', fin: '09:20' },
    ];
    const slotsB: OfferSlot[] = [{ dia: 'LU', inicio: '09:10', fin: '10:00' }];
    const slotsC: OfferSlot[] = [{ dia: 'JU', inicio: '09:10', fin: '10:00' }];

    expect(ScheduleService.anyOverlap(slotsA, slotsB)).toBe(true);
    expect(ScheduleService.anyOverlap(slotsA, slotsC)).toBe(false);
  });
});
