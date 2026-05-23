import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import 'app/bootstrap/app_bootstrap.dart';
import 'app/navigation/resource_detail_route_args.dart';
import 'app/theme/app_theme.dart';
import 'features/resources/presentation/resource_detail_page.dart';

/// Web-only entry used by tools/visual-qa to screenshot resource detail.
void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SemanticsBinding.instance.ensureSemantics();
  final bootstrap = AppBootstrap.create();
  const resourceId = String.fromEnvironment(
    'SUREGRAD_RESOURCE_ID',
    defaultValue: '',
  );

  runApp(
    MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      home: AppScope(
        bootstrap: bootstrap,
        child: ResourceDetailPage(
          args: ResourceDetailRouteArgs(
            resourceId: resourceId.isEmpty ? 'resource-unavailable' : resourceId,
            resourceTitle: '资料详情',
          ),
        ),
      ),
    ),
  );
}
