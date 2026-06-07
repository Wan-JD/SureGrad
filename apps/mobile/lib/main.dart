import 'package:flutter/foundation.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';

import 'app/app.dart';
import 'app/bootstrap/app_bootstrap.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (kIsWeb) {
    SemanticsBinding.instance.ensureSemantics();
  }
  final bootstrap = AppBootstrap.create();
  await bootstrap.sessionStore.loadFromPrefs();
  runApp(SureGradApp(bootstrap: bootstrap));
}
