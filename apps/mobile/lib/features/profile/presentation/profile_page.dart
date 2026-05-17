import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/app_tab.dart';
import '../../../core/widgets/app_navigation_scaffold.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final bootstrap = AppScope.of(context);
    final sessionStore = bootstrap.sessionStore;
    final repository = bootstrap.profileRepository;

    return AppNavigationScaffold(
      currentTab: AppTab.profile,
      title: '我的',
      child: AnimatedBuilder(
        animation: sessionStore,
        builder: (context, _) {
          if (!sessionStore.isLoggedIn) {
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                EmptyStateCard(
                  title: '未登录',
                  message:
                      '个人中心已预留未登录态。登录后这里会承载基础信息、目标院校、计划、收藏和提醒入口。',
                  actionLabel: '去登录',
                  onAction: () {
                    Navigator.of(context).pushNamed(AppRoutes.login);
                  },
                ),
                SectionCard(
                  title: '接口预留',
                  children: [
                    Text('• GET ${repository.mePath}'),
                    const SizedBox(height: 6),
                    Text('• GET ${repository.currentTargetPath}'),
                  ],
                ),
              ],
            );
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              SectionCard(
                title: '账号信息',
                children: [
                  Text('登录手机号：${sessionStore.phoneNumber ?? '未记录'}'),
                  const SizedBox(height: 6),
                  const Text('身份：备考用户（骨架占位）'),
                  const SizedBox(height: 6),
                  const Text('目标院校：待接后端用户目标'),
                ],
              ),
              SectionCard(
                title: '我的入口',
                children: [
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('我的收藏'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      Navigator.of(context).pushNamed(AppRoutes.favorites);
                    },
                  ),
                  const Divider(),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('专业对比'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      Navigator.of(context).pushNamed(AppRoutes.comparison);
                    },
                  ),
                  const Divider(),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('提醒中心'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      Navigator.of(context).pushNamed(AppRoutes.reminders);
                    },
                  ),
                ],
              ),
              OutlinedButton(
                onPressed: () {
                  sessionStore.signOut();
                  Navigator.of(
                    context,
                  ).pushNamedAndRemoveUntil(AppRoutes.splash, (_) => false);
                },
                child: const Text('退出登录'),
              ),
            ],
          );
        },
      ),
    );
  }
}
