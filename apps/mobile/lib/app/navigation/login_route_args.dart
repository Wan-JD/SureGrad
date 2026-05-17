import 'app_routes.dart';

class LoginRouteArgs {
  const LoginRouteArgs({this.redirectTo = AppRoutes.home});

  final String redirectTo;
}
