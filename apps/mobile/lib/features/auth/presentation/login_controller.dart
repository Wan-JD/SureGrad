import 'package:flutter/foundation.dart';

import '../../../core/network/api_result.dart';
import '../data/auth_models.dart';
import '../data/auth_repository.dart';

class LoginController extends ChangeNotifier {
  LoginController({required this.repository});

  final AuthRepository repository;

  bool _isSubmitting = false;
  bool _isLoadingCaptcha = false;
  String? _errorText;
  String? _captchaFeedbackText;
  CaptchaResult? _captcha;

  bool get isSubmitting => _isSubmitting;
  bool get isLoadingCaptcha => _isLoadingCaptcha;
  String? get errorText => _errorText;
  String? get captchaFeedbackText => _captchaFeedbackText;
  CaptchaResult? get captcha => _captcha;

  Future<bool> loadCaptcha() async {
    _isLoadingCaptcha = true;
    _errorText = null;
    _captchaFeedbackText = null;
    notifyListeners();

    final result = await repository.issueCaptcha();
    _isLoadingCaptcha = false;

    if (result is ApiFailure<CaptchaResult>) {
      _errorText = result.message;
      notifyListeners();
      return false;
    }

    _captcha = (result as ApiSuccess<CaptchaResult>).data;
    _captchaFeedbackText = '验证码已刷新，请输入图片中的字符。';
    notifyListeners();
    return true;
  }

  Future<AuthSession?> submit({
    required String phone,
    required String code,
  }) async {
    if (phone.trim().isEmpty || code.trim().isEmpty) {
      _errorText = '请输入手机号和验证码。';
      notifyListeners();
      return null;
    }

    if (_captcha == null) {
      _errorText = '请先获取验证码。';
      notifyListeners();
      return null;
    }

    _isSubmitting = true;
    _errorText = null;
    notifyListeners();

    final result = await repository.signInWithCaptcha(
      phone: phone.trim(),
      captchaId: _captcha!.captchaId,
      code: code.trim(),
    );

    _isSubmitting = false;

    if (result is ApiFailure<AuthSession>) {
      _errorText = result.message;
      notifyListeners();
      return null;
    }

    notifyListeners();
    return (result as ApiSuccess<AuthSession>).data;
  }
}
