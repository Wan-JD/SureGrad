import 'package:flutter/material.dart';

import 'app/bootstrap/app_bootstrap.dart';
import 'app/theme/app_theme.dart';
import 'features/splash/presentation/splash_page.dart';

/// Web-only entry used by tools/visual-qa to screenshot the guest splash screen.
void main() {
  WidgetsFlutterBinding.ensureInitialized();
  final bootstrap = AppBootstrap.create();

  runApp(
    MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      home: AppScope(
        bootstrap: bootstrap,
        child: const SplashPage(),
      ),
    ),
  );
}
