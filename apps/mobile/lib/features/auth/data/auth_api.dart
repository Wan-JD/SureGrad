import '../../../core/network/api_client.dart';
import '../../../core/network/api_result.dart';
import 'auth_models.dart';

class AuthApi {
  const AuthApi({required this.client});

  final ApiClient client;

  String get sendOtpPath => '/auth/otp/send';
  String get loginPath => '/auth/login/otp';

  Future<ApiResult<OtpSendResult>> sendOtp({required String phone}) async {
    final result = await client.post(
      sendOtpPath,
      body: <String, dynamic>{'phone': phone, 'scene': 'login'},
    );

    if (result is ApiFailure<Map<String, dynamic>>) {
      return ApiFailure(
        _mapSendOtpError(result.message, result.statusCode),
        statusCode: result.statusCode,
      );
    }

    final payload = (result as ApiSuccess<Map<String, dynamic>>).data;
    return ApiSuccess(OtpSendResult.fromJson(payload));
  }

  Future<ApiResult<AuthSession>> loginWithOtp({
    required String phone,
    required String otpCode,
  }) async {
    final result = await client.post(
      loginPath,
      body: <String, dynamic>{'phone': phone, 'otpCode': otpCode},
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

  String _mapSendOtpError(String message, int? statusCode) {
    if (statusCode == 500) {
      return '验证码发送接口当前返回 500，请先检查后端服务。';
    }
    return message;
  }

  String _mapLoginError(String message, int? statusCode) {
    switch (message) {
      case 'OTP_INVALID':
        return '验证码错误，请重新输入。';
      case 'OTP_EXPIRED':
        return '验证码已过期，请重新获取。';
      case 'OTP_NOT_FOUND':
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
