import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../core/layout/responsive_breakpoints.dart';
import '../../../core/models/main_journey_state.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';
import '../../planning/data/planning_models.dart';

class RoutePage extends StatefulWidget {
  const RoutePage({super.key});

  @override
  State<RoutePage> createState() => _RoutePageState();
}

class _RoutePageState extends State<RoutePage> {
  @override
  Widget build(BuildContext context) {
    final bootstrap = AppScope.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('学习路线')),
      body: SafeArea(
        child: ResponsivePageBody(
          child: AnimatedBuilder(
            animation: Listenable.merge([
              bootstrap.refreshStore,
              bootstrap.currentTargetStore,
            ]),
            builder: (context, _) {
              return FutureBuilder<PlanningSnapshot>(
                future: bootstrap.planningRepository.fetchPlanningSnapshot(),
                builder: (context, snapshot) {
                  return ListView(
                    padding: context.contentPadding(),
                    children: [
                      if (snapshot.hasError)
                        EmptyStateCard(
                          title: '路线加载失败',
                          message: _errorMessage(snapshot.error),
                          actionLabel: '重试',
                          onAction: () => setState(() {}),
                        )
                      else if (!snapshot.hasData)
                        Container(
                          height: 300,
                          decoration: BoxDecoration(
                            color: const Color(0xFFEDE7DB),
                            borderRadius: BorderRadius.circular(28),
                          ),
                        )
                      else if (snapshot.data!.journeyState == MainJourneyState.noTarget)
                        EmptyStateCard(
                          title: '还没有设置目标',
                          message: '先去院校页把目标专业设好，再回来查看学习路线。',
                          actionLabel: '去选学校',
                          onAction: () {
                            Navigator.of(context).pushNamed(AppRoutes.schools);
                          },
                        )
                      else if (snapshot.data!.journeyState == MainJourneyState.noPlan)
                        EmptyStateCard(
                          title: '还没有生成计划',
                          message: '目标已同步，去规划页生成第一版学习计划后，路线会自动出现。',
                          actionLabel: '去规划页',
                          onAction: () {
                            Navigator.of(context).pushNamed(AppRoutes.planning);
                          },
                        )
                      else ...[
                        _RouteHero(snapshot: snapshot.data!),
                        const SizedBox(height: 16),
                        SectionCard(
                          title: '阶段路线',
                          subtitle: '按当前计划返回的阶段拆分展示。',
                          children: snapshot.data!.currentPlan.phases.isEmpty
                              ? const [Text('当前计划已创建，但还没有同步出阶段拆分。')]
                              : snapshot.data!.currentPlan.phases
                                  .map((phase) => Padding(
                                    padding: const EdgeInsets.only(bottom: 12),
                                    child: _PhaseCard(phase: phase),
                                  ))
                                  .toList(),
                        ),
                        const SizedBox(height: 16),
                        SectionCard(
                          title: '计划概览',
                          children: [
                            _InfoRow(label: '模板', value: snapshot.data!.currentPlan.templateType ?? '-'),
                            _InfoRow(
                              label: '周期',
                              value: '${snapshot.data!.currentPlan.startDate ?? '-'} - ${snapshot.data!.currentPlan.endDate ?? '-'}',
                            ),
                            _InfoRow(
                              label: '总时长',
                              value: '${snapshot.data!.currentPlan.totalExpectedHours ?? '-'} 小时',
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

class _RouteHero extends StatelessWidget {
  const _RouteHero({required this.snapshot});
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
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                snapshot.journeyState.label,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              snapshot.headline,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: Colors.white),
            ),
            const SizedBox(height: 10),
            Text(
              '共 ${snapshot.currentPlan.phases.length} 个阶段，从基础到复试完整覆盖。',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: const Color(0xFFF3E8DA)),
            ),
          ],
        ),
      ),
    );
  }
}

class _PhaseCard extends StatelessWidget {
  const _PhaseCard({required this.phase});
  final StudyPlanPhase phase;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE3DCD0)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F3EF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.route_rounded, size: 20, color: Color(0xFF125B52)),
                ),
                const SizedBox(width: 12),
                Expanded(child: Text(phase.title, style: Theme.of(context).textTheme.titleMedium)),
              ],
            ),
            const SizedBox(height: 10),
            Text('${phase.startDate} - ${phase.endDate}', style: Theme.of(context).textTheme.bodyMedium),
            if (phase.focusSubjects.isNotEmpty) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: phase.focusSubjects
                    .map((s) => Chip(
                      label: Text(s, style: const TextStyle(fontSize: 12)),
                      padding: EdgeInsets.zero,
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ))
                    .toList(),
              ),
            ],
            if (phase.goals != null) ...[
              const SizedBox(height: 8),
              Text(phase.goals!, style: Theme.of(context).textTheme.bodyMedium),
            ],
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
          SizedBox(width: 96, child: Text(label, style: Theme.of(context).textTheme.titleSmall)),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
