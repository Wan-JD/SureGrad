import 'package:flutter/foundation.dart';

class AppSessionStore extends ChangeNotifier {
  bool _isLoggedIn = false;
  String? _phoneNumber;

  bool get isLoggedIn => _isLoggedIn;
  String? get phoneNumber => _phoneNumber;

  void signIn(String phoneNumber) {
    _isLoggedIn = true;
    _phoneNumber = phoneNumber;
    notifyListeners();
  }

  void signOut() {
    _isLoggedIn = false;
    _phoneNumber = null;
    notifyListeners();
  }
}
