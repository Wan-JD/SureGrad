import 'package:flutter/widgets.dart';

import 'app/app.dart';
import 'app/bootstrap/app_bootstrap.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  final bootstrap = AppBootstrap.create();
  runApp(SureGradApp(bootstrap: bootstrap));
}
