import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/app_tab.dart';
import '../../../core/widgets/app_navigation_scaffold.dart';
import '../../../core/widgets/section_card.dart';

class PlanningPage extends StatelessWidget {
  const PlanningPage({super.key});

  @override
  Widget build(BuildContext context) {
    final repository = AppScope.of(context).planningRepository;

    return AppNavigationScaffold(
      currentTab: AppTab.planning,
      title: '规划',
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const SectionCard(
            title: '规划模块骨架',
            subtitle: '覆盖目标设置、学习路线、周计划、日计划与 Todo 入口。',
            children: [
              Text('• 目标院校允许暂时为空'),
              SizedBox(height: 6),
              Text('• 支持通用模板生成学习路线'),
              SizedBox(height: 6),
              Text('• 首次只默认生成当前周与对应日计划'),
            ],
          ),
          const SectionCard(
            title: '当前页面占位',
            children: [
              Text('目标设置卡片'),
              SizedBox(height: 8),
              Text('学习路线卡片'),
              SizedBox(height: 8),
              Text('周计划入口'),
              SizedBox(height: 8),
              Text('日计划入口'),
            ],
          ),
          SectionCard(
            title: '接口预留',
            subtitle: '已和 API 文档里的规划相关接口一一对齐。',
            children: [
              Text('• GET ${repository.currentPlanPath}'),
              const SizedBox(height: 6),
              Text('• POST ${repository.generatePlanPath}'),
              const SizedBox(height: 6),
              Text('• GET ${repository.weeklyPlanPath}'),
              const SizedBox(height: 6),
              Text('• GET ${repository.dailyPlanPath}'),
            ],
          ),
          FilledButton(
            onPressed: () {
              Navigator.of(context).pushNamed(AppRoutes.todo);
            },
            child: const Text('查看今日 Todo'),
          ),
        ],
      ),
    );
  }
}
