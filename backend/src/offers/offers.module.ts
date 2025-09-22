// modulo de oferta
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OfferRepository } from '../infra/db/offer.repository';
import { Offer, OfferSchema } from '../infra/db/offer.schema';
import { OffersController } from '../web/offers.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema }]),
  ],
  controllers: [OffersController],
  providers: [OfferRepository],
  exports: [OfferRepository],
})
export class OffersModule {}
