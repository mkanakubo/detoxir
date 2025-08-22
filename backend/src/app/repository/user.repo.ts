import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepo {
  getHello(): string {
    return 'Hello World!';
  }
}
