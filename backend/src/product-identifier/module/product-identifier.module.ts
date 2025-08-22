import { Module } from '@nestjs/common';
import { ProductIdentifierService } from '../service/product-identifier.service';

@Module({
  providers: [ProductIdentifierService],
})
export class ProductIdentifierModule {}
