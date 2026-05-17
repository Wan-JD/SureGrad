import 'package:flutter/material.dart';

import '../../../app/navigation/app_tab.dart';
import '../../../core/widgets/app_navigation_scaffold.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';

class ComparisonPage extends StatelessWidget {
  const ComparisonPage({super.key});

  @override
  Widget build(BuildContext context) {
    return AppNavigationScaffold(
      currentTab: AppTab.schools,
      title: '专业对比',
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          SectionCard(
            title: '对比模块骨架',
            subtitle: '当前按 program 粒度预留对比分组，和 docs/api-spec.md 中的 comparison-items 约定保持一致。',
            children: [
              Text('• 对比池建议数量 2-4 项'),
              SizedBox(height: 6),
              Text('• 后续接入 GET /comparison-items/result'),
              SizedBox(height: 6),
              Text('• 对比分数线、报录比、复录比、招生人数等维度'),
            ],
          ),
          EmptyStateCard(
            title: '尚未加入对比项',
            message: '院校详情页和专业详情页后续会接入“加入对比”动作，当前页面先作为联调落点。',
          ),
        ],
      ),
    );
  }
}
