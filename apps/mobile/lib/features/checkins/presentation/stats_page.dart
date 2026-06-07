import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../core/layout/responsive_breakpoints.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';
import '../../checkins/data/checkins_models.dart';

class StatsPage extends StatefulWidget {
  const StatsPage({super.key});

  @override
  State<StatsPage> createState() => _StatsPageState();
}

class _StatsPageState extends State<StatsPage> {
  String _range = 'week';

  @override
  Widget build(BuildContext context) {
    final bootstrap = AppScope.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('学习统计')),
      body: SafeArea(
        child: ResponsivePageBody(
          child: AnimatedBuilder(
            animation: bootstrap.refreshStore,
            builder: (context, _) {
              return FutureBuilder<StudyStatsOverview>(
                future: bootstrap.checkinsRepository.fetchOverview(range: _range),
                builder: (context, snapshot) {
                  return ListView(
                    padding: context.contentPadding(),
                    children: [
                      SectionCard(
                        title: '时间范围',
                        children: [
                          Wrap(
                            spacing: 8,
                            children: [
                              ChoiceChip(
                                label: const Text('今日'),
                                selected: _range == 'today',
                                onSelected: (_) => setState(() => _range = 'today'),
                              ),
                              ChoiceChip(
                                label: const Text('本周'),
                                selected: _range == 'week',
                                onSelected: (_) => setState(() => _range = 'week'),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      if (snapshot.hasError)
                        EmptyStateCard(
                          title: '统计加载失败',
                          message: _errorMessage(snapshot.error),
                          actionLabel: '重试',
                          onAction: () => setState(() {}),
                        )
                      else if (!snapshot.hasData)
                        Container(
                          height: 200,
                          decoration: BoxDecoration(
                            color: const Color(0xFFEDE7DB),
                            borderRadius: BorderRadius.circular(28),
                          ),
                        )
                      else ...[
                        _StatsHero(overview: snapshot.data!),
                        const SizedBox(height: 16),
                        SectionCard(
                          title: '学习数据',
                          children: [
                            _StatRow(label: '今日学习时长', value: '${snapshot.data!.todayStudyMinutes} 分钟'),
                            _StatRow(label: '本周学习时长', value: '${snapshot.data!.weekStudyMinutes} 分钟'),
                            _StatRow(label: '连续打卡', value: '${snapshot.data!.continuousCheckinDays} 天'),
                            _StatRow(
                              label: 'Todo 完成率',
                              value: '${(snapshot.data!.todoCompletionRate * 100).toStringAsFixed(0)}%',
                            ),
                            _StatRow(label: '今日待完成', value: '${snapshot.data!.todayPendingTodoCount} 项'),
                          ],
                        ),
                        if (snapshot.data!.subjectDistribution.isNotEmpty) ...[
                          const SizedBox(height: 16),
                          SectionCard(
                            title: '科目分布',
                            subtitle: '按学习时长占比排列。',
                            children: snapshot.data!.subjectDistribution.map((item) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: Row(
                                  children: [
                                    Expanded(child: Text(item.subjectName ?? '未分配')),
                                    Text('${item.studyMinutes} 分钟'),
                                    const SizedBox(width: 8),
                                    Text(
                                      '${(item.ratio * 100).toStringAsFixed(0)}%',
                                      style: const TextStyle(
                                        color: Color(0xFF125B52),
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                        const SizedBox(height: 16),
                        SectionCard(
                          title: '当前目标',
                          children: [
                            _StatRow(
                              label: '目标专业',
                              value: snapshot.data!.currentTargetName ?? '尚未设置',
                            ),
                            _StatRow(
                              label: '当前计划',
                              value: snapshot.data!.currentPlanTitle ?? '尚未生成',
                            ),
                          ],
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

  String _errorMessage(Object? error) {
    if (error is FeatureUnavailableException) {
      return '${error.message}\n${error.nextSteps.join('\n')}';
    }
    return '$error';
  }
}

class _StatsHero extends StatelessWidget {
  const _StatsHero({required this.overview});
  final StudyStatsOverview overview;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1A403A), Color(0xFF3D826C)],
        ),
        borderRadius: BorderRadius.circular(32),
      ),
      child: Padding(
        padding: const EdgeInsets.all(22),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(999),
              ),
              child: const Text(
                '学习统计',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              '本周已学习 ${overview.weekStudyMinutes} 分钟',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: Colors.white),
            ),
            const SizedBox(height: 10),
            Text(
              '连续打卡 ${overview.continuousCheckinDays} 天，Todo 完成率 ${(overview.todoCompletionRate * 100).toStringAsFixed(0)}%。',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: const Color(0xFFF3E8DA)),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatRow extends StatelessWidget {
  const _StatRow({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(child: Text(label)),
          Text(value, style: Theme.of(context).textTheme.titleMedium),
        ],
      ),
    );
  }
}
