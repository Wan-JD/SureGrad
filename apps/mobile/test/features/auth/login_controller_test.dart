import 'package:flutter_test/flutter_test.dart';
import 'package:suregrad_mobile/core/network/api_result.dart';
import 'package:suregrad_mobile/features/auth/data/auth_api.dart';
import 'package:suregrad_mobile/features/auth/data/auth_repository.dart';
import 'package:suregrad_mobile/features/auth/presentation/login_controller.dart';

import '../../support/fake_api_client.dart';

void main() {
  group('LoginController', () {
    test('login submits account and password to the password endpoint', () async {
      final controller = LoginController(
        repository: AuthRepository(
          api: AuthApi(
            client: FakeApiClient(
              onPost: (path, {body, queryParameters}) async {
                expect(path, '/auth/login/password');
                expect(body, {
                  'account': 'student@example.com',
                  'password': 'password123',
                });
                return ApiSuccess(_sessionJson(isNewUser: false));
              },
            ),
          ),
        ),
      );

      final session = await controller.login(
        account: 'student@example.com',
        password: 'password123',
      );

      expect(session, isNotNull);
      expect(session!.user.accountLabel, 'st***@example.com');
      expect(controller.errorText, isNull);
    });

    test('register loads captcha and submits only to the register endpoint', () async {
      final postedPaths = <String>[];
      final controller = LoginController(
        repository: AuthRepository(
          api: AuthApi(
            client: FakeApiClient(
              onPost: (path, {body, queryParameters}) async {
                postedPaths.add(path);
                if (path == '/auth/captcha/issue') {
                  return const ApiSuccess(<String, dynamic>{
                    'captchaId': 'test-captcha-id',
                    'image': '<svg>test</svg>',
                  });
                }

                expect(path, '/auth/register');
                expect(body, {
                  'account': '13800138000',
                  'password': 'password123',
                  'nickname': '考研人',
                  'captchaId': 'test-captcha-id',
                  'code': 'ABCD',
                });
                return ApiSuccess(_sessionJson(isNewUser: true));
              },
            ),
          ),
        ),
      );

      controller.setMode(AuthMode.register);
      final loaded = await controller.loadCaptcha();
      final session = await controller.register(
        account: '13800138000',
        password: 'password123',
        confirmPassword: 'password123',
        nickname: '考研人',
        code: 'ABCD',
      );

      expect(loaded, isTrue);
      expect(session, isNotNull);
      expect(postedPaths, ['/auth/captcha/issue', '/auth/register']);
    });

    test('register surfaces duplicate account errors', () async {
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
                return const ApiFailure('ACCOUNT_EXISTS', statusCode: 409);
              },
            ),
          ),
        ),
      );

      controller.setMode(AuthMode.register);
      await controller.loadCaptcha();
      final session = await controller.register(
        account: '13800138000',
        password: 'password123',
        confirmPassword: 'password123',
        nickname: '',
        code: 'ABCD',
      );

      expect(session, isNull);
      expect(controller.errorText, '这个账号已经注册，请直接登录。');
    });
  });
}

Map<String, dynamic> _sessionJson({required bool isNewUser}) {
  return <String, dynamic>{
    'accessToken': 'access-token',
    'refreshToken': 'refresh-token',
    'expiresIn': 604800,
    'isNewUser': isNewUser,
    'profileCompleted': !isNewUser,
    'user': <String, dynamic>{
      'userId': 'user-1',
      'phoneMasked': null,
      'emailMasked': 'st***@example.com',
      'accountLabel': 'st***@example.com',
      'nickname': '考研人',
      'avatarUrl': null,
    },
  };
}
