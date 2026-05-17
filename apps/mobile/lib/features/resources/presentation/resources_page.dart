import 'package:flutter/material.dart';

import '../../../app/navigation/app_tab.dart';
import '../../../core/widgets/app_navigation_scaffold.dart';
import '../../../core/widgets/section_card.dart';

class ResourcesPage extends StatelessWidget {
  const ResourcesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const AppNavigationScaffold(
      currentTab: AppTab.resources,
      title: '资料',
      child: _ResourcesBody(),
    );
  }
}

class _ResourcesBody extends StatelessWidget {
  const _ResourcesBody();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        SectionCard(
          title: '资料模块占位',
          subtitle: '虽然这轮不是必做重点，但底部导航已为“资料”Tab 预留独立入口。',
          children: [
            Text('• 资料分类'),
            SizedBox(height: 6),
            Text('• 学科筛选'),
            SizedBox(height: 6),
            Text('• 阶段筛选'),
            SizedBox(height: 6),
            Text('• 资料详情页后续可补二级路由'),
          ],
        ),
      ],
    );
  }
}
