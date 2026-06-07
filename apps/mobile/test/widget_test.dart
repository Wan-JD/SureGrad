import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:suregrad_mobile/app/app.dart';
import 'package:suregrad_mobile/app/bootstrap/app_bootstrap.dart';
import 'package:suregrad_mobile/app/navigation/app_router.dart';
import 'package:suregrad_mobile/app/navigation/app_routes.dart';
import 'package:suregrad_mobile/features/splash/presentation/splash_page.dart';

void main() {
  testWidgets('guest cold start lands on onboarding', (
    WidgetTester tester,
  ) async {
    final bootstrap = AppBootstrap.create();
    expect(AppRouter(bootstrap).initialRoute, AppRoutes.onboarding);

    await tester.pumpWidget(SureGradApp(bootstrap: bootstrap));
    await tester.pump();

    expect(find.text('择校不再盲选'), findsOneWidget);
    expect(find.text('跳过'), findsOneWidget);
  });

  testWidgets('splash offers browse schools before login for guests', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: AppScope(
          bootstrap: AppBootstrap.create(),
          child: const SplashPage(),
        ),
      ),
    );

    expect(find.text('先逛院校'), findsOneWidget);
    expect(find.text('手机号登录'), findsOneWidget);
    expect(find.byType(FilledButton), findsOneWidget);
    expect(find.byType(OutlinedButton), findsOneWidget);
  });
}
