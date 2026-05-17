import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../core/widgets/section_card.dart';

class TodoPage extends StatelessWidget {
  const TodoPage({super.key});

  @override
  Widget build(BuildContext context) {
    final repository = AppScope.of(context).todoRepository;

    return Scaffold(
      appBar: AppBar(title: const Text('Todo')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const SectionCard(
              title: 'Todo 页面骨架',
              subtitle: '支持独立创建 Todo，也支持后续由周计划 / 日计划自动生成。',
              children: [
                _TodoItem(title: '整理目标院校信息', meta: '择校 · 高优先级'),
                SizedBox(height: 10),
                _TodoItem(title: '确认备考年份与每日时长', meta: '规划 · 中优先级'),
                SizedBox(height: 10),
                _TodoItem(title: '生成本周学习路线占位', meta: '规划 · 自动生成预留'),
              ],
            ),
            SectionCard(
              title: '接口预留',
              children: [
                Text('• GET ${repository.listPath}'),
                const SizedBox(height: 6),
                Text('• POST ${repository.listPath}'),
                const SizedBox(height: 6),
                Text('• POST ${repository.completePathPattern}'),
              ],
            ),
            const SectionCard(
              title: '后续扩展',
              children: [
                Text('• 日期筛选'),
                SizedBox(height: 6),
                Text('• 科目筛选'),
                SizedBox(height: 6),
                Text('• 完成后联动首页与打卡数据'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _TodoItem extends StatelessWidget {
  const _TodoItem({required this.title, required this.meta});

  final String title;
  final String meta;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: ListTile(
        leading: const Icon(Icons.radio_button_unchecked),
        title: Text(title),
        subtitle: Text(meta),
      ),
    );
  }
}
