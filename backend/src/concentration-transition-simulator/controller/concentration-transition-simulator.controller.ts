import { Controller, Get } from '@nestjs/common';
import { ConcentrationTransitionSimulatorService } from '../service/concentration-transition-simulator.service';

@Controller('concentration-transition-simulator')
export class ConcentrationTransitionSimulatorController {
  constructor(
    private readonly service: ConcentrationTransitionSimulatorService,
  ) {}

  @Get()
  getHello(): string {
    return 'Hello from ConcentrationTransitionSimulatorController!';
  }
}
