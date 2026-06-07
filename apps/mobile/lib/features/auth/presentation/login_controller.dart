import 'package:flutter/foundation.dart';

import '../../../core/network/api_result.dart';
import '../data/auth_models.dart';
import '../data/auth_repository.dart';

class LoginController extends ChangeNotifier {
  LoginController({required this.repository});

  final AuthRepository repository;

  bool _isSubmitting = false;
  bool _isSendingOtp = false;
  String? _errorText;
  String? _otpFeedbackText;

  bool get isSubmitting => _isSubmitting;
  bool get isSendingOtp => _isSendingOtp;
  String? get errorText => _errorText;
  String? get otpFeedbackText => _otpFeedbackText;

  int? _otpExpireSeconds;
  int? _otpRetryAfterSeconds;

  int? get otpExpireSeconds => _otpExpireSeconds;
  int? get otpRetryAfterSeconds => _otpRetryAfterSeconds;

  Future<bool> sendOtp(String phone) async {
    if (phone.trim().isEmpty) {
      _errorText = '请输入手机号。';
      _otpFeedbackText = null;
      notifyListeners();
      return false;
    }

    _isSendingOtp = true;
    _errorText = null;
    _otpFeedbackText = null;
    notifyListeners();

    final result = await repository.sendOtp(phone: phone.trim());
    _isSendingOtp = false;

    if (result is ApiFailure<OtpSendResult>) {
      _errorText = result.message;
      notifyListeners();
      return false;
    }

    final payload = (result as ApiSuccess<OtpSendResult>).data;
    _otpExpireSeconds = payload.expireSeconds;
    _otpRetryAfterSeconds = payload.retryAfterSeconds;
    _otpFeedbackText = payload.sent
        ? '验证码已发送，${payload.expireSeconds} 秒内有效。'
        : '验证码发送失败，请稍后重试。';
    notifyListeners();
    return payload.sent;
  }

  Future<AuthSession?> submit({
    required String phone,
    required String otpCode,
  }) async {
    if (phone.trim().isEmpty || otpCode.trim().isEmpty) {
      _errorText = '请输入手机号和验证码。';
      notifyListeners();
      return null;
    }

    _isSubmitting = true;
    _errorText = null;
    notifyListeners();

    final result = await repository.signInWithOtp(
      phone: phone.trim(),
      otpCode: otpCode.trim(),
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
