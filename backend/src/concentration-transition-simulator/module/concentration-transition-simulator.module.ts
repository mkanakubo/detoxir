import { Module } from '@nestjs/common';
import { ConcentrationTransitionSimulatorService } from '../service/concentration-transition-simulator.service';
import { ConcentrationTransitionSimulatorController } from '../controller/concentration-transition-simulator.controller';

@Module({
  providers: [ConcentrationTransitionSimulatorService],
  controllers: [ConcentrationTransitionSimulatorController],
})
export class ConcentrationTransitionSimulatorModule {}
