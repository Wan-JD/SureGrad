import 'package:flutter/material.dart';

import '../../app/bootstrap/app_bootstrap.dart';
import '../../app/navigation/app_routes.dart';
import '../../app/navigation/app_tab.dart';
import '../../app/navigation/login_route_args.dart';

class AppNavigationScaffold extends StatelessWidget {
  const AppNavigationScaffold({
    super.key,
    required this.currentTab,
    required this.title,
    required this.child,
    this.actions,
  });

  final AppTab currentTab;
  final String title;
  final Widget child;
  final List<Widget>? actions;

  @override
  Widget build(BuildContext context) {
    final sessionStore = AppScope.of(context).sessionStore;

    return Scaffold(
      appBar: AppBar(title: Text(title), actions: actions),
      body: SafeArea(child: child),
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentTab.index,
        onDestinationSelected: (index) {
          final target = AppTab.values[index];
          if (target == currentTab) {
            return;
          }

          final targetRoute = AppRoutes.fromTab(target);
          final protectedTab = target == AppTab.planning;

          if (protectedTab && !sessionStore.isLoggedIn) {
            Navigator.of(context).pushReplacementNamed(
              AppRoutes.login,
              arguments: const LoginRouteArgs(redirectTo: AppRoutes.planning),
            );
            return;
          }

          Navigator.of(context).pushReplacementNamed(targetRoute);
        },
        destinations: AppTab.values
            .map(
              (tab) =>
                  NavigationDestination(icon: Icon(tab.icon), label: tab.label),
            )
            .toList(),
      ),
    );
  }
}
