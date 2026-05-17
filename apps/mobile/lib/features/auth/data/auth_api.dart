import '../../../core/network/api_client.dart';
import '../../../core/network/api_result.dart';

class AuthApi {
  const AuthApi({required this.client});

  final ApiClient client;

  String get loginPath => '/auth/login/otp';

  Future<ApiResult<void>> loginWithOtp({
    required String phone,
    required String otpCode,
  }) async {
    client.resolve(loginPath);
    await Future<void>.delayed(const Duration(milliseconds: 700));

    if (otpCode != '123456') {
      return const ApiFailure('当前骨架仅接受 123456 作为模拟验证码。');
    }

    return const ApiSuccess(null);
  }
}
