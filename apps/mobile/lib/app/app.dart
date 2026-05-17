import 'package:flutter/material.dart';

import 'bootstrap/app_bootstrap.dart';
import 'navigation/app_router.dart';
import 'navigation/app_routes.dart';
import 'theme/app_theme.dart';

class SureGradApp extends StatelessWidget {
  const SureGradApp({super.key, required this.bootstrap});

  final AppBootstrap bootstrap;

  @override
  Widget build(BuildContext context) {
    return AppScope(
      bootstrap: bootstrap,
      child: MaterialApp(
        title: 'SureGrad',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        initialRoute: AppRoutes.splash,
        onGenerateRoute: AppRouter(bootstrap).onGenerateRoute,
      ),
    );
  }
}
