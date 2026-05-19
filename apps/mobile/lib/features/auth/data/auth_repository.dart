import '../../../core/network/api_result.dart';
import 'auth_api.dart';
import 'auth_models.dart';

class AuthRepository {
  const AuthRepository({required this.api});

  final AuthApi api;

  Future<ApiResult<OtpSendResult>> sendOtp({required String phone}) {
    return api.sendOtp(phone: phone);
  }

  Future<ApiResult<AuthSession>> signInWithOtp({
    required String phone,
    required String otpCode,
  }) {
    return api.loginWithOtp(phone: phone, otpCode: otpCode);
  }
}
