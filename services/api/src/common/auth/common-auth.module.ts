import { Global, Module } from '@nestjs/common';
import { MockAuthGuard } from './mock-auth.guard';
import { MockTokenService } from './mock-token.service';

@Global()
@Module({
  providers: [MockTokenService, MockAuthGuard],
  exports: [MockTokenService, MockAuthGuard],
})
export class CommonAuthModule {}
