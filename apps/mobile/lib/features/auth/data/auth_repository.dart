import '../../../core/network/api_result.dart';
import 'auth_api.dart';

class AuthRepository {
  const AuthRepository({required this.api});

  final AuthApi api;

  Future<ApiResult<void>> signInWithOtp({
    required String phone,
    required String otpCode,
  }) {
    return api.loginWithOtp(phone: phone, otpCode: otpCode);
  }
}
