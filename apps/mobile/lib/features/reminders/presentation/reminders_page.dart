import 'package:flutter/material.dart';

import '../../../app/navigation/app_tab.dart';
import '../../../core/widgets/app_navigation_scaffold.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';

class RemindersPage extends StatelessWidget {
  const RemindersPage({super.key});

  @override
  Widget build(BuildContext context) {
    return AppNavigationScaffold(
      currentTab: AppTab.profile,
      title: '提醒中心',
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          SectionCard(
            title: '提醒模块骨架',
            subtitle: '预留关键时间节点提醒、自定义提醒和计划提醒的统一入口。',
            children: [
              Text('• 后续接入 GET /reminders'),
              SizedBox(height: 6),
              Text('• 支持系统默认提醒与用户自定义提醒'),
              SizedBox(height: 6),
              Text('• Android 侧后续再接本地通知或推送能力'),
            ],
          ),
          EmptyStateCard(
            title: '提醒尚未配置',
            message: '当前页面先固定提醒中心入口，方便后续把 PRD 中的关键节点提醒闭环补齐。',
          ),
        ],
      ),
    );
  }
}
