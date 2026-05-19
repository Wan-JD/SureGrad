import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:suregrad_mobile/app/app.dart';
import 'package:suregrad_mobile/app/bootstrap/app_bootstrap.dart';

void main() {
  testWidgets('renders SureGrad splash shell', (WidgetTester tester) async {
    await tester.pumpWidget(SureGradApp(bootstrap: AppBootstrap.create()));

    expect(find.text('SureGrad'), findsOneWidget);
    expect(find.byType(FilledButton), findsOneWidget);
    expect(find.byType(OutlinedButton), findsOneWidget);
  });
}
