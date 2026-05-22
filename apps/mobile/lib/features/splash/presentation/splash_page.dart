import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/login_route_args.dart';
import '../../../core/widgets/section_card.dart';

class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) {
    final sessionStore = AppScope.of(context).sessionStore;
    final isLoggedIn = sessionStore.isLoggedIn;

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
                isLoggedIn
                    ? '欢迎回来。从今日任务继续，或回到择校查看院校与专业。'
                    : '无需登录即可先逛院校与专业；需要收藏、对比或生成计划时再登录。',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 24),
              SectionCard(
                title: '进入方式',
                subtitle: isLoggedIn
                    ? '已登录，可进入首页或继续浏览择校内容。'
                    : '游客默认进入择校 Tab；登录后会回到你刚才的操作页面。',
                children: [
                  Text(
                    isLoggedIn
                        ? '首页展示今日待办、学习概览与目标院校入口。'
                        : '先逛院校：搜索筛选、查看详情与官方链接。',
                  ),
                  const SizedBox(height: 6),
                  Text(
                    isLoggedIn
                        ? '择校 Tab 可继续检索、收藏与对比院校专业。'
                        : '登录：收藏、对比、设目标、规划与 Todo 等能力需登录后使用。',
                  ),
                ],
              ),
              const Spacer(),
              if (isLoggedIn) ...[
                FilledButton(
                  onPressed: () {
                    Navigator.of(context).pushReplacementNamed(AppRoutes.home);
                  },
                  child: const Text('进入首页'),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () {
                    Navigator.of(context).pushReplacementNamed(AppRoutes.schools);
                  },
                  child: const Text('去择校'),
                ),
              ] else ...[
                FilledButton(
                  onPressed: () {
                    Navigator.of(context).pushReplacementNamed(AppRoutes.schools);
                  },
                  child: const Text('先逛院校'),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () {
                    Navigator.of(context).pushReplacementNamed(
                      AppRoutes.login,
                      arguments: const LoginRouteArgs(
                        redirectTo: AppRoutes.schools,
                      ),
                    );
                  },
                  child: const Text('手机号登录'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
