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
                '从院校筛选开始，逐步确认目标院校与专业，再继续进入规划和今日任务。',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 24),
              const SectionCard(
                title: '进入方式',
                subtitle: '当前版本已经连通择校、目标设置、规划与 Todo 的主流程入口。',
                children: [
                  Text('游客模式可以先浏览院校和专业信息。'),
                  SizedBox(height: 6),
                  Text('登录后会继续同步目标、规划和执行进度。'),
                  SizedBox(height: 6),
                  Text('资料页可随时查看备考参考内容，补全你的下一步动作。'),
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
                child: const Text('先看院校'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
