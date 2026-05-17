import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/app_tab.dart';
import '../../../app/navigation/school_detail_route_args.dart';
import '../../../core/widgets/app_navigation_scaffold.dart';
import '../../../core/widgets/empty_state_card.dart';
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
            title: '今日概览',
            subtitle: sessionStore.isLoggedIn
                ? '已进入登录态骨架，可继续走规划和 Todo 主流程。'
                : '当前为游客模式，优先引导择校与资料浏览。',
            children: [
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  Chip(label: Text(sessionStore.isLoggedIn ? '已登录' : '游客体验')),
                  const Chip(label: Text('Android MVP')),
                  const Chip(label: Text('Flutter Skeleton')),
                ],
              ),
            ],
          ),
          SectionCard(
            title: '主流程入口',
            subtitle: '与 PRD 的“今日待办 -> Todo -> 打卡”路径保持一致。',
            children: [
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('查看今日 Todo'),
                subtitle: const Text('未登录时会自动跳转登录页并回到 Todo。'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.of(context).pushNamed(AppRoutes.todo);
                },
              ),
              const Divider(),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('继续择校'),
                subtitle: const Text('从首页回到院校详情，保持核心闭环。'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.of(context).pushNamed(
                    AppRoutes.schoolDetail,
                    arguments: const SchoolDetailRouteArgs(
                      schoolId: 'swu-cs',
                      schoolName: '西南大学 计算机与信息科学学院',
                    ),
                  );
                },
              ),
            ],
          ),
          const EmptyStateCard(
            title: '首页数据暂未接后台',
            message:
                '倒计时、学习概览、本周进度和推荐资料入口目前都是骨架位，后续可接 /study-stats/overview 与首页聚合数据。',
          ),
        ],
      ),
    );
  }
}
