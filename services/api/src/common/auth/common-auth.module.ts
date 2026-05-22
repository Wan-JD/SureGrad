import { Global, Module } from '@nestjs/common';
import { MockAuthGuard } from './mock-auth.guard';
import { OptionalMockAuthGuard } from './optional-mock-auth.guard';
import { MockTokenService } from './mock-token.service';

@Global()
@Module({
  providers: [MockTokenService, MockAuthGuard, OptionalMockAuthGuard],
  exports: [MockTokenService, MockAuthGuard, OptionalMockAuthGuard],
})
export class CommonAuthModule {}
