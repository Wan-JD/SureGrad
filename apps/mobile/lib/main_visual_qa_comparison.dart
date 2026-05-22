import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import 'app/bootstrap/app_bootstrap.dart';
import 'app/theme/app_theme.dart';
import 'features/comparison/presentation/comparison_page.dart';

/// Web-only entry used by tools/visual-qa to screenshot the comparison surface.
void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SemanticsBinding.instance.ensureSemantics();
  final bootstrap = AppBootstrap.create();

  runApp(
    MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      home: AppScope(
        bootstrap: bootstrap,
        child: const ComparisonPage(),
      ),
    ),
  );
}
