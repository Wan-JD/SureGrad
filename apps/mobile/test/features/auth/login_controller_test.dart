import 'package:flutter_test/flutter_test.dart';
import 'package:suregrad_mobile/core/network/api_result.dart';
import 'package:suregrad_mobile/features/auth/data/auth_api.dart';
import 'package:suregrad_mobile/features/auth/data/auth_repository.dart';
import 'package:suregrad_mobile/features/auth/presentation/login_controller.dart';

import '../../support/fake_api_client.dart';

void main() {
  group('LoginController', () {
    test('sendOtp reports success from the real API flow', () async {
      final controller = LoginController(
        repository: AuthRepository(
          api: AuthApi(
            client: FakeApiClient(
              onPost: (path, {body, queryParameters}) async {
                expect(path, '/auth/otp/send');
                expect(body?['phone'], '13800138000');
                return const ApiSuccess(<String, dynamic>{
                  'sent': true,
                  'expireSeconds': 300,
                  'retryAfterSeconds': 60,
                });
              },
            ),
          ),
        ),
      );

      final sent = await controller.sendOtp('13800138000');

      expect(sent, isTrue);
      expect(controller.errorText, isNull);
      expect(controller.otpFeedbackText, '验证码已通过真实接口发送。当前后端演示验证码仍为 123456。');
    });

    test('submit surfaces mapped OTP error text', () async {
      final controller = LoginController(
        repository: AuthRepository(
          api: AuthApi(
            client: FakeApiClient(
              onPost: (path, {body, queryParameters}) async {
                expect(path, '/auth/login/otp');
                return const ApiFailure('OTP_INVALID', statusCode: 400);
              },
            ),
          ),
        ),
      );

      final session = await controller.submit(
        phone: '13800138000',
        otpCode: '000000',
      );

      expect(session, isNull);
      expect(controller.errorText, '验证码错误，请输入后端当前接受的 123456。');
    });
  });
}
