import 'app_tab.dart';

class AppRoutes {
  static const splash = '/';
  static const login = '/login';
  static const home = '/home';
  static const schools = '/schools';
  static const schoolDetail = '/schools/detail';
  static const programDetail = '/programs/detail';
  static const planning = '/planning';
  static const todo = '/todo';
  static const resources = '/resources';
  static const profile = '/profile';
  static const favorites = '/favorites';
  static const comparison = '/comparison';
  static const reminders = '/reminders';

  static String fromTab(AppTab tab) {
    switch (tab) {
      case AppTab.home:
        return home;
      case AppTab.schools:
        return schools;
      case AppTab.planning:
        return planning;
      case AppTab.resources:
        return resources;
      case AppTab.profile:
        return profile;
    }
  }
}
