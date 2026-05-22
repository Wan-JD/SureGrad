import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../core/layout/responsive_breakpoints.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';
import '../../checkins/data/checkins_models.dart';
import '../data/todo_models.dart';

class TodoPage extends StatefulWidget {
  const TodoPage({super.key});

  @override
  State<TodoPage> createState() => _TodoPageState();
}

class _TodoPageState extends State<TodoPage> {
  final TextEditingController _minutesController = TextEditingController();
  final TextEditingController _reflectionController = TextEditingController();
  String _selectedMoodTag = 'focused';
  bool _submittingCheckin = false;

  @override
  void dispose() {
    _minutesController.dispose();
    _reflectionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bootstrap = AppScope.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Todo')),
      body: SafeArea(
        child: ResponsivePageBody(
          child: AnimatedBuilder(
            animation: bootstrap.refreshStore,
            builder: (context, _) {
              return FutureBuilder<_TodoPageSnapshot>(
                future: _loadPage(bootstrap),
                builder: (context, snapshot) {
                  return ListView(
                    padding: context.contentPadding(),
                    children: [
                    if (snapshot.hasError)
                      EmptyStateCard(
                        title: 'Todo 加载失败',
                        message: _errorMessage(snapshot.error),
                        actionLabel: '重试',
                        onAction: () => setState(() {}),
                      )
                    else if (!snapshot.hasData)
                      const _TodoLoading()
                    else ...[
                      SectionCard(
                        title: '今日总览',
                        subtitle: snapshot.data!.todos.summary.date,
                        children: [
                          ResponsiveColumns(
                            children: [
                              _TodoStatTile(
                                label: '全部',
                                value:
                                    '${snapshot.data!.todos.summary.totalCount}',
                              ),
                              _TodoStatTile(
                                label: '待完成',
                                value:
                                    '${snapshot.data!.todos.summary.pendingCount}',
                              ),
                              _TodoStatTile(
                                label: '已完成',
                                value:
                                    '${snapshot.data!.todos.summary.completedCount}',
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      _CheckinCard(
                        todayCheckin: snapshot.data!.todayCheckin,
                        overview: snapshot.data!.overview,
                        onCheckin: _submittingCheckin
                            ? null
                            : _openCheckinSheet,
                      ),
                      const SizedBox(height: 16),
                      SectionCard(
                        title: '执行概览',
                        subtitle: '把今日打卡、本周投入和当前目标放在一起看，方便你决定下一步。',
                        children: [
                          _SummaryRow(
                            label: '本周学习时长',
                            value:
                                '${snapshot.data!.overview.weekStudyMinutes} 分钟',
                          ),
                          _SummaryRow(
                            label: '连续打卡',
                            value:
                                '${snapshot.data!.overview.continuousCheckinDays} 天',
                          ),
                          _SummaryRow(
                            label: 'Todo 完成率',
                            value:
                                '${(snapshot.data!.overview.todoCompletionRate * 100).toStringAsFixed(0)}%',
                          ),
                          _SummaryRow(
                            label: '当前目标',
                            value:
                                snapshot.data!.overview.currentTargetName ??
                                '尚未设置',
                          ),
                          _SummaryRow(
                            label: '当前计划',
                            value:
                                snapshot.data!.overview.currentPlanTitle ??
                                '尚未生成',
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SectionCard(
                        title: '任务列表',
                        subtitle: '完成任务后，可以直接回到上方完成打卡和简短复盘。',
                        children: snapshot.data!.todos.items.isEmpty
                            ? const [Text('今天还没有 Todo。')]
                            : snapshot.data!.todos.items
                                  .map(
                                    (item) => Padding(
                                      padding: const EdgeInsets.only(
                                        bottom: 10,
                                      ),
                                      child: _TodoItemCard(
                                        item: item,
                                        onComplete: item.isCompleted
                                            ? null
                                            : () => _complete(item.id),
                                      ),
                                    ),
                                  )
                                  .toList(),
                      ),
                    ],
                  ],
                );
                },
              );
            },
          ),
        ),
      ),
    );
  }

  Future<_TodoPageSnapshot> _loadPage(AppBootstrap bootstrap) async {
    final todos = await bootstrap.todoRepository.fetchToday();
    final todayCheckin = await bootstrap.checkinsRepository.fetchTodayCheckin();
    final overview = await bootstrap.checkinsRepository.fetchOverview();
    return _TodoPageSnapshot(
      todos: todos,
      todayCheckin: todayCheckin,
      overview: overview,
    );
  }

  Future<void> _complete(String todoItemId) async {
    try {
      await AppScope.of(context).todoRepository.completeTodo(todoItemId);
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
    }
  }

  Future<void> _openCheckinSheet() async {
    _minutesController.text = '90';
    _reflectionController.clear();
    _selectedMoodTag = 'focused';

    final submitted = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: 16,
            bottom: MediaQuery.of(context).viewInsets.bottom + 16,
          ),
          child: StatefulBuilder(
            builder: (context, setModalState) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('完成今日打卡', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _minutesController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: '今日学习时长（分钟）'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: _selectedMoodTag,
                    decoration: const InputDecoration(labelText: '今日状态'),
                    items: const [
                      DropdownMenuItem(value: 'focused', child: Text('专注')),
                      DropdownMenuItem(value: 'steady', child: Text('稳定')),
                      DropdownMenuItem(value: 'tired', child: Text('有点累')),
                    ],
                    onChanged: (value) {
                      if (value == null) {
                        return;
                      }
                      setModalState(() {
                        _selectedMoodTag = value;
                      });
                    },
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _reflectionController,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      labelText: '复盘',
                      hintText: '记录今天做得好的地方，或明天要补的一步。',
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: () {
                        final minutes = int.tryParse(
                          _minutesController.text.trim(),
                        );
                        if (minutes == null || minutes <= 0) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('请输入有效的学习时长。')),
                          );
                          return;
                        }
                        Navigator.of(context).pop(true);
                      },
                      child: const Text('提交打卡'),
                    ),
                  ),
                ],
              );
            },
          ),
        );
      },
    );

    if (!mounted || submitted != true) {
      return;
    }

    setState(() {
      _submittingCheckin = true;
    });

    try {
      final result = await AppScope.of(context).checkinsRepository
          .createCheckin(
            totalStudyMinutes: int.parse(_minutesController.text.trim()),
            reflection: _reflectionController.text,
            moodTag: _selectedMoodTag,
          );
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            '已完成今日打卡，连续 ${result.continuousDays} 天，今日累计 ${result.todayStudyMinutes} 分钟。',
          ),
        ),
      );
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
          _submittingCheckin = false;
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

class _TodoPageSnapshot {
  const _TodoPageSnapshot({
    required this.todos,
    required this.todayCheckin,
    required this.overview,
  });

  final TodoSnapshot todos;
  final TodayCheckinSnapshot todayCheckin;
  final StudyStatsOverview overview;
}

class _CheckinCard extends StatelessWidget {
  const _CheckinCard({
    required this.todayCheckin,
    required this.overview,
    required this.onCheckin,
  });

  final TodayCheckinSnapshot todayCheckin;
  final StudyStatsOverview overview;
  final VoidCallback? onCheckin;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: todayCheckin.isCheckedIn ? '今日打卡已完成' : '今日打卡',
      subtitle: todayCheckin.isCheckedIn
          ? '继续保持节奏，顺手看一眼今天的复盘和连续天数。'
          : '完成今日任务后，记得补上学习时长和简短复盘。',
      children: [
        _SummaryRow(
          label: '今日已完成 Todo',
          value: '${todayCheckin.completedTodoCount}',
        ),
        _SummaryRow(
          label: '今日待完成 Todo',
          value: '${overview.todayPendingTodoCount}',
        ),
        _SummaryRow(
          label: '今日学习时长',
          value: todayCheckin.totalStudyMinutes == null
              ? '待填写'
              : '${todayCheckin.totalStudyMinutes} 分钟',
        ),
        _SummaryRow(
          label: '连续打卡',
          value: '${overview.continuousCheckinDays} 天',
        ),
        if ((todayCheckin.reflection ?? '').trim().isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text('复盘：${todayCheckin.reflection}'),
          ),
        if (!todayCheckin.isCheckedIn) ...[
          const SizedBox(height: 12),
          FilledButton(onPressed: onCheckin, child: const Text('完成今日打卡')),
        ],
      ],
    );
  }
}

class _TodoStatTile extends StatelessWidget {
  const _TodoStatTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFFCFAF5),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE5DECF)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 8),
            Text(value, style: Theme.of(context).textTheme.titleMedium),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.label, required this.value});

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

class _TodoItemCard extends StatelessWidget {
  const _TodoItemCard({required this.item, required this.onComplete});

  final TodoItem item;
  final VoidCallback? onComplete;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE6DDCE)),
      ),
      child: ListTile(
        leading: Icon(
          item.isCompleted
              ? Icons.check_circle_rounded
              : Icons.radio_button_unchecked,
        ),
        title: Text(item.title),
        subtitle: Text(
          '${item.subjectName ?? '未分配科目'} / ${item.priority ?? '-'} / ${item.expectedMinutes ?? 0} 分钟',
        ),
        trailing: item.isCompleted
            ? const Text('已完成')
            : FilledButton(onPressed: onComplete, child: const Text('完成')),
      ),
    );
  }
}

class _TodoLoading extends StatelessWidget {
  const _TodoLoading();

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
