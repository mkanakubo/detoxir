import { Module } from '@nestjs/common';
import { ConcentrationTransitionSimulatorModule } from '../../concentration-transition-simulator/module/concentration-transition-simulator.module';
import { ProductIdentifierModule } from '../../product-identifier/module/product-identifier.module';
import { AppController } from '../controller/app.controller';
import { AppService } from '../service/app.service';
import { UserService } from '../service/user.service';

@Module({
  imports: [ConcentrationTransitionSimulatorModule, ProductIdentifierModule],
  controllers: [AppController],
  providers: [AppService, UserService],
})
export class AppModule {}
