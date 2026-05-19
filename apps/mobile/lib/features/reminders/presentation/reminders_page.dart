import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_tab.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/widgets/app_navigation_scaffold.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';
import '../data/reminder_models.dart';

class RemindersPage extends StatefulWidget {
  const RemindersPage({super.key});

  @override
  State<RemindersPage> createState() => _RemindersPageState();
}

class _RemindersPageState extends State<RemindersPage> {
  final Set<String> _updatingIds = <String>{};

  @override
  Widget build(BuildContext context) {
    final repository = AppScope.of(context).remindersRepository;

    return AppNavigationScaffold(
      currentTab: AppTab.profile,
      title: '提醒中心',
      child: FutureBuilder<List<ReminderItem>>(
        future: repository.fetchReminders(),
        builder: (context, snapshot) {
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (snapshot.hasError)
                EmptyStateCard(
                  title: '提醒中心不可用',
                  message: _errorMessage(snapshot.error),
                  actionLabel: '重试',
                  onAction: () => setState(() {}),
                )
              else if (!snapshot.hasData)
                const _PageLoading()
              else if (snapshot.data!.isEmpty)
                const EmptyStateCard(
                  title: '还没有提醒项',
                  message: '接口已经接通，但当前账号还没有返回提醒数据。',
                )
              else ...[
                const SectionCard(
                  title: '提醒策略',
                  subtitle: '先把最常用的提醒开关做成可操作状态，后续再补自定义提醒创建。',
                  children: [Text('关闭后不会删除提醒，只会暂停当前提醒触达。')],
                ),
                const SizedBox(height: 16),
                ...snapshot.data!.map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _ReminderCard(
                      item: item,
                      updating: _updatingIds.contains(item.id),
                      onChanged: (value) => _toggleReminder(item, value),
                    ),
                  ),
                ),
              ],
            ],
          );
        },
      ),
    );
  }

  Future<void> _toggleReminder(ReminderItem item, bool enabled) async {
    setState(() {
      _updatingIds.add(item.id);
    });

    try {
      await AppScope.of(
        context,
      ).remindersRepository.updateReminder(item.id, enabled);
      if (!mounted) {
        return;
      }
      setState(() {});
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(_errorMessage(error))));
    } finally {
      if (mounted) {
        setState(() {
          _updatingIds.remove(item.id);
        });
      }
    }
  }

  String _errorMessage(Object? error) {
    if (error is FeatureUnavailableException) {
      return '${error.message}\n${error.nextSteps.join('\n')}';
    }
    return '$error';
  }
}

class _ReminderCard extends StatelessWidget {
  const _ReminderCard({
    required this.item,
    required this.updating,
    required this.onChanged,
  });

  final ReminderItem item;
  final bool updating;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: item.title,
      subtitle: _typeLabel(item.reminderType),
      children: [
        if (item.content.trim().isNotEmpty) Text(item.content),
        if (item.content.trim().isNotEmpty) const SizedBox(height: 12),
        _ReminderMetaRow(label: '提醒时间', value: _formatRemindAt(item.remindAt)),
        _ReminderMetaRow(
          label: '来源',
          value: item.isSystemDefault ? '系统默认' : '用户配置',
        ),
        const SizedBox(height: 8),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(item.isEnabled ? '已开启' : '已关闭'),
          subtitle: Text(updating ? '正在更新提醒状态…' : '切换后会立即同步到服务端。'),
          value: item.isEnabled,
          onChanged: updating ? null : onChanged,
        ),
      ],
    );
  }

  String _typeLabel(String? value) {
    switch (value) {
      case 'study':
        return '学习提醒';
      case 'todo':
        return 'Todo 提醒';
      case 'exam_node':
        return '考试节点';
      case 'system':
        return '系统提醒';
      default:
        return '提醒项';
    }
  }

  String _formatRemindAt(String? value) {
    if (value == null || value.isEmpty) {
      return '未设置';
    }
    return value.replaceFirst('T', ' ').replaceFirst('.000Z', '');
  }
}

class _ReminderMetaRow extends StatelessWidget {
  const _ReminderMetaRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(child: Text(label)),
          Text(value),
        ],
      ),
    );
  }
}

class _PageLoading extends StatelessWidget {
  const _PageLoading();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 220,
      decoration: BoxDecoration(
        color: const Color(0xFFEDE7DB),
        borderRadius: BorderRadius.circular(24),
      ),
    );
  }
}
