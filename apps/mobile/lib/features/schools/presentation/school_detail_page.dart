import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/login_route_args.dart';
import '../../../app/navigation/school_detail_route_args.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/state/app_session_store.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';
import '../data/school_models.dart';
import '../data/schools_repository.dart';

class SchoolDetailPage extends StatefulWidget {
  const SchoolDetailPage({super.key, required this.args});

  final SchoolDetailRouteArgs args;

  @override
  State<SchoolDetailPage> createState() => _SchoolDetailPageState();
}

class _SchoolDetailPageState extends State<SchoolDetailPage> {
  Future<({SchoolDetail? school, List<SchoolProgram> programs})>? _future;
  String? _loadedSchoolId;
  bool _handledPendingAction = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_loadedSchoolId != widget.args.schoolId) {
      _loadedSchoolId = widget.args.schoolId;
      _future = _loadScreen(AppScope.of(context).schoolsRepository);
    }

    if (!_handledPendingAction) {
      _handledPendingAction = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _replayPendingAction();
      });
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
        return FutureBuilder<
          ({SchoolDetail? school, List<SchoolProgram> programs})
        >(
          future: _future,
          builder: (context, snapshot) {
            final school = snapshot.data?.school;
            final programs = snapshot.data?.programs ?? const <SchoolProgram>[];
            final featuredProgram = programs.isEmpty ? null : programs.first;

            return Scaffold(
              appBar: AppBar(
                title: Text(school?.name ?? widget.args.schoolName),
                actions: [
                  IconButton(
                    onPressed: school == null
                        ? null
                        : () => _handleFavorite(school),
                    icon: Icon(
                      school?.isFavorited == true
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
                        title: '院校详情加载失败',
                        message: _errorMessage(snapshot.error),
                        actionLabel: '重试',
                        onAction: _reload,
                      )
                    else if (!snapshot.hasData)
                      const _DetailLoading()
                    else if (school == null)
                      const EmptyStateCard(
                        title: '院校不存在',
                        message: '当前学校详情没有从真实接口拿到结果。',
                      )
                    else ...[
                      _SchoolHero(
                        school: school,
                        featuredProgram: featuredProgram,
                        onFavorite: () => _handleFavorite(school),
                        onCompare: featuredProgram == null
                            ? null
                            : () => _handleCompare(featuredProgram),
                        onSetTarget: featuredProgram == null
                            ? null
                            : () => _handleSetTarget(school, featuredProgram),
                      ),
                      const SizedBox(height: 16),
                      SectionCard(
                        title: '院校概况',
                        subtitle: '这里直接展示 /schools/{id} 返回的可用字段。',
                        children: [
                          Text(school.description ?? '暂无院校简介。'),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              Chip(label: Text(school.city)),
                              if (school.schoolLevel != null)
                                Chip(label: Text(school.schoolLevel!)),
                              if (school.schoolType != null)
                                Chip(label: Text(school.schoolType!)),
                              Chip(
                                label: Text(
                                  school.hasGraduateSchool
                                      ? '有研究生院'
                                      : '暂无研究生院标记',
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      if (school.hotPrograms.isNotEmpty)
                        SectionCard(
                          title: '热门专业',
                          subtitle: '热点专业和摘要指标来自真实 detail 接口。',
                          children: school.hotPrograms
                              .map(
                                (program) => Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: _HotProgramTile(program: program),
                                ),
                              )
                              .toList(),
                        ),
                      if (school.hotPrograms.isNotEmpty)
                        const SizedBox(height: 16),
                      SectionCard(
                        title: '专业列表',
                        subtitle: '真正可设为目标、可加入对比的动作都从这里发出去。',
                        children: programs.isEmpty
                            ? const [Text('当前没有拿到专业列表。')]
                            : programs
                                  .map(
                                    (program) => Padding(
                                      padding: const EdgeInsets.only(
                                        bottom: 12,
                                      ),
                                      child: _ProgramTile(
                                        program: program,
                                        onCompare: () =>
                                            _handleCompare(program),
                                        onSetTarget: () =>
                                            _handleSetTarget(school, program),
                                      ),
                                    ),
                                  )
                                  .toList(),
                      ),
                      const SizedBox(height: 16),
                      SectionCard(
                        title: '官网链接',
                        children: [
                          if (school.officialWebsite != null)
                            ListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('学校官网'),
                              subtitle: Text(school.officialWebsite!),
                            ),
                          if (school.graduateWebsite != null)
                            ListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('研究生院'),
                              subtitle: Text(school.graduateWebsite!),
                            ),
                          if (school.officialWebsite == null &&
                              school.graduateWebsite == null)
                            const Text('当前详情接口没有返回官网链接。'),
                        ],
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

  Future<({SchoolDetail? school, List<SchoolProgram> programs})> _loadScreen(
    SchoolsRepository repository,
  ) async {
    final school = await repository.fetchSchoolDetail(widget.args.schoolId);
    final programs = school == null
        ? const <SchoolProgram>[]
        : await repository.fetchPrograms(school.id);
    return (school: school, programs: programs);
  }

  Future<void> _replayPendingAction() async {
    if (!mounted) {
      return;
    }
    final bootstrap = AppScope.of(context);
    final pending = bootstrap.sessionStore.takePendingAuthAction(
      AppRoutes.schoolDetail,
    );
    if (pending == null) {
      return;
    }

    try {
      final screen = await _future;
      final school = screen?.school;
      final programs = screen?.programs ?? const <SchoolProgram>[];
      if (school == null) {
        return;
      }

      switch (pending.type) {
        case PendingAuthActionType.favoriteSchool:
          await bootstrap.schoolsRepository.toggleSchoolFavorite(
            schoolId: school.id,
            isFavorited: false,
          );
          _showMessage('已通过真实接口继续执行收藏动作。');
        case PendingAuthActionType.addFeaturedProgramToComparison:
          final program = programs.firstWhere(
            (item) => item.id == pending.targetId,
            orElse: () => programs.first,
          );
          await bootstrap.schoolsRepository.toggleProgramComparison(
            programId: program.id,
            isInComparison: false,
          );
          _showMessage('已通过真实接口继续执行对比动作。');
        case PendingAuthActionType.setFeaturedProgramAsTarget:
          final program = programs.firstWhere(
            (item) => item.id == pending.targetId,
            orElse: () => programs.first,
          );
          await bootstrap.schoolsRepository.setTargetProgram(
            school: school,
            program: program,
          );
          if (!mounted) {
            return;
          }
          Navigator.of(context).pushNamed(AppRoutes.planning);
      }
    } catch (error) {
      if (!mounted) {
        return;
      }
      _showMessage(_errorMessage(error));
    }
  }

  Future<void> _handleFavorite(SchoolDetail school) async {
    final bootstrap = AppScope.of(context);
    final sessionStore = bootstrap.sessionStore;
    if (!sessionStore.isLoggedIn) {
      sessionStore.stagePendingAuthAction(
        PendingAuthAction(
          routeName: AppRoutes.schoolDetail,
          type: PendingAuthActionType.favoriteSchool,
          targetId: school.id,
        ),
      );
      Navigator.of(context).pushNamed(
        AppRoutes.login,
        arguments: LoginRouteArgs(
          redirectTo: AppRoutes.schoolDetail,
          redirectArguments: widget.args,
        ),
      );
      return;
    }

    try {
      await bootstrap.schoolsRepository.toggleSchoolFavorite(
        schoolId: school.id,
        isFavorited: school.isFavorited,
      );
      _showMessage(school.isFavorited ? '已取消收藏。' : '已提交收藏请求。');
      _reload();
    } catch (error) {
      _showMessage(_errorMessage(error));
    }
  }

  Future<void> _handleCompare(SchoolProgram program) async {
    final bootstrap = AppScope.of(context);
    final sessionStore = bootstrap.sessionStore;
    if (!sessionStore.isLoggedIn) {
      sessionStore.stagePendingAuthAction(
        PendingAuthAction(
          routeName: AppRoutes.schoolDetail,
          type: PendingAuthActionType.addFeaturedProgramToComparison,
          targetId: program.id,
        ),
      );
      Navigator.of(context).pushNamed(
        AppRoutes.login,
        arguments: LoginRouteArgs(
          redirectTo: AppRoutes.schoolDetail,
          redirectArguments: widget.args,
        ),
      );
      return;
    }

    try {
      await bootstrap.schoolsRepository.toggleProgramComparison(
        programId: program.id,
        isInComparison: program.isInComparison,
      );
      _showMessage(program.isInComparison ? '已移出对比池。' : '已提交对比请求。');
      _reload();
    } catch (error) {
      _showMessage(_errorMessage(error));
    }
  }

  Future<void> _handleSetTarget(
    SchoolDetail school,
    SchoolProgram program,
  ) async {
    final bootstrap = AppScope.of(context);
    final sessionStore = bootstrap.sessionStore;
    if (!sessionStore.isLoggedIn) {
      sessionStore.stagePendingAuthAction(
        PendingAuthAction(
          routeName: AppRoutes.schoolDetail,
          type: PendingAuthActionType.setFeaturedProgramAsTarget,
          targetId: program.id,
        ),
      );
      Navigator.of(context).pushNamed(
        AppRoutes.login,
        arguments: LoginRouteArgs(
          redirectTo: AppRoutes.schoolDetail,
          redirectArguments: widget.args,
        ),
      );
      return;
    }

    try {
      await bootstrap.schoolsRepository.setTargetProgram(
        school: school,
        program: program,
      );
      if (!mounted) {
        return;
      }
      Navigator.of(context).pushNamed(AppRoutes.planning);
    } catch (error) {
      _showMessage(_errorMessage(error));
    }
  }

  void _reload() {
    setState(() {
      _future = _loadScreen(AppScope.of(context).schoolsRepository);
    });
  }

  String _errorMessage(Object? error) {
    if (error is FeatureUnavailableException) {
      return '${error.message}\n${error.nextSteps.join('\n')}';
    }
    return '$error';
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }
}

class _SchoolHero extends StatelessWidget {
  const _SchoolHero({
    required this.school,
    required this.featuredProgram,
    required this.onFavorite,
    required this.onCompare,
    required this.onSetTarget,
  });

  final SchoolDetail school;
  final SchoolProgram? featuredProgram;
  final VoidCallback onFavorite;
  final VoidCallback? onCompare;
  final VoidCallback? onSetTarget;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF153A35), Color(0xFF4F8B76)],
        ),
        borderRadius: BorderRadius.circular(32),
      ),
      child: Padding(
        padding: const EdgeInsets.all(22),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (school.schoolLevel != null)
                  Chip(label: Text(school.schoolLevel!)),
                if (school.schoolType != null)
                  Chip(label: Text(school.schoolType!)),
                Chip(label: Text(school.city)),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              school.name,
              style: Theme.of(
                context,
              ).textTheme.headlineMedium?.copyWith(color: Colors.white),
            ),
            const SizedBox(height: 8),
            Text(
              featuredProgram == null
                  ? '当前详情接口没有返回可选专业。'
                  : '${featuredProgram!.name} / ${featuredProgram!.degreeType}',
              style: Theme.of(
                context,
              ).textTheme.bodyLarge?.copyWith(color: const Color(0xFFD4EFE7)),
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: FilledButton.tonal(
                    onPressed: onFavorite,
                    child: Text(school.isFavorited ? '取消收藏' : '收藏院校'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton(
                    onPressed: onCompare,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Color(0xFFB6D6CF)),
                    ),
                    child: const Text('加入对比'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            FilledButton(
              onPressed: onSetTarget,
              child: const Text('设为目标并进入规划'),
            ),
          ],
        ),
      ),
    );
  }
}

class _HotProgramTile extends StatelessWidget {
  const _HotProgramTile({required this.program});

  final HotProgramSummary program;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFF8F4EC),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${program.departmentName ?? '未知院系'} / ${program.programName}',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            Text(
              '分数线 ${program.scoreLineSummary?.totalScore ?? '-'} / 报录比 ${program.applicationRatioSummary?.applicationRatio ?? '-'}',
            ),
          ],
        ),
      ),
    );
  }
}

class _ProgramTile extends StatelessWidget {
  const _ProgramTile({
    required this.program,
    required this.onCompare,
    required this.onSetTarget,
  });

  final SchoolProgram program;
  final VoidCallback onCompare;
  final VoidCallback onSetTarget;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFFCFAF5),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE6DDCE)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${program.name} / ${program.degreeType}',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 6),
            Text(program.departmentName ?? '暂无院系信息'),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (program.researchDirection != null)
                  Chip(label: Text(program.researchDirection!)),
                if (program.code != null) Chip(label: Text(program.code!)),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              '分数线 ${program.scoreLineLabel} / 报录比 ${program.applicationRatioLabel} / 复试比 ${program.interviewRatioLabel}',
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: onCompare,
                    child: const Text('加入对比'),
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
