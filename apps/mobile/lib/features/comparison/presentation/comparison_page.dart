import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/app_tab.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/widgets/app_navigation_scaffold.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../data/comparison_models.dart';

class ComparisonPage extends StatefulWidget {
  const ComparisonPage({super.key});

  @override
  State<ComparisonPage> createState() => _ComparisonPageState();
}

class _ComparisonPageState extends State<ComparisonPage> {
  @override
  Widget build(BuildContext context) {
    final repository = AppScope.of(context).comparisonRepository;

    return AppNavigationScaffold(
      currentTab: AppTab.schools,
      title: '专业对比',
      child: FutureBuilder<ComparisonResult>(
        future: repository.fetchComparisonResult(),
        builder: (context, snapshot) {
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (snapshot.hasError)
                EmptyStateCard(
                  title: '对比中心暂时不可用',
                  message: _errorMessage(snapshot.error),
                  actionLabel: '重试',
                  onAction: () => setState(() {}),
                )
              else if (!snapshot.hasData)
                const _PageLoading()
              else if (snapshot.data!.isEmpty)
                _ComparisonEmptyState(pool: snapshot.data!.pool)
              else
                _ComparisonDecisionSurface(result: snapshot.data!),
            ],
          );
        },
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

class _ComparisonDecisionSurface extends StatelessWidget {
  const _ComparisonDecisionSurface({required this.result});

  final ComparisonResult result;

  @override
  Widget build(BuildContext context) {
    final items = result.items;
    final mostComplete = _findMostComplete(items);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _ComparisonHeroCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '把已加入对比池的专业放到同一张决策面上。',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                '当前共 ${result.pool.currentCount} 个专业，最多可同时比较 ${result.pool.maxCount} 个。以下卡片按加入顺序展示，缺失字段会直接标出。',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  _SummaryPill(
                    label: '对比数量',
                    value:
                        '${result.pool.currentCount}/${result.pool.maxCount}',
                  ),
                  _SummaryPill(label: '数据年份', value: _examYearSummary(items)),
                  _SummaryPill(
                    label: '信息最完整',
                    value: mostComplete?.programName ?? '待补充',
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        ...items.map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: _ComparisonProgramCard(
              item: item,
              result: result,
              isMostComplete: identical(item, mostComplete),
              onSetTarget: () => _setTargetFromComparison(context, item),
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _setTargetFromComparison(
    BuildContext context,
    ComparisonItem item,
  ) async {
    final bootstrap = AppScope.of(context);
    try {
      await bootstrap.planningRepository.setTargetFromProgramId(item.targetId);
      if (!context.mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('已将 ${item.programName} 设为目标专业')),
      );
      Navigator.of(context).pushNamed(AppRoutes.planning);
    } on ApiException catch (error) {
      if (!context.mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message)),
      );
    }
  }

  ComparisonItem? _findMostComplete(List<ComparisonItem> items) {
    if (items.isEmpty) {
      return null;
    }

    ComparisonItem best = items.first;
    for (final item in items.skip(1)) {
      if (item.missingFieldCount < best.missingFieldCount) {
        best = item;
      }
    }
    return best;
  }

  String _examYearSummary(List<ComparisonItem> items) {
    final years =
        items.map((item) => item.examYear).whereType<int>().toSet().toList()
          ..sort();
    if (years.isEmpty) {
      return '待补充';
    }
    if (years.length == 1) {
      return '${years.single} 年';
    }
    return '${years.first}-${years.last}';
  }
}

class _ComparisonEmptyState extends StatelessWidget {
  const _ComparisonEmptyState({required this.pool});

  final ComparisonPool pool;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _ComparisonHeroCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '先把候选专业加入对比池，再回来做判断。',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                '这不是加载失败，而是当前还没有专业进入比较流程。你可以在院校详情页把感兴趣的专业加入对比池，最多同时比较 ${pool.maxCount} 个专业。',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 16),
              const Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  _GuideChip(label: '看分数线'),
                  _GuideChip(label: '比报录比'),
                  _GuideChip(label: '查招生人数'),
                  _GuideChip(label: '核对初试科目'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        const EmptyStateCard(
          title: '比较池还是空的',
          message: '从院校详情页添加专业后，这里会直接展示可比较的关键指标和缺失信息，帮助你更快缩小选择范围。',
        ),
      ],
    );
  }
}

class _ComparisonProgramCard extends StatelessWidget {
  const _ComparisonProgramCard({
    required this.item,
    required this.result,
    required this.isMostComplete,
    required this.onSetTarget,
  });

  final ComparisonItem item;
  final ComparisonResult result;
  final bool isMostComplete;
  final VoidCallback onSetTarget;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final badges = _buildBadges();
    final metricSpecs = [
      ('totalScore', item.totalScore),
      ('applicationRatio', item.applicationRatio),
      ('interviewRatio', item.interviewRatio),
      ('plannedEnrollment', item.plannedEnrollment),
      ('tuitionPerYear', item.tuitionPerYear),
    ];

    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(
          colors: [Color(0xFFFFFCF7), Color(0xFFF1ECE0)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: const Color(0xFFE1D8C8)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.programName, style: theme.textTheme.titleLarge),
                      const SizedBox(height: 6),
                      Text(
                        '${item.schoolName} · ${item.departmentName}',
                        style: theme.textTheme.bodyLarge,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${item.city} · ${_degreeTypeLabel(item.degreeType)} · ${item.disciplineCategory}',
                        style: theme.textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
                if (item.examYear != null)
                  _CornerYearBadge(year: item.examYear!),
              ],
            ),
            if (badges.isNotEmpty) ...[
              const SizedBox(height: 16),
              Wrap(spacing: 8, runSpacing: 8, children: badges),
            ],
            const SizedBox(height: 16),
            LayoutBuilder(
              builder: (context, constraints) {
                final itemWidth = (constraints.maxWidth - 12) / 2;
                return Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: metricSpecs
                      .map((spec) {
                        final dimension = result.dimensionFor(spec.$1);
                        return SizedBox(
                          width: itemWidth,
                          child: _MetricTile(
                            label: dimension?.label ?? spec.$1,
                            value: _formatMetricValue(
                              spec.$2,
                              unit: dimension?.unit,
                              key: spec.$1,
                            ),
                            isMissing: spec.$2 == null,
                          ),
                        );
                      })
                      .toList(growable: false),
                );
              },
            ),
            const SizedBox(height: 16),
            _InfoSection(
              title: '初试科目',
              content: item.examSubjects.isEmpty
                  ? '暂未录入'
                  : item.examSubjects.join('\n'),
            ),
            const SizedBox(height: 12),
            _InfoSection(
              title: '研究方向',
              content:
                  (item.researchDirection == null ||
                      item.researchDirection!.trim().isEmpty)
                  ? '未细分方向'
                  : item.researchDirection!,
            ),
            if (item.missingFlags.isNotEmpty) ...[
              const SizedBox(height: 12),
              _InfoSection(
                title: '待补数据',
                content: item.missingFlags.map(_missingFlagLabel).join('、'),
              ),
            ],
            const SizedBox(height: 16),
            FilledButton(
              onPressed: onSetTarget,
              child: const Text('设为目标专业'),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildBadges() {
    final badges = <Widget>[
      _GuideChip(label: item.examMathRequired ? '考数学' : '不考数学'),
    ];
    if (item.missingFlags.isEmpty) {
      badges.add(const _GuideChip(label: '字段完整'));
    } else {
      badges.add(_GuideChip(label: '缺失 ${item.missingFlags.length} 项'));
    }
    if (isMostComplete) {
      badges.add(const _GuideChip(label: '信息最完整'));
    }
    return badges;
  }

  String _degreeTypeLabel(String value) {
    switch (value) {
      case 'academic':
        return '学硕';
      case 'professional':
        return '专硕';
      default:
        return '学位待定';
    }
  }

  String _missingFlagLabel(String value) {
    switch (value) {
      case 'score_line':
        return '分数线';
      case 'application_ratio':
        return '报录比';
      case 'interview_ratio':
        return '复试比';
      case 'planned_enrollment':
        return '招生人数';
      case 'exam_subjects':
        return '初试科目';
      default:
        return value;
    }
  }

  String _formatMetricValue(
    num? value, {
    required String? unit,
    required String key,
  }) {
    if (value == null) {
      return '待补充';
    }

    final valueText = switch (key) {
      'applicationRatio' ||
      'interviewRatio' => value.toStringAsFixed(value % 1 == 0 ? 0 : 1),
      _ => value % 1 == 0 ? value.toInt().toString() : value.toStringAsFixed(1),
    };

    if (unit == null || unit.isEmpty) {
      return valueText;
    }
    return '$valueText $unit';
  }
}

class _MetricTile extends StatelessWidget {
  const _MetricTile({
    required this.label,
    required this.value,
    required this.isMissing,
  });

  final String label;
  final String value;
  final bool isMissing;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: isMissing ? const Color(0xFFFFF5EF) : Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isMissing ? const Color(0xFFF0CBB5) : const Color(0xFFE1D8C8),
        ),
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

class _InfoSection extends StatelessWidget {
  const _InfoSection({required this.title, required this.content});

  final String title;
  final String content;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.78),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 8),
            Text(content, style: Theme.of(context).textTheme.bodyLarge),
          ],
        ),
      ),
    );
  }
}

class _SummaryPill extends StatelessWidget {
  const _SummaryPill({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.72),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFD7DDCF)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(label, style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 4),
            Text(value, style: Theme.of(context).textTheme.titleMedium),
          ],
        ),
      ),
    );
  }
}

class _GuideChip extends StatelessWidget {
  const _GuideChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFE7F0EC),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(label, style: Theme.of(context).textTheme.bodyMedium),
    );
  }
}

class _CornerYearBadge extends StatelessWidget {
  const _CornerYearBadge({required this.year});

  final int year;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFF125B52),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Text(
          '$year',
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(color: Colors.white),
        ),
      ),
    );
  }
}

class _ComparisonHeroCard extends StatelessWidget {
  const _ComparisonHeroCard({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        gradient: const LinearGradient(
          colors: [Color(0xFFE8F1EE), Color(0xFFFFF8EA)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Padding(padding: const EdgeInsets.all(22), child: child),
    );
  }
}

class _PageLoading extends StatelessWidget {
  const _PageLoading();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 240,
      decoration: BoxDecoration(
        color: const Color(0xFFEDE7DB),
        borderRadius: BorderRadius.circular(28),
      ),
    );
  }
}
