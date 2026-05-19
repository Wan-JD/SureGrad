import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/app_tab.dart';
import '../../../core/widgets/app_navigation_scaffold.dart';
import '../../../core/widgets/section_card.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final sessionStore = AppScope.of(context).sessionStore;

    return AppNavigationScaffold(
      currentTab: AppTab.home,
      title: '首页',
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SectionCard(
            title: '当前状态',
            subtitle: sessionStore.isLoggedIn
                ? '已登录，可以继续走目标 -> 规划 -> Todo 主链路。'
                : '当前是游客模式，可以先浏览院校与资料。',
            children: [
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  Chip(label: Text(sessionStore.isLoggedIn ? '已登录' : '游客')),
                  const Chip(label: Text('Real API Wired')),
                ],
              ),
            ],
          ),
          SectionCard(
            title: '主入口',
            children: [
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('继续择校'),
                subtitle: const Text('进入真实 /schools 列表，而不是跳转到假详情页。'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.of(context).pushNamed(AppRoutes.schools);
                },
              ),
              const Divider(),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('查看今日 Todo'),
                subtitle: const Text('未登录时会自动跳去登录页，然后回到 Todo。'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.of(context).pushNamed(AppRoutes.todo);
                },
              ),
              const Divider(),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('打开规划页'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.of(context).pushNamed(AppRoutes.planning);
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
