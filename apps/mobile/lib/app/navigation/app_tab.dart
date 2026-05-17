import 'package:flutter/material.dart';

enum AppTab { home, schools, planning, resources, profile }

extension AppTabX on AppTab {
  String get label {
    switch (this) {
      case AppTab.home:
        return '首页';
      case AppTab.schools:
        return '择校';
      case AppTab.planning:
        return '规划';
      case AppTab.resources:
        return '资料';
      case AppTab.profile:
        return '我的';
    }
  }

  IconData get icon {
    switch (this) {
      case AppTab.home:
        return Icons.home_outlined;
      case AppTab.schools:
        return Icons.school_outlined;
      case AppTab.planning:
        return Icons.route_outlined;
      case AppTab.resources:
        return Icons.menu_book_outlined;
      case AppTab.profile:
        return Icons.person_outline;
    }
  }
}
