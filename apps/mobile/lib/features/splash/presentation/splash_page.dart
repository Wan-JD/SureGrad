import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../core/widgets/section_card.dart';

class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) {
    final sessionStore = AppScope.of(context).sessionStore;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Spacer(),
              Text('SureGrad', style: Theme.of(context).textTheme.displaySmall),
              const SizedBox(height: 12),
              Text(
                'Android-first Flutter 骨架，围绕“择校 -> 目标 -> 计划 -> Todo”主链路搭建。',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 24),
              const SectionCard(
                title: '当前阶段',
                subtitle: '已搭好路由、页面骨架、状态管理预留和 API 结构预留。',
                children: [
                  Text('• 游客默认进入择校体验'),
                  SizedBox(height: 6),
                  Text('• 登录后进入完整规划和 Todo 流程'),
                  SizedBox(height: 6),
                  Text('• 详情、规划、Todo 页面均已预留后续联调入口'),
                ],
              ),
              const Spacer(),
              FilledButton(
                onPressed: () {
                  if (sessionStore.isLoggedIn) {
                    Navigator.of(context).pushReplacementNamed(AppRoutes.home);
                    return;
                  }
                  Navigator.of(context).pushReplacementNamed(AppRoutes.login);
                },
                child: Text(sessionStore.isLoggedIn ? '进入首页' : '手机号登录'),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () {
                  Navigator.of(context).pushReplacementNamed(AppRoutes.schools);
                },
                child: const Text('游客继续择校'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
