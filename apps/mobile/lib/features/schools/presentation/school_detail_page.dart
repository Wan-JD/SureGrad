import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/login_route_args.dart';
import '../../../app/navigation/school_detail_route_args.dart';
import '../../../core/widgets/section_card.dart';

class SchoolDetailPage extends StatelessWidget {
  const SchoolDetailPage({super.key, required this.args});

  final SchoolDetailRouteArgs args;

  @override
  Widget build(BuildContext context) {
    final sessionStore = AppScope.of(context).sessionStore;

    return Scaffold(
      appBar: AppBar(title: Text(args.schoolName)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const SectionCard(
              title: '院校详情骨架',
              subtitle:
                  '已预留院校基础信息、招生信息、分数线趋势、报录比与复录比、参考书和官方链接模块。',
              children: [
                Text('• 数据缺失位统一展示“待补充”'),
                SizedBox(height: 6),
                Text('• 页面固定展示“以官方最新公告为准”提示'),
              ],
            ),
            const SectionCard(
              title: '当前预览字段',
              children: [
                Text('城市：重庆'),
                SizedBox(height: 6),
                Text('学制 / 学费：骨架占位'),
                SizedBox(height: 6),
                Text('历年分数线：骨架占位'),
                SizedBox(height: 6),
                Text('初试科目：骨架占位'),
              ],
            ),
            SectionCard(
              title: '下一步动作',
              subtitle: sessionStore.isLoggedIn
                  ? '登录态可以直接进入规划页继续主流程。'
                  : '游客点击后会先登录，再继续进入规划页。',
              children: [
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: [
                    OutlinedButton(
                      onPressed: () {
                        if (sessionStore.isLoggedIn) {
                          Navigator.of(context).pushNamed(AppRoutes.favorites);
                          return;
                        }
                        Navigator.of(context).pushNamed(
                          AppRoutes.login,
                          arguments: const LoginRouteArgs(
                            redirectTo: AppRoutes.favorites,
                          ),
                        );
                      },
                      child: const Text('收藏占位'),
                    ),
                    OutlinedButton(
                      onPressed: () {
                        if (sessionStore.isLoggedIn) {
                          Navigator.of(context).pushNamed(AppRoutes.comparison);
                          return;
                        }
                        Navigator.of(context).pushNamed(
                          AppRoutes.login,
                          arguments: const LoginRouteArgs(
                            redirectTo: AppRoutes.comparison,
                          ),
                        );
                      },
                      child: const Text('加入对比'),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: () {
                    if (sessionStore.isLoggedIn) {
                      Navigator.of(context).pushNamed(AppRoutes.planning);
                      return;
                    }
                    Navigator.of(context).pushNamed(
                      AppRoutes.login,
                      arguments: const LoginRouteArgs(
                        redirectTo: AppRoutes.planning,
                      ),
                    );
                  },
                  child: const Text('设为目标并开始规划'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
