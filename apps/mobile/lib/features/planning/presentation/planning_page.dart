import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/app_tab.dart';
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
  @override
  Widget build(BuildContext context) {
    final bootstrap = AppScope.of(context);
    final repository = bootstrap.planningRepository;

    return AppNavigationScaffold(
      currentTab: AppTab.planning,
      title: '规划',
      child: AnimatedBuilder(
        animation: Listenable.merge([
          bootstrap.refreshStore,
          bootstrap.currentTargetStore,
        ]),
        builder: (context, _) {
          return FutureBuilder<PlanningSnapshot>(
            future: repository.fetchPlanningSnapshot(),
            builder: (context, snapshot) {
              return ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                children: [
                  if (snapshot.hasError)
                    EmptyStateCard(
                      title: '规划加载失败',
                      message: _errorMessage(snapshot.error),
                      actionLabel: '重试',
                      onAction: () => setState(() {}),
                    )
                  else if (!snapshot.hasData)
                    const _PlanningLoading()
                  else ...[
                    _PlanningHero(snapshot: snapshot.data!),
                    const SizedBox(height: 16),
                    if (!snapshot.data!.hasTarget)
                      EmptyStateCard(
                        title: '还没有设置目标',
                        message: '先去院校详情页把专业设为目标，再回来生成真实学习计划。',
                        actionLabel: '去择校',
                        onAction: () {
                          Navigator.of(context).pushNamed(AppRoutes.schools);
                        },
                      )
                    else if (!snapshot.data!.hasPlan)
                      EmptyStateCard(
                        title: '目标已设置，还没有计划',
                        message: '现在可以直接调用 /study-plans/generate 生成第一版规划。',
                        actionLabel: '生成计划',
                        onAction: _generatePlan,
                      )
                    else ...[
                      SectionCard(
                        title: '当前计划',
                        subtitle: snapshot.data!.currentPlan.title ?? '未命名计划',
                        children: [
                          _InfoRow(
                            label: '模板',
                            value:
                                snapshot.data!.currentPlan.templateType ?? '-',
                          ),
                          _InfoRow(
                            label: '周期',
                            value:
                                '${snapshot.data!.currentPlan.startDate ?? '-'} -> ${snapshot.data!.currentPlan.endDate ?? '-'}',
                          ),
                          _InfoRow(
                            label: '预计总时长',
                            value:
                                '${snapshot.data!.currentPlan.totalExpectedHours ?? '-'} 小时',
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SectionCard(
                        title: '阶段路线',
                        subtitle: '来自 /study-plans/current 的 phases 字段。',
                        children: snapshot.data!.currentPlan.phases
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
                        subtitle: '这是额外从 /weekly-plans 拉下来的真实周计划。',
                        children: snapshot.data!.weeklyPlan == null
                            ? const [Text('当前没有拿到周计划详情。')]
                            : [
                                _InfoRow(
                                  label: '标题',
                                  value:
                                      snapshot.data!.weeklyPlan!.title ?? '-',
                                ),
                                _InfoRow(
                                  label: '周区间',
                                  value:
                                      '${snapshot.data!.weeklyPlan!.weekStartDate ?? '-'} -> ${snapshot.data!.weeklyPlan!.weekEndDate ?? '-'}',
                                ),
                                _InfoRow(
                                  label: '目标',
                                  value:
                                      snapshot.data!.weeklyPlan!.goals ?? '-',
                                ),
                                const SizedBox(height: 12),
                                ...snapshot.data!.weeklyPlan!.dailyPlans.map(
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
                        subtitle: '今日卡片来自 /daily-plans，并把 todo 也带回来了。',
                        children: snapshot.data!.dailyPlan == null
                            ? const [Text('当前没有拿到今日计划详情。')]
                            : [
                                _InfoRow(
                                  label: '标题',
                                  value: snapshot.data!.dailyPlan!.title ?? '-',
                                ),
                                _InfoRow(
                                  label: '预计时长',
                                  value:
                                      '${snapshot.data!.dailyPlan!.expectedHours ?? '-'} 小时',
                                ),
                                _InfoRow(
                                  label: '备注',
                                  value:
                                      snapshot.data!.dailyPlan!.notes ?? '暂无',
                                ),
                                const SizedBox(height: 12),
                                FilledButton(
                                  onPressed: () {
                                    Navigator.of(
                                      context,
                                    ).pushNamed(AppRoutes.todo);
                                  },
                                  child: const Text('查看今日 Todo'),
                                ),
                              ],
                      ),
                    ],
                  ],
                ],
              );
            },
          );
        },
      ),
    );
  }

  Future<void> _generatePlan() async {
    try {
      await AppScope.of(context).planningRepository.generatePlan();
      if (!mounted) {
        return;
      }
      setState(() {});
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
            Text(
              snapshot.headline,
              style: Theme.of(
                context,
              ).textTheme.headlineMedium?.copyWith(color: Colors.white),
            ),
            const SizedBox(height: 10),
            Text(
              snapshot.hasPlan
                  ? '计划、周安排和今日卡片都来自真实后端接口。'
                  : '当前还没有计划，这里不会再用 mock 自动生成假路线。',
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
            Text('${phase.startDate} -> ${phase.endDate}'),
            const SizedBox(height: 8),
            if (phase.focusSubjects.isNotEmpty)
              Text('重点: ${phase.focusSubjects.join(' / ')}'),
            if (phase.goals != null) ...[
              const SizedBox(height: 6),
              Text('目标: ${phase.goals}'),
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
