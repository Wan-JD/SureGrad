import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/app_tab.dart';
import '../../../app/navigation/school_detail_route_args.dart';
import '../../../core/widgets/app_navigation_scaffold.dart';
import '../../../core/widgets/section_card.dart';

class SchoolListPage extends StatelessWidget {
  const SchoolListPage({super.key});

  @override
  Widget build(BuildContext context) {
    final repository = AppScope.of(context).schoolsRepository;

    return AppNavigationScaffold(
      currentTab: AppTab.schools,
      title: '择校',
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const SectionCard(
            title: '搜索与筛选骨架',
            subtitle: '已按文档预留地区、层次、专业门类、学硕/专硕、是否考数学、备考年份等筛选位。',
            children: [
              TextField(
                readOnly: true,
                decoration: InputDecoration(
                  hintText: '搜索学校 / 院系 / 专业关键词',
                  prefixIcon: Icon(Icons.search),
                ),
              ),
            ],
          ),
          _SchoolPreviewCard(
            title: '西南大学 · 计算机与信息科学学院',
            summary: '城市：重庆 · 近年分数线与报录比预留趋势位',
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
          const SizedBox(height: 12),
          _SchoolPreviewCard(
            title: '华南师范大学 · 人工智能学院',
            summary: '城市：广州 · 收藏、对比、目标设定入口待接后端',
            onTap: null,
          ),
          const SizedBox(height: 12),
          SectionCard(
            title: '接口预留',
            subtitle: '当前页面会围绕 API 设计文档中的择校接口接入。',
            children: [
              Text('• GET ${repository.listPath}'),
              const SizedBox(height: 6),
              Text('• GET ${repository.detailPathPattern}'),
              const SizedBox(height: 6),
              Text('• GET ${repository.programsPathPattern}'),
            ],
          ),
        ],
      ),
    );
  }
}

class _SchoolPreviewCard extends StatelessWidget {
  const _SchoolPreviewCard({
    required this.title,
    required this.summary,
    required this.onTap,
  });

  final String title;
  final String summary;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(summary),
            const SizedBox(height: 16),
            FilledButton.tonal(onPressed: onTap, child: const Text('查看详情')),
          ],
        ),
      ),
    );
  }
}
