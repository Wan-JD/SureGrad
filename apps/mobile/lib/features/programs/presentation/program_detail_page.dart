import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/login_route_args.dart';
import '../../../app/navigation/program_detail_route_args.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';
import '../data/program_models.dart';
import '../data/programs_repository.dart';

class ProgramDetailPage extends StatefulWidget {
  const ProgramDetailPage({super.key, required this.args});

  final ProgramDetailRouteArgs args;

  @override
  State<ProgramDetailPage> createState() => _ProgramDetailPageState();
}

class _ProgramDetailPageState extends State<ProgramDetailPage> {
  Future<ProgramDetail>? _future;
  String? _loadedProgramId;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_loadedProgramId != widget.args.programId) {
      _loadedProgramId = widget.args.programId;
      _future = _load(AppScope.of(context).programsRepository);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bootstrap = AppScope.of(context);

    return AnimatedBuilder(
      animation: Listenable.merge([
        bootstrap.refreshStore,
        bootstrap.sessionStore,
      ]),
      builder: (context, _) {
        return FutureBuilder<ProgramDetail>(
          future: _future,
          builder: (context, snapshot) {
            final detail = snapshot.data;

            return Scaffold(
              appBar: AppBar(
                title: Text(detail?.programName ?? widget.args.programName ?? '专业详情'),
                actions: [
                  if (detail != null)
                    IconButton(
                      onPressed: () => _handleFavorite(detail),
                      icon: Icon(
                        detail.isFavorited
                            ? Icons.bookmark_rounded
                            : Icons.bookmark_border_rounded,
                      ),
                    ),
                ],
              ),
              body: SafeArea(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
                  children: [
                    if (snapshot.hasError)
                      EmptyStateCard(
                        title: '专业详情加载失败',
                        message: _errorMessage(snapshot.error),
                        actionLabel: '重试',
                        onAction: _reload,
                      )
                    else if (!snapshot.hasData)
                      const _DetailLoading()
                    else if (detail == null)
                      const EmptyStateCard(
                        title: '专业不存在',
                        message: '当前专业详情没有从真实接口拿到结果。',
                      )
                    else ...[
                      _ProgramHero(
                        detail: detail,
                        onCompare: () => _handleCompare(detail),
                        onSetTarget: () => _handleSetTarget(detail),
                      ),
                      const SizedBox(height: 16),
                      SectionCard(
                        title: '所属院校与院系',
                        subtitle: '从 /programs/{id} 聚合的学校与院系摘要。',
                        children: [
                          Text(
                            '${detail.school.schoolName} · ${detail.department.departmentName}',
                            style: Theme.of(context).textTheme.titleSmall,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            [
                              if (detail.school.city != null) detail.school.city!,
                              if (detail.school.province != null) detail.school.province!,
                              if (detail.school.schoolLevel != null)
                                detail.school.schoolLevel!,
                            ].join(' · '),
                          ),
                          if (detail.department.website != null) ...[
                            const SizedBox(height: 8),
                            Text('院系站点：${detail.department.website}'),
                          ],
                        ],
                      ),
                      const SizedBox(height: 16),
                      SectionCard(
                        title: '关键指标摘要',
                        subtitle: '最近年份分数线、报录比与复试比；缺失字段会标为待补充。',
                        children: [
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              Chip(label: Text('分数线 ${detail.scoreLineLabel}')),
                              Chip(label: Text('报录比 ${detail.applicationRatioLabel}')),
                              Chip(label: Text('复试比 ${detail.interviewRatioLabel}')),
                            ],
                          ),
                          if (detail.dataUpdatedAt != null) ...[
                            const SizedBox(height: 10),
                            Text('数据更新：${detail.dataUpdatedAt}'),
                          ],
                        ],
                      ),
                      const SizedBox(height: 16),
                      _YearlyRecordsSection(
                        title: '历年分数线',
                        emptyLabel: '暂无该年份分数线数据',
                        records: detail.scoreLines
                            .map(
                              (item) => item.examYear == null
                                  ? '年份待补充 · 总分 ${item.totalScore ?? '-'}'
                                  : '${item.examYear} · 总分 ${item.totalScore ?? '-'} · '
                                      '政 ${item.politicsScore ?? '-'} / 英 ${item.englishScore ?? '-'} / '
                                      '一 ${item.subjectOneScore ?? '-'} / 二 ${item.subjectTwoScore ?? '-'}',
                            )
                            .toList(),
                      ),
                      const SizedBox(height: 16),
                      _YearlyRecordsSection(
                        title: '报录比',
                        emptyLabel: '暂无报录比数据',
                        records: detail.applicationStats
                            .map(
                              (item) => item.examYear == null
                                  ? '年份待补充 · 报录比 ${item.applicationRatio ?? '待补充'}'
                                  : '${item.examYear} · 报考 ${item.applicantCount ?? '-'} / '
                                      '录取 ${item.admittedCount ?? '-'} / '
                                      '报录比 ${item.applicationRatio ?? '待补充'}:1',
                            )
                            .toList(),
                      ),
                      const SizedBox(height: 16),
                      _YearlyRecordsSection(
                        title: '复试比',
                        emptyLabel: '暂无复试比数据',
                        records: detail.interviewStats
                            .map(
                              (item) => item.examYear == null
                                  ? '年份待补充 · 复试比 ${item.interviewRatio ?? '待补充'}'
                                  : '${item.examYear} · 复试 ${item.retestCandidateCount ?? '-'} / '
                                      '录取 ${item.finalAdmittedCount ?? '-'} / '
                                      '复试比 ${item.interviewRatio ?? '待补充'}:1',
                            )
                            .toList(),
                      ),
                      const SizedBox(height: 16),
                      _YearlyRecordsSection(
                        title: '招生信息',
                        emptyLabel: '暂无招生人数数据',
                        records: detail.admissions
                            .map(
                              (item) => item.examYear == null
                                  ? '年份待补充 · 计划 ${item.plannedEnrollment ?? '待补充'}'
                                  : '${item.examYear} · 计划招生 ${item.plannedEnrollment ?? '-'} / '
                                      '统考名额 ${item.unifiedExamQuota ?? '-'} / '
                                      '实际录取 ${item.actualEnrollment ?? '-'}',
                            )
                            .toList(),
                      ),
                      const SizedBox(height: 16),
                      _YearlyRecordsSection(
                        title: '初试科目',
                        emptyLabel: '暂无初试科目数据',
                        records: detail.examSubjects
                            .map(
                              (item) => item.examYear == null
                                  ? '${item.subjectRole ?? '科目'} · ${item.subjectName ?? '待补充'}'
                                  : '${item.examYear} · ${item.subjectRole ?? '科目'} · '
                                      '${item.subjectCode ?? ''} ${item.subjectName ?? '待补充'}',
                            )
                            .toList(),
                      ),
                      const SizedBox(height: 16),
                      _YearlyRecordsSection(
                        title: '参考书',
                        emptyLabel: '暂无参考书数据',
                        records: detail.referenceBooks
                            .map(
                              (item) => item.title.isEmpty
                                  ? '待补充'
                                  : '${item.examYear ?? '年份待补充'} · ${item.title}'
                                      '${item.author == null ? '' : ' / ${item.author}'}',
                            )
                            .toList(),
                      ),
                      const SizedBox(height: 16),
                      SectionCard(
                        title: '官方来源',
                        subtitle: '用于追溯分数线与招生口径；链接失效时会保留标题。',
                        children: detail.sourceLinks.isEmpty
                            ? const [Text('暂无来源链接。')]
                            : detail.sourceLinks
                                  .map(
                                    (link) => Padding(
                                      padding: const EdgeInsets.only(bottom: 10),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            link.title,
                                            style: Theme.of(context).textTheme.titleSmall,
                                          ),
                                          if (link.url != null)
                                            Text(link.url!)
                                          else
                                            const Text('链接待更新'),
                                        ],
                                      ),
                                    ),
                                  )
                                  .toList(),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        detail.disclaimer,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<ProgramDetail> _load(ProgramsRepository repository) {
    return repository.fetchProgramDetail(widget.args.programId);
  }

  void _reload() {
    setState(() {
      _future = _load(AppScope.of(context).programsRepository);
    });
  }

  Future<void> _handleFavorite(ProgramDetail detail) async {
    final bootstrap = AppScope.of(context);
    if (!_ensureLoggedIn(
      bootstrap,
      redirectArguments: widget.args,
    )) {
      return;
    }

    try {
      await bootstrap.programsRepository.toggleProgramFavorite(
        programId: detail.programId,
        isFavorited: detail.isFavorited,
      );
      _showMessage(detail.isFavorited ? '已取消收藏。' : '已提交收藏请求。');
      _reload();
    } catch (error) {
      _showMessage(_errorMessage(error));
    }
  }

  Future<void> _handleCompare(ProgramDetail detail) async {
    final bootstrap = AppScope.of(context);
    if (!_ensureLoggedIn(
      bootstrap,
      redirectArguments: widget.args,
    )) {
      return;
    }

    try {
      await bootstrap.programsRepository.toggleProgramComparison(
        programId: detail.programId,
        isInComparison: detail.isInComparison,
      );
      _showMessage(detail.isInComparison ? '已移出对比池。' : '已提交对比请求。');
      _reload();
    } catch (error) {
      _showMessage(_errorMessage(error));
    }
  }

  Future<void> _handleSetTarget(ProgramDetail detail) async {
    final bootstrap = AppScope.of(context);
    if (!_ensureLoggedIn(
      bootstrap,
      redirectArguments: widget.args,
    )) {
      return;
    }

    try {
      await bootstrap.programsRepository.setCurrentTarget(detail);
      if (!mounted) {
        return;
      }
      Navigator.of(context).pushNamed(AppRoutes.planning);
    } catch (error) {
      _showMessage(_errorMessage(error));
    }
  }

  bool _ensureLoggedIn(
    AppBootstrap bootstrap, {
    required Object? redirectArguments,
  }) {
    if (bootstrap.sessionStore.isLoggedIn) {
      return true;
    }

    Navigator.of(context).pushNamed(
      AppRoutes.login,
      arguments: LoginRouteArgs(
        redirectTo: AppRoutes.programDetail,
        redirectArguments: redirectArguments,
      ),
    );
    return false;
  }

  void _showMessage(String message) {
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  String _errorMessage(Object? error) {
    if (error is FeatureUnavailableException) {
      return '${error.message}\n${error.nextSteps.join('\n')}';
    }
    return '$error';
  }
}

class _ProgramHero extends StatelessWidget {
  const _ProgramHero({
    required this.detail,
    required this.onCompare,
    required this.onSetTarget,
  });

  final ProgramDetail detail;
  final VoidCallback onCompare;
  final VoidCallback onSetTarget;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFF6F1E6),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: const Color(0xFFE6DDCE)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              detail.programName,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              '${detail.school.schoolName} / ${detail.department.departmentName}',
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Chip(label: Text(detail.degreeTypeLabel)),
                if (detail.programCode != null)
                  Chip(label: Text(detail.programCode!)),
                if (detail.disciplineCategory != null)
                  Chip(label: Text(detail.disciplineCategory!)),
                if (detail.researchDirection != null)
                  Chip(label: Text(detail.researchDirection!)),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              '分数线 ${detail.scoreLineLabel} · 报录比 ${detail.applicationRatioLabel} · 复试比 ${detail.interviewRatioLabel}',
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: onCompare,
                    child: Text(detail.isInComparison ? '移出对比' : '加入对比'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: FilledButton(
                    onPressed: onSetTarget,
                    child: const Text('设为目标'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _YearlyRecordsSection extends StatelessWidget {
  const _YearlyRecordsSection({
    required this.title,
    required this.emptyLabel,
    required this.records,
  });

  final String title;
  final String emptyLabel;
  final List<String> records;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: title,
      children: records.isEmpty
          ? [Text(emptyLabel)]
          : records
                .map(
                  (line) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text(line),
                  ),
                )
                .toList(),
    );
  }
}

class _DetailLoading extends StatelessWidget {
  const _DetailLoading();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 280,
      decoration: BoxDecoration(
        color: const Color(0xFFEDE7DB),
        borderRadius: BorderRadius.circular(28),
      ),
    );
  }
}
