import 'package:flutter/material.dart';

import 'app/bootstrap/app_bootstrap.dart';
import 'app/theme/app_theme.dart';
import 'features/resources/presentation/resources_page.dart';

/// Web-only entry used by tools/visual-qa to screenshot the guest resources tab.
void main() {
  WidgetsFlutterBinding.ensureInitialized();
  final bootstrap = AppBootstrap.create();

  runApp(
    MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      home: AppScope(
        bootstrap: bootstrap,
        child: const ResourcesPage(),
      ),
    ),
  );
}
