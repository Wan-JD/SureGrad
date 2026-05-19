import 'package:flutter/foundation.dart';

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
  String? _phoneNumber;
  String? _userId;
  String? _nickname;
  String? _phoneMasked;
  String? _avatarUrl;
  String? _accessToken;
  String? _refreshToken;
  bool _profileCompleted = false;
  PendingAuthAction? _pendingAuthAction;

  bool get isLoggedIn => _isLoggedIn;
  String? get phoneNumber => _phoneNumber;
  String? get userId => _userId;
  String? get nickname => _nickname;
  String? get phoneMasked => _phoneMasked;
  String? get avatarUrl => _avatarUrl;
  String? get accessToken => _accessToken;
  String? get refreshToken => _refreshToken;
  bool get profileCompleted => _profileCompleted;

  void signIn({
    required String phoneNumber,
    required String userId,
    required String accessToken,
    required String refreshToken,
    required bool profileCompleted,
    String? nickname,
    String? phoneMasked,
    String? avatarUrl,
  }) {
    _isLoggedIn = true;
    _phoneNumber = phoneNumber;
    _userId = userId;
    _nickname = nickname;
    _phoneMasked = phoneMasked;
    _avatarUrl = avatarUrl;
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    _profileCompleted = profileCompleted;
    notifyListeners();
  }

  void updateProfileCompletion(bool value) {
    if (_profileCompleted == value) {
      return;
    }
    _profileCompleted = value;
    notifyListeners();
  }

  void signOut() {
    _isLoggedIn = false;
    _phoneNumber = null;
    _userId = null;
    _nickname = null;
    _phoneMasked = null;
    _avatarUrl = null;
    _accessToken = null;
    _refreshToken = null;
    _profileCompleted = false;
    _pendingAuthAction = null;
    notifyListeners();
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
}
