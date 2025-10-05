import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Wellcome to the JAP-SHOP API Gateway Service';
  }
}
