// util de horarios y choques sin acentos ni punto final
import type { OfferSlot } from '../entities/offer.entity';

export class ScheduleService {
  static toMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  static overlap(a: OfferSlot, b: OfferSlot): boolean {
    if ((a.dia || '') !== (b.dia || '')) return false;
    const a1 = this.toMinutes(a.inicio);
    const a2 = this.toMinutes(a.fin);
    const b1 = this.toMinutes(b.inicio);
    const b2 = this.toMinutes(b.fin);
    return a1 < b2 && b1 < a2;
  }

  static anyOverlap(slotsA: OfferSlot[], slotsB: OfferSlot[]): boolean {
    for (const a of slotsA)
      for (const b of slotsB) if (this.overlap(a, b)) return true;
    return false;
  }
}
