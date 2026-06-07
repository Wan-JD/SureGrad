import '../../../core/network/api_result.dart';
import 'auth_api.dart';
import 'auth_models.dart';

class AuthRepository {
  const AuthRepository({required this.api});

  final AuthApi api;

  Future<ApiResult<CaptchaResult>> issueCaptcha() {
    return api.issueCaptcha();
  }

  Future<ApiResult<AuthSession>> signInWithCaptcha({
    required String phone,
    required String captchaId,
    required String code,
  }) {
    return api.loginWithCaptcha(
      phone: phone,
      captchaId: captchaId,
      code: code,
    );
  }
}
