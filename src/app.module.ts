import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserService } from './user/user.service';
import { CountUserService } from './count-user/count-user.service';
import { CountUserController } from './count-user/count-user.controller';
import { UserController } from './user/user.controller';
import { VerifyCacheMiddleware } from './middlewares/verify.cache';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from './validation/validation.pipe';
import { HealthyCheckController } from './healthy-check/healthy-check.controller';
import { HealthyCheckService } from './healthy-check/healthy-check.service';
import { ClusterService } from './libs/cluster.service';

@Module({
  controllers: [UserController, CountUserController, HealthyCheckController],
  providers: [
    UserService,
    CountUserService,
    HealthyCheckService,
    ClusterService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyCacheMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
