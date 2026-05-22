import 'package:flutter/material.dart';

import '../../app/bootstrap/app_bootstrap.dart';
import '../../app/navigation/app_routes.dart';
import '../../app/navigation/app_tab.dart';
import '../../app/navigation/login_route_args.dart';
import '../layout/responsive_breakpoints.dart';

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

  void _navigateToTab(BuildContext context, AppTab target) {
    if (target == currentTab) {
      return;
    }

    final sessionStore = AppScope.of(context).sessionStore;
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
  }

  @override
  Widget build(BuildContext context) {
    final useRail = context.useNavigationRail;

    final content = useRail
        ? ResponsivePageBody(child: child)
        : child;

    final body = useRail
        ? Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              NavigationRail(
                selectedIndex: currentTab.index,
                onDestinationSelected: (index) {
                  _navigateToTab(context, AppTab.values[index]);
                },
                labelType: NavigationRailLabelType.all,
                destinations: AppTab.values
                    .map(
                      (tab) => NavigationRailDestination(
                        icon: Icon(tab.icon),
                        label: Text(tab.label),
                      ),
                    )
                    .toList(),
              ),
              const VerticalDivider(width: 1, thickness: 1),
              Expanded(child: content),
            ],
          )
        : SafeArea(child: content);

    return Scaffold(
      appBar: AppBar(title: Text(title), actions: actions),
      body: body,
      bottomNavigationBar: useRail
          ? null
          : NavigationBar(
              selectedIndex: currentTab.index,
              onDestinationSelected: (index) {
                _navigateToTab(context, AppTab.values[index]);
              },
              destinations: AppTab.values
                  .map(
                    (tab) => NavigationDestination(
                      icon: Icon(tab.icon),
                      label: tab.label,
                    ),
                  )
                  .toList(),
            ),
    );
  }
}
