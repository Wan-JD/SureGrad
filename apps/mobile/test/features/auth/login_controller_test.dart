import 'package:flutter_test/flutter_test.dart';
import 'package:suregrad_mobile/core/network/api_result.dart';
import 'package:suregrad_mobile/features/auth/data/auth_api.dart';
import 'package:suregrad_mobile/features/auth/data/auth_repository.dart';
import 'package:suregrad_mobile/features/auth/presentation/login_controller.dart';

import '../../support/fake_api_client.dart';

void main() {
  group('LoginController', () {
    test('loadCaptcha reports success from the real API flow', () async {
      final controller = LoginController(
        repository: AuthRepository(
          api: AuthApi(
            client: FakeApiClient(
              onPost: (path, {body, queryParameters}) async {
                expect(path, '/auth/captcha/issue');
                return const ApiSuccess(<String, dynamic>{
                  'captchaId': 'test-captcha-id',
                  'image': '<svg>test</svg>',
                });
              },
            ),
          ),
        ),
      );

      final loaded = await controller.loadCaptcha();

      expect(loaded, isTrue);
      expect(controller.errorText, isNull);
      expect(controller.captcha, isNotNull);
      expect(controller.captcha!.captchaId, 'test-captcha-id');
    });

    test('submit surfaces mapped captcha error text', () async {
      final controller = LoginController(
        repository: AuthRepository(
          api: AuthApi(
            client: FakeApiClient(
              onPost: (path, {body, queryParameters}) async {
                if (path == '/auth/captcha/issue') {
                  return const ApiSuccess(<String, dynamic>{
                    'captchaId': 'test-id',
                    'image': '<svg>test</svg>',
                  });
                }
                return const ApiFailure('CAPTCHA_INVALID', statusCode: 400);
              },
            ),
          ),
        ),
      );

      await controller.loadCaptcha();

      final session = await controller.submit(
        phone: '13800138000',
        code: '0000',
      );

      expect(session, isNull);
      expect(controller.errorText, '验证码错误，请重新输入。');
    });
  });
}
