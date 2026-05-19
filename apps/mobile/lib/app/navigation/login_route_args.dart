import 'app_routes.dart';

class LoginRouteArgs {
  const LoginRouteArgs({
    this.redirectTo = AppRoutes.home,
    this.redirectArguments,
  });

  final String redirectTo;
  final Object? redirectArguments;
}
