import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import 'app/bootstrap/app_bootstrap.dart';
import 'app/navigation/program_detail_route_args.dart';
import 'app/theme/app_theme.dart';
import 'features/programs/presentation/program_detail_page.dart';

/// Web-only entry used by tools/visual-qa to screenshot program detail.
void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SemanticsBinding.instance.ensureSemantics();
  final bootstrap = AppBootstrap.create();
  const programId = String.fromEnvironment(
    'SUREGRAD_PROGRAM_ID',
    defaultValue: '',
  );

  runApp(
    MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      home: AppScope(
        bootstrap: bootstrap,
        child: ProgramDetailPage(
          args: ProgramDetailRouteArgs(
            programId: programId.isEmpty ? 'program-unavailable' : programId,
            programName: '专业详情',
          ),
        ),
      ),
    ),
  );
}
