import 'package:flutter/foundation.dart';

import '../../../core/network/api_result.dart';
import '../data/auth_models.dart';
import '../data/auth_repository.dart';

enum AuthMode { login, register }

class LoginController extends ChangeNotifier {
  LoginController({required this.repository});

  final AuthRepository repository;

  bool _isSubmitting = false;
  bool _isLoadingCaptcha = false;
  String? _errorText;
  String? _captchaFeedbackText;
  CaptchaResult? _captcha;
  AuthMode _mode = AuthMode.login;

  bool get isSubmitting => _isSubmitting;
  bool get isLoadingCaptcha => _isLoadingCaptcha;
  String? get errorText => _errorText;
  String? get captchaFeedbackText => _captchaFeedbackText;
  CaptchaResult? get captcha => _captcha;
  AuthMode get mode => _mode;
  bool get isRegisterMode => _mode == AuthMode.register;

  void setMode(AuthMode mode) {
    if (_mode == mode) {
      return;
    }
    _mode = mode;
    _errorText = null;
    _captchaFeedbackText = null;
    if (mode == AuthMode.login) {
      _captcha = null;
    }
    notifyListeners();
  }

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

  Future<AuthSession?> login({
    required String account,
    required String password,
  }) async {
    final normalizedAccount = account.trim();
    if (!_validateAccountAndPassword(normalizedAccount, password)) {
      return null;
    }

    return _submit(
      repository.signInWithPassword(
        account: normalizedAccount,
        password: password,
      ),
    );
  }

  Future<AuthSession?> register({
    required String account,
    required String password,
    required String confirmPassword,
    required String nickname,
    required String code,
  }) async {
    final normalizedAccount = account.trim();
    final normalizedCode = code.trim();
    if (!_validateAccountAndPassword(normalizedAccount, password)) {
      return null;
    }
    if (password != confirmPassword) {
      _errorText = '两次输入的密码不一致。';
      notifyListeners();
      return null;
    }
    if (_captcha == null) {
      _errorText = '请先获取图形验证码。';
      notifyListeners();
      return null;
    }
    if (normalizedCode.isEmpty) {
      _errorText = '请输入图形验证码。';
      notifyListeners();
      return null;
    }

    return _submit(
      repository.registerWithPassword(
        account: normalizedAccount,
        password: password,
        nickname: nickname,
        captchaId: _captcha!.captchaId,
        code: normalizedCode,
      ),
    );
  }

  bool _validateAccountAndPassword(String account, String password) {
    if (account.isEmpty || password.isEmpty) {
      _errorText = '请输入账号和密码。';
      notifyListeners();
      return false;
    }
    if (!_isPhone(account) && !_isEmail(account)) {
      _errorText = '账号需为手机号或邮箱。';
      notifyListeners();
      return false;
    }
    if (password.length < 8) {
      _errorText = '密码至少需要 8 位。';
      notifyListeners();
      return false;
    }
    return true;
  }

  Future<AuthSession?> _submit(Future<ApiResult<AuthSession>> request) async {
    _isSubmitting = true;
    _errorText = null;
    notifyListeners();

    final result = await request;
    _isSubmitting = false;

    if (result is ApiFailure<AuthSession>) {
      _errorText = result.message;
      notifyListeners();
      return null;
    }

    notifyListeners();
    return (result as ApiSuccess<AuthSession>).data;
  }

  bool _isPhone(String value) {
    return RegExp(r'^1[3-9]\d{9}$').hasMatch(value);
  }

  bool _isEmail(String value) {
    return RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(value);
  }
}
