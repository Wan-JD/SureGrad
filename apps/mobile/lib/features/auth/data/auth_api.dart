import '../../../core/network/api_client.dart';
import '../../../core/network/api_result.dart';
import 'auth_models.dart';

class AuthApi {
  const AuthApi({required this.client});

  final ApiClient client;

  String get captchaPath => '/auth/captcha/issue';
  String get loginCaptchaPath => '/auth/login/captcha';

  Future<ApiResult<CaptchaResult>> issueCaptcha() async {
    final result = await client.post(captchaPath);

    if (result is ApiFailure<Map<String, dynamic>>) {
      return ApiFailure(
        result.message,
        statusCode: result.statusCode,
      );
    }

    final payload = (result as ApiSuccess<Map<String, dynamic>>).data;
    return ApiSuccess(CaptchaResult.fromJson(payload));
  }

  Future<ApiResult<AuthSession>> loginWithCaptcha({
    required String phone,
    required String captchaId,
    required String code,
  }) async {
    final result = await client.post(
      loginCaptchaPath,
      body: <String, dynamic>{
        'phone': phone,
        'captchaId': captchaId,
        'code': code,
      },
    );

    if (result is ApiFailure<Map<String, dynamic>>) {
      return ApiFailure(
        _mapLoginError(result.message, result.statusCode),
        statusCode: result.statusCode,
      );
    }

    final payload = (result as ApiSuccess<Map<String, dynamic>>).data;
    return ApiSuccess(AuthSession.fromJson(payload));
  }

  String _mapLoginError(String message, int? statusCode) {
    switch (message) {
      case 'CAPTCHA_INVALID':
        return '验证码错误，请重新输入。';
      case 'CAPTCHA_EXPIRED':
        return '验证码已过期，请点击图片刷新。';
      case 'CAPTCHA_NOT_FOUND':
        return '请先获取验证码。';
      case 'FORBIDDEN':
        return '当前账号不可用，请联系管理员。';
      default:
        if (statusCode == 500) {
          return '登录接口异常，请稍后重试。';
        }
        return message;
    }
  }
}
