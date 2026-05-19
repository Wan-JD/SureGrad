import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/app_tab.dart';
import '../../../core/models/main_journey_state.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/widgets/app_navigation_scaffold.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';
import '../data/planning_models.dart';

class PlanningPage extends StatefulWidget {
  const PlanningPage({super.key});

  @override
  State<PlanningPage> createState() => _PlanningPageState();
}

class _PlanningPageState extends State<PlanningPage> {
  Future<void> _refresh() async {
    if (!mounted) {
      return;
    }
    setState(() {});
    await Future<void>.delayed(Duration.zero);
  }

  @override
  Widget build(BuildContext context) {
    final bootstrap = AppScope.of(context);
    final repository = bootstrap.planningRepository;

    return AppNavigationScaffold(
      currentTab: AppTab.planning,
      title: '规划',
      actions: [
        IconButton(
          onPressed: _refresh,
          tooltip: '刷新',
          icon: const Icon(Icons.refresh_rounded),
        ),
      ],
      child: AnimatedBuilder(
        animation: Listenable.merge([
          bootstrap.refreshStore,
          bootstrap.currentTargetStore,
        ]),
        builder: (context, _) {
          return FutureBuilder<PlanningSnapshot>(
            future: repository.fetchPlanningSnapshot(),
            builder: (context, snapshot) {
              return RefreshIndicator(
                onRefresh: _refresh,
                child: ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                  children: [
                    if (snapshot.hasError) ...[
                      _JourneyErrorCard(
                        title: '规划加载失败',
                        message: _errorMessage(snapshot.error),
                        onRetry: _refresh,
                      ),
                    ] else if (!snapshot.hasData) ...[
                      const _PlanningLoading(),
                    ] else ...[
                      _PlanningHero(snapshot: snapshot.data!),
                      const SizedBox(height: 16),
                      _JourneyStatusCard(
                        state: snapshot.data!.journeyState,
                        headline: snapshot.data!.headline,
                        nextStep: _nextStepText(snapshot.data!.journeyState),
                      ),
                      const SizedBox(height: 16),
                      ..._buildContentForSnapshot(context, snapshot.data!),
                    ],
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }

  List<Widget> _buildContentForSnapshot(
    BuildContext context,
    PlanningSnapshot snapshot,
  ) {
    switch (snapshot.journeyState) {
      case MainJourneyState.noTarget:
        return [
          EmptyStateCard(
            title: '还没有设置目标',
            message: '先去院校页把目标专业设好，再回来生成学习计划。',
            actionLabel: '去选学校',
            onAction: () {
              Navigator.of(context).pushNamed(AppRoutes.schools);
            },
          ),
        ];
      case MainJourneyState.noPlan:
        return [
          EmptyStateCard(
            title: '目标已同步，暂时还没有计划',
            message: '这里不会再展示 mock 路线。点击按钮后会请求真实的计划生成接口。',
            actionLabel: '生成计划',
            onAction: _generatePlan,
          ),
        ];
      case MainJourneyState.hasPlan:
        return [
          SectionCard(
            title: '当前计划',
            subtitle: snapshot.currentPlan.title ?? '未命名计划',
            children: [
              _InfoRow(
                label: '模板',
                value: snapshot.currentPlan.templateType ?? '-',
              ),
              _InfoRow(
                label: '周期',
                value:
                    '${snapshot.currentPlan.startDate ?? '-'} - ${snapshot.currentPlan.endDate ?? '-'}',
              ),
              _InfoRow(
                label: '总时长',
                value: '${snapshot.currentPlan.totalExpectedHours ?? '-'} 小时',
              ),
            ],
          ),
          const SizedBox(height: 16),
          SectionCard(
            title: '阶段路线',
            subtitle: snapshot.currentPlan.phases.isEmpty
                ? '当前计划已创建，但还没有同步出阶段拆分。'
                : '按当前计划返回的 phases 字段展示。',
            children: snapshot.currentPlan.phases.isEmpty
                ? const [_InlineHint(text: '下拉刷新后仍为空时，可稍后再试或回到首页确认状态是否已同步。')]
                : snapshot.currentPlan.phases
                      .map(
                        (phase) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _PhaseTile(phase: phase),
                        ),
                      )
                      .toList(),
          ),
          const SizedBox(height: 16),
          SectionCard(
            title: '本周安排',
            subtitle: snapshot.hasWeeklyPlan
                ? '来自当前周计划的真实数据。'
                : '当前计划已存在，但本周安排还没有同步完成。',
            children: snapshot.weeklyPlan == null
                ? const [_InlineHint(text: '稍后下拉刷新即可再次拉取本周安排。')]
                : [
                    _InfoRow(
                      label: '标题',
                      value: snapshot.weeklyPlan!.title ?? '-',
                    ),
                    _InfoRow(
                      label: '周区间',
                      value:
                          '${snapshot.weeklyPlan!.weekStartDate ?? '-'} - ${snapshot.weeklyPlan!.weekEndDate ?? '-'}',
                    ),
                    _InfoRow(
                      label: '目标',
                      value: snapshot.weeklyPlan!.goals ?? '-',
                    ),
                    const SizedBox(height: 12),
                    ...snapshot.weeklyPlan!.dailyPlans.map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _WeekPlanItem(item: item),
                      ),
                    ),
                  ],
          ),
          const SizedBox(height: 16),
          SectionCard(
            title: '今日计划',
            subtitle: snapshot.hasDailyPlan
                ? '来自今日计划和 Todo 的真实联动。'
                : '计划已存在，但今天的学习卡片还没有返回。',
            children: snapshot.dailyPlan == null
                ? const [_InlineHint(text: '如果今天还没生成日计划，可以稍后刷新再看。')]
                : [
                    _InfoRow(
                      label: '标题',
                      value: snapshot.dailyPlan!.title ?? '-',
                    ),
                    _InfoRow(
                      label: '预计时长',
                      value: '${snapshot.dailyPlan!.expectedHours ?? '-'} 小时',
                    ),
                    _InfoRow(
                      label: '备注',
                      value: snapshot.dailyPlan!.notes ?? '暂无',
                    ),
                    const SizedBox(height: 12),
                    FilledButton(
                      onPressed: () {
                        Navigator.of(context).pushNamed(AppRoutes.todo);
                      },
                      child: const Text('查看今日 Todo'),
                    ),
                  ],
          ),
        ];
    }
  }

  Future<void> _generatePlan() async {
    try {
      await AppScope.of(context).planningRepository.generatePlan();
      if (!mounted) {
        return;
      }
      await _refresh();
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('已触发真实计划生成请求。')));
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(_errorMessage(error))));
    }
  }

  String _nextStepText(MainJourneyState state) {
    switch (state) {
      case MainJourneyState.noTarget:
        return '下一步：去院校页设置目标。';
      case MainJourneyState.noPlan:
        return '下一步：在这里生成第一版学习计划。';
      case MainJourneyState.hasPlan:
        return '下一步：继续查看本周安排和今日 Todo。';
    }
  }

  String _errorMessage(Object? error) {
    if (error is FeatureUnavailableException) {
      return '${error.message}\n${error.nextSteps.join('\n')}';
    }
    return '$error';
  }
}

class _PlanningHero extends StatelessWidget {
  const _PlanningHero({required this.snapshot});

  final PlanningSnapshot snapshot;

  @override
  Widget build(BuildContext context) {
    final state = snapshot.journeyState;
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1A403A), Color(0xFF7E5A3A)],
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
              child: Text(
                state.label,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              snapshot.headline,
              style: Theme.of(
                context,
              ).textTheme.headlineMedium?.copyWith(color: Colors.white),
            ),
            const SizedBox(height: 10),
            Text(
              state.summary,
              style: Theme.of(
                context,
              ).textTheme.bodyLarge?.copyWith(color: const Color(0xFFF3E8DA)),
            ),
          ],
        ),
      ),
    );
  }
}

class _JourneyStatusCard extends StatelessWidget {
  const _JourneyStatusCard({
    required this.state,
    required this.headline,
    required this.nextStep,
  });

  final MainJourneyState state;
  final String headline;
  final String nextStep;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: '主链路状态',
      subtitle: state.title,
      children: [
        _InfoRow(label: '当前状态', value: state.label),
        _InfoRow(label: '当前目标', value: headline),
        _InfoRow(label: '状态说明', value: state.summary),
        _InfoRow(label: '建议动作', value: nextStep),
      ],
    );
  }
}

class _JourneyErrorCard extends StatelessWidget {
  const _JourneyErrorCard({
    required this.title,
    required this.message,
    required this.onRetry,
  });

  final String title;
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        EmptyStateCard(
          title: title,
          message: '$message\n\n下拉刷新或点击重试后，会重新请求真实接口。',
          actionLabel: '重试',
          onAction: onRetry,
        ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 96,
            child: Text(label, style: Theme.of(context).textTheme.titleSmall),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}

class _PhaseTile extends StatelessWidget {
  const _PhaseTile({required this.phase});

  final StudyPlanPhase phase;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFFCFAF5),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE5DECF)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(phase.title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 6),
            Text('${phase.startDate} - ${phase.endDate}'),
            const SizedBox(height: 8),
            if (phase.focusSubjects.isNotEmpty)
              Text('重点科目：${phase.focusSubjects.join(' / ')}'),
            if (phase.goals != null) ...[
              const SizedBox(height: 6),
              Text('阶段目标：${phase.goals}'),
            ],
          ],
        ),
      ),
    );
  }
}

class _WeekPlanItem extends StatelessWidget {
  const _WeekPlanItem({required this.item});

  final WeeklyPlanItem item;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFF8F4EC),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Expanded(child: Text(item.title ?? item.planDate)),
            Text(item.status ?? '-'),
          ],
        ),
      ),
    );
  }
}

class _InlineHint extends StatelessWidget {
  const _InlineHint({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text, style: Theme.of(context).textTheme.bodyMedium);
  }
}

class _PlanningLoading extends StatelessWidget {
  const _PlanningLoading();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 300,
      decoration: BoxDecoration(
        color: const Color(0xFFEDE7DB),
        borderRadius: BorderRadius.circular(28),
      ),
    );
  }
}
