import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';
import '../data/todo_models.dart';

class TodoPage extends StatefulWidget {
  const TodoPage({super.key});

  @override
  State<TodoPage> createState() => _TodoPageState();
}

class _TodoPageState extends State<TodoPage> {
  @override
  Widget build(BuildContext context) {
    final bootstrap = AppScope.of(context);
    final repository = bootstrap.todoRepository;

    return Scaffold(
      appBar: AppBar(title: const Text('Todo')),
      body: SafeArea(
        child: AnimatedBuilder(
          animation: bootstrap.refreshStore,
          builder: (context, _) {
            return FutureBuilder<TodoSnapshot>(
              future: repository.fetchToday(),
              builder: (context, snapshot) {
                return ListView(
                  padding: const EdgeInsets.all(16),
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
                        subtitle: snapshot.data!.summary.date,
                        children: [
                          _SummaryRow(
                            label: '全部',
                            value: '${snapshot.data!.summary.totalCount}',
                          ),
                          _SummaryRow(
                            label: '待完成',
                            value: '${snapshot.data!.summary.pendingCount}',
                          ),
                          _SummaryRow(
                            label: '已完成',
                            value: '${snapshot.data!.summary.completedCount}',
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SectionCard(
                        title: '任务列表',
                        subtitle: '现在直接消费 /todo-items 和 complete 接口。',
                        children: snapshot.data!.items.isEmpty
                            ? const [Text('今天还没有 Todo。')]
                            : snapshot.data!.items
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

  String _errorMessage(Object? error) {
    if (error is FeatureUnavailableException) {
      return '${error.message}\n${error.nextSteps.join('\n')}';
    }
    return '$error';
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
