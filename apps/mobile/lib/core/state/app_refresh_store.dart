import 'package:flutter/foundation.dart';

class AppRefreshStore extends ChangeNotifier {
  int _revision = 0;

  int get revision => _revision;

  void markDirty() {
    _revision += 1;
    notifyListeners();
  }
}
