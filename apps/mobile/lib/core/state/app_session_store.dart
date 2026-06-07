import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum PendingAuthActionType {
  favoriteSchool,
  addFeaturedProgramToComparison,
  setFeaturedProgramAsTarget,
}

class PendingAuthAction {
  const PendingAuthAction({
    required this.routeName,
    required this.type,
    required this.targetId,
  });

  final String routeName;
  final PendingAuthActionType type;
  final String targetId;
}

class AppSessionStore extends ChangeNotifier {
  bool _isLoggedIn = false;
  bool _hasSeenOnboarding = false;
  String? _account;
  String? _phoneNumber;
  String? _userId;
  String? _nickname;
  String? _phoneMasked;
  String? _accountLabel;
  String? _avatarUrl;
  String? _accessToken;
  String? _refreshToken;
  bool _profileCompleted = false;
  PendingAuthAction? _pendingAuthAction;

  bool get isLoggedIn => _isLoggedIn;
  bool get hasSeenOnboarding => _hasSeenOnboarding;
  String? get account => _account;
  String? get phoneNumber => _phoneNumber;
  String? get userId => _userId;
  String? get nickname => _nickname;
  String? get phoneMasked => _phoneMasked;
  String? get accountLabel => _accountLabel ?? _phoneMasked;
  String? get avatarUrl => _avatarUrl;
  String? get accessToken => _accessToken;
  String? get refreshToken => _refreshToken;
  bool get profileCompleted => _profileCompleted;

  Future<void> loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    _hasSeenOnboarding = prefs.getBool('hasSeenOnboarding') ?? false;
    _isLoggedIn = prefs.getBool('isLoggedIn') ?? false;
    _account = _readNullableString(prefs, 'account');
    _phoneNumber = _readNullableString(prefs, 'phoneNumber');
    _userId = _readNullableString(prefs, 'userId');
    _nickname = _readNullableString(prefs, 'nickname');
    _phoneMasked = _readNullableString(prefs, 'phoneMasked');
    _accountLabel = _readNullableString(prefs, 'accountLabel');
    _avatarUrl = _readNullableString(prefs, 'avatarUrl');
    _accessToken = _readNullableString(prefs, 'accessToken');
    _refreshToken = _readNullableString(prefs, 'refreshToken');
    _profileCompleted = prefs.getBool('profileCompleted') ?? false;
    notifyListeners();
  }

  Future<void> _saveToPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('hasSeenOnboarding', _hasSeenOnboarding);
    await prefs.setBool('isLoggedIn', _isLoggedIn);
    await prefs.setString('account', _account ?? '');
    await prefs.setString('phoneNumber', _phoneNumber ?? '');
    await prefs.setString('userId', _userId ?? '');
    await prefs.setString('nickname', _nickname ?? '');
    await prefs.setString('phoneMasked', _phoneMasked ?? '');
    await prefs.setString('accountLabel', _accountLabel ?? '');
    await prefs.setString('avatarUrl', _avatarUrl ?? '');
    await prefs.setString('accessToken', _accessToken ?? '');
    await prefs.setString('refreshToken', _refreshToken ?? '');
    await prefs.setBool('profileCompleted', _profileCompleted);
  }

  void signIn({
    String? account,
    required String phoneNumber,
    required String userId,
    required String accessToken,
    required String refreshToken,
    required bool profileCompleted,
    String? nickname,
    String? phoneMasked,
    String? accountLabel,
    String? avatarUrl,
  }) {
    _isLoggedIn = true;
    _account = account ?? phoneNumber;
    _phoneNumber = phoneNumber;
    _userId = userId;
    _nickname = nickname;
    _phoneMasked = phoneMasked;
    _accountLabel = accountLabel ?? phoneMasked;
    _avatarUrl = avatarUrl;
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    _profileCompleted = profileCompleted;
    notifyListeners();
    _saveToPrefs();
  }

  void updateProfileCompletion(bool value) {
    if (_profileCompleted == value) {
      return;
    }
    _profileCompleted = value;
    notifyListeners();
    _saveToPrefs();
  }

  void completeOnboarding() {
    if (_hasSeenOnboarding) {
      return;
    }
    _hasSeenOnboarding = true;
    notifyListeners();
    _saveToPrefs();
  }

  void signOut() {
    _isLoggedIn = false;
    _hasSeenOnboarding = false;
    _account = null;
    _phoneNumber = null;
    _userId = null;
    _nickname = null;
    _phoneMasked = null;
    _accountLabel = null;
    _avatarUrl = null;
    _accessToken = null;
    _refreshToken = null;
    _profileCompleted = false;
    _pendingAuthAction = null;
    notifyListeners();
    _saveToPrefs();
  }

  void stagePendingAuthAction(PendingAuthAction action) {
    _pendingAuthAction = action;
  }

  PendingAuthAction? takePendingAuthAction(String routeName) {
    final action = _pendingAuthAction;
    if (action == null || action.routeName != routeName) {
      return null;
    }
    _pendingAuthAction = null;
    return action;
  }

  String? _readNullableString(SharedPreferences prefs, String key) {
    final value = prefs.getString(key);
    if (value == null || value.isEmpty) {
      return null;
    }
    return value;
  }
}
