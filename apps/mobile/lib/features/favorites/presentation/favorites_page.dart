import 'package:flutter/material.dart';

import '../../../app/navigation/app_tab.dart';
import '../../../core/widgets/app_navigation_scaffold.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';

class FavoritesPage extends StatelessWidget {
  const FavoritesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return AppNavigationScaffold(
      currentTab: AppTab.profile,
      title: '我的收藏',
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          SectionCard(
            title: '收藏模块骨架',
            subtitle: '覆盖院校收藏、专业收藏和资料收藏三类对象，和 PRD、API 设计保持一致。',
            children: [
              Text('• 支持按 targetType 分组展示'),
              SizedBox(height: 6),
              Text('• 后续接入 GET /favorites'),
              SizedBox(height: 6),
              Text('• 详情页收藏按钮统一回写到这里'),
            ],
          ),
          EmptyStateCard(
            title: '收藏数据待接入',
            message: '当前仅保留页面结构、空态和后续联调边界，等后端 favorites 模块接通后再补真实列表。',
          ),
        ],
      ),
    );
  }
}
