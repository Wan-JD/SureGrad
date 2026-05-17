import 'package:flutter/foundation.dart';

import '../../../core/network/api_result.dart';
import '../data/auth_repository.dart';

class LoginController extends ChangeNotifier {
  LoginController({required this.repository});

  final AuthRepository repository;

  bool _isSubmitting = false;
  String? _errorText;

  bool get isSubmitting => _isSubmitting;
  String? get errorText => _errorText;

  Future<bool> submit({required String phone, required String otpCode}) async {
    if (phone.trim().isEmpty || otpCode.trim().isEmpty) {
      _errorText = '请输入手机号和验证码。';
      notifyListeners();
      return false;
    }

    _isSubmitting = true;
    _errorText = null;
    notifyListeners();

    final result = await repository.signInWithOtp(
      phone: phone.trim(),
      otpCode: otpCode.trim(),
    );

    _isSubmitting = false;

    if (result is ApiFailure<void>) {
      _errorText = result.message;
      notifyListeners();
      return false;
    }

    notifyListeners();
    return true;
  }
}
