import 'package:flutter/material.dart';

import '../../features/auth/presentation/login_page.dart';
import '../../features/comparison/presentation/comparison_page.dart';
import '../../features/favorites/presentation/favorites_page.dart';
import '../../features/home/presentation/home_page.dart';
import '../../features/planning/presentation/planning_page.dart';
import '../../features/profile/presentation/profile_page.dart';
import '../../features/reminders/presentation/reminders_page.dart';
import '../../features/resources/presentation/resource_detail_page.dart';
import '../../features/resources/presentation/resources_page.dart';
import '../../features/programs/presentation/program_detail_page.dart';
import '../../features/schools/presentation/school_detail_page.dart';
import '../../features/schools/presentation/school_list_page.dart';
import '../../features/onboarding/presentation/first_time_setup_page.dart';
import '../../features/onboarding/presentation/onboarding_page.dart';
import '../../features/splash/presentation/splash_page.dart';
import '../../features/todo/presentation/todo_page.dart';
import '../bootstrap/app_bootstrap.dart';
import 'app_routes.dart';
import 'login_route_args.dart';
import 'program_detail_route_args.dart';
import 'resource_detail_route_args.dart';
import 'school_detail_route_args.dart';

class AppRouter {
  const AppRouter(this._bootstrap);

  final AppBootstrap _bootstrap;

  /// Cold start: new users see onboarding; logged-in users land on home; guests land on schools tab.
  String get initialRoute {
    if (!_bootstrap.sessionStore.hasSeenOnboarding) {
      return AppRoutes.onboarding;
    }
    return _bootstrap.sessionStore.isLoggedIn
        ? AppRoutes.home
        : AppRoutes.schools;
  }

  Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case AppRoutes.splash:
        return _page(const SplashPage(), settings);
      case AppRoutes.onboarding:
        return _page(const OnboardingPage(), settings);
      case AppRoutes.firstTimeSetup:
        return _page(const FirstTimeSetupPage(), settings);
      case AppRoutes.login:
        final args = settings.arguments is LoginRouteArgs
            ? settings.arguments as LoginRouteArgs
            : const LoginRouteArgs();
        return _page(LoginPage(args: args), settings);
      case AppRoutes.home:
        return _page(const HomePage(), settings);
      case AppRoutes.schools:
        return _page(const SchoolListPage(), settings);
      case AppRoutes.schoolDetail:
        final args = settings.arguments is SchoolDetailRouteArgs
            ? settings.arguments as SchoolDetailRouteArgs
            : const SchoolDetailRouteArgs(
                schoolId: 'school-unavailable',
                schoolName: '院校详情',
              );
        return _page(SchoolDetailPage(args: args), settings);
      case AppRoutes.programDetail:
        final programArgs = settings.arguments is ProgramDetailRouteArgs
            ? settings.arguments as ProgramDetailRouteArgs
            : const ProgramDetailRouteArgs(
                programId: 'program-unavailable',
                programName: '专业详情',
              );
        return _page(ProgramDetailPage(args: programArgs), settings);
      case AppRoutes.planning:
        if (!_bootstrap.sessionStore.isLoggedIn) {
          return _redirectToLogin(settings);
        }
        return _page(const PlanningPage(), settings);
      case AppRoutes.todo:
        if (!_bootstrap.sessionStore.isLoggedIn) {
          return _redirectToLogin(settings);
        }
        return _page(const TodoPage(), settings);
      case AppRoutes.resources:
        return _page(const ResourcesPage(), settings);
      case AppRoutes.resourceDetail:
        final resourceArgs = settings.arguments is ResourceDetailRouteArgs
            ? settings.arguments as ResourceDetailRouteArgs
            : const ResourceDetailRouteArgs(
                resourceId: 'resource-unavailable',
                resourceTitle: '资料详情',
              );
        return _page(ResourceDetailPage(args: resourceArgs), settings);
      case AppRoutes.profile:
        return _page(const ProfilePage(), settings);
      case AppRoutes.favorites:
        if (!_bootstrap.sessionStore.isLoggedIn) {
          return _redirectToLogin(settings);
        }
        return _page(const FavoritesPage(), settings);
      case AppRoutes.comparison:
        if (!_bootstrap.sessionStore.isLoggedIn) {
          return _redirectToLogin(settings);
        }
        return _page(const ComparisonPage(), settings);
      case AppRoutes.reminders:
        if (!_bootstrap.sessionStore.isLoggedIn) {
          return _redirectToLogin(settings);
        }
        return _page(const RemindersPage(), settings);
      default:
        return _page(
          Scaffold(
            appBar: AppBar(title: const Text('页面不存在')),
            body: Center(child: Text('未找到路由：${settings.name ?? 'unknown'}')),
          ),
          settings,
        );
    }
  }

  Route<dynamic> _redirectToLogin(RouteSettings settings) {
    return _page(
      LoginPage(
        args: LoginRouteArgs(
          redirectTo: settings.name ?? AppRoutes.home,
          redirectArguments: settings.arguments,
        ),
      ),
      settings,
    );
  }

  MaterialPageRoute<dynamic> _page(Widget child, RouteSettings settings) {
    return MaterialPageRoute<dynamic>(
      builder: (_) => child,
      settings: settings,
    );
  }
}
