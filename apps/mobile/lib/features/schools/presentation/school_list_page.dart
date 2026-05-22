import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/app_tab.dart';
import '../../../app/navigation/login_route_args.dart';
import '../../../app/navigation/school_detail_route_args.dart';
import '../../../core/layout/responsive_breakpoints.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/state/app_session_store.dart';
import '../../../core/widgets/app_navigation_scaffold.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';
import '../data/school_models.dart';

class SchoolListPage extends StatefulWidget {
  const SchoolListPage({super.key});

  @override
  State<SchoolListPage> createState() => _SchoolListPageState();
}

class _SchoolListPageState extends State<SchoolListPage> {
  final TextEditingController _searchController = TextEditingController();
  String _cityFilter = '全部';
  String _degreeFilter = '全部';
  bool? _mathRequired;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _replayPendingFavorite();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bootstrap = AppScope.of(context);
    final repository = bootstrap.schoolsRepository;
    final sessionStore = bootstrap.sessionStore;

    return AppNavigationScaffold(
      currentTab: AppTab.schools,
      title: '择校',
      actions: [
        IconButton(
          tooltip: '收藏',
          onPressed: () {
            Navigator.of(context).pushNamed(
              sessionStore.isLoggedIn ? AppRoutes.favorites : AppRoutes.login,
              arguments: sessionStore.isLoggedIn
                  ? null
                  : const LoginRouteArgs(redirectTo: AppRoutes.favorites),
            );
          },
          icon: const Icon(Icons.bookmark_outline_rounded),
        ),
      ],
      child: AnimatedBuilder(
        animation: Listenable.merge([bootstrap.refreshStore, sessionStore]),
        builder: (context, _) {
          return FutureBuilder<List<SchoolSummary>>(
            future: repository.fetchSchools(
              query: _searchController.text.trim(),
              cityFilter: _cityFilter,
              degreeFilter: _degreeFilter,
              mathRequired: _mathRequired,
            ),
            builder: (context, snapshot) {
              return ListView(
                padding: context.contentPadding(),
                children: [
                  const _ListHero(),
                  const SizedBox(height: 16),
                  SectionCard(
                    title: '筛选',
                    subtitle: '这里已经直接把参数发给真实 /schools 接口。',
                    children: [
                      TextField(
                        controller: _searchController,
                        onChanged: (_) => setState(() {}),
                        decoration: InputDecoration(
                          hintText: '搜索学校 / 城市 / 专业',
                          prefixIcon: const Icon(Icons.search_rounded),
                          suffixIcon: _searchController.text.isEmpty
                              ? null
                              : IconButton(
                                  onPressed: () {
                                    _searchController.clear();
                                    setState(() {});
                                  },
                                  icon: const Icon(Icons.close_rounded),
                                ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      _FilterWrap(
                        title: '城市',
                        values: const ['全部', '重庆', '广州', '长春'],
                        selected: _cityFilter,
                        onSelected: (value) {
                          setState(() => _cityFilter = value);
                        },
                      ),
                      const SizedBox(height: 10),
                      _FilterWrap(
                        title: '学位',
                        values: const ['全部', 'academic', 'professional'],
                        selected: _degreeFilter,
                        onSelected: (value) {
                          setState(() => _degreeFilter = value);
                        },
                      ),
                      const SizedBox(height: 10),
                      _FilterWrap(
                        title: '数学',
                        values: const ['全部', '考数学', '不考数学'],
                        selected: _mathRequired == null
                            ? '全部'
                            : _mathRequired!
                            ? '考数学'
                            : '不考数学',
                        onSelected: (value) {
                          setState(() {
                            if (value == '考数学') {
                              _mathRequired = true;
                            } else if (value == '不考数学') {
                              _mathRequired = false;
                            } else {
                              _mathRequired = null;
                            }
                          });
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (repository.recentSchools.isNotEmpty) ...[
                    SectionCard(
                      title: '最近浏览',
                      subtitle: '这是前端的轻量会话内记录，不伪造任何后端业务状态。',
                      children: [
                        SizedBox(
                          height: 132,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: repository.recentSchools.length,
                            separatorBuilder: (_, _) =>
                                const SizedBox(width: 12),
                            itemBuilder: (context, index) {
                              final school = repository.recentSchools[index];
                              return _RecentSchoolCard(school: school);
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                  ],
                  if (snapshot.hasError)
                    EmptyStateCard(
                      title: '院校列表加载失败',
                      message: _errorMessage(snapshot.error),
                      actionLabel: '重试',
                      onAction: () => setState(() {}),
                    )
                  else if (!snapshot.hasData)
                    const _LoadingGroup()
                  else if (snapshot.data!.isEmpty)
                    EmptyStateCard(
                      title: '没有匹配结果',
                      message: '可以先清空筛选，或者换个关键词重新搜一轮。',
                      actionLabel: '清空筛选',
                      onAction: () {
                        _searchController.clear();
                        setState(() {
                          _cityFilter = '全部';
                          _degreeFilter = '全部';
                          _mathRequired = null;
                        });
                      },
                    )
                  else
                    ResponsiveColumns(
                      children: snapshot.data!
                          .map(
                            (school) => _SchoolCard(
                              school: school,
                              onOpen: () {
                                Navigator.of(context).pushNamed(
                                  AppRoutes.schoolDetail,
                                  arguments: SchoolDetailRouteArgs(
                                    schoolId: school.id,
                                    schoolName: school.name,
                                  ),
                                );
                              },
                              onFavorite: () => _handleFavorite(school),
                            ),
                          )
                          .toList(),
                    ),
                ],
              );
            },
          );
        },
      ),
    );
  }

  Future<void> _replayPendingFavorite() async {
    final bootstrap = AppScope.of(context);
    final pending = bootstrap.sessionStore.takePendingAuthAction(
      AppRoutes.schools,
    );
    if (pending == null ||
        pending.type != PendingAuthActionType.favoriteSchool) {
      return;
    }

    try {
      await bootstrap.schoolsRepository.toggleSchoolFavorite(
        schoolId: pending.targetId,
        isFavorited: false,
      );
      if (!mounted) {
        return;
      }
      _showMessage('已通过真实接口继续执行收藏动作。');
    } catch (error) {
      if (!mounted) {
        return;
      }
      _showMessage(_errorMessage(error));
    }
  }

  Future<void> _handleFavorite(SchoolSummary school) async {
    final bootstrap = AppScope.of(context);
    final sessionStore = bootstrap.sessionStore;
    if (!sessionStore.isLoggedIn) {
      sessionStore.stagePendingAuthAction(
        PendingAuthAction(
          routeName: AppRoutes.schools,
          type: PendingAuthActionType.favoriteSchool,
          targetId: school.id,
        ),
      );
      Navigator.of(context).pushNamed(
        AppRoutes.login,
        arguments: const LoginRouteArgs(redirectTo: AppRoutes.schools),
      );
      return;
    }

    try {
      await bootstrap.schoolsRepository.toggleSchoolFavorite(
        schoolId: school.id,
        isFavorited: school.isFavorited,
      );
      _showMessage(school.isFavorited ? '已取消收藏。' : '已提交收藏请求。');
    } catch (error) {
      _showMessage(_errorMessage(error));
    }
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

class _ListHero extends StatelessWidget {
  const _ListHero();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF173C37), Color(0xFF3D826C)],
        ),
        borderRadius: BorderRadius.circular(32),
      ),
      child: const Padding(
        padding: EdgeInsets.all(22),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '先把候选池缩窄，再决定要不要冲。',
              style: TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.w700,
                height: 1.1,
              ),
            ),
            SizedBox(height: 10),
            Text(
              '这一页现在直接消费真实 /schools 响应，不再走 MockAppStore。',
              style: TextStyle(color: Color(0xFFD2EDE5), fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterWrap extends StatelessWidget {
  const _FilterWrap({
    required this.title,
    required this.values,
    required this.selected,
    required this.onSelected,
  });

  final String title;
  final List<String> values;
  final String selected;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: values
              .map(
                (value) => ChoiceChip(
                  label: Text(value),
                  selected: selected == value,
                  onSelected: (_) => onSelected(value),
                ),
              )
              .toList(),
        ),
      ],
    );
  }
}

class _RecentSchoolCard extends StatelessWidget {
  const _RecentSchoolCard({required this.school});

  final SchoolSummary school;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(24),
      onTap: () {
        Navigator.of(context).pushNamed(
          AppRoutes.schoolDetail,
          arguments: SchoolDetailRouteArgs(
            schoolId: school.id,
            schoolName: school.name,
          ),
        );
      },
      child: Ink(
        width: 220,
        decoration: BoxDecoration(
          color: const Color(0xFFFCF8EF),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFE5DCCB)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(school.name, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 6),
              Text(
                '${school.city} / ${school.primaryProgramLabel}',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const Spacer(),
              Text(
                school.scoreLineLabel,
                style: const TextStyle(
                  color: Color(0xFF125B52),
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SchoolCard extends StatelessWidget {
  const _SchoolCard({
    required this.school,
    required this.onOpen,
    required this.onFavorite,
  });

  final SchoolSummary school;
  final VoidCallback onOpen;
  final VoidCallback onFavorite;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: const Color(0xFFE3DCD0)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
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
                      Text(
                        school.name,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 6),
                      Text('${school.city} / ${school.province}'),
                    ],
                  ),
                ),
                IconButton.filledTonal(
                  onPressed: onFavorite,
                  icon: Icon(
                    school.isFavorited
                        ? Icons.bookmark_rounded
                        : Icons.bookmark_border_rounded,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: school.tags
                  .map((tag) => Chip(label: Text(tag)))
                  .toList(),
            ),
            const SizedBox(height: 14),
            Text(
              school.primaryProgramLabel,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _MetricTile(
                    label: '分数线',
                    value: school.scoreLineLabel,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _MetricTile(
                    label: '报录比',
                    value: school.applicationRatioLabel,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _MetricTile(
                    label: '缺失项',
                    value: '${school.missingFlags.length}',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            FilledButton(onPressed: onOpen, child: const Text('查看详情')),
          ],
        ),
      ),
    );
  }
}

class _MetricTile extends StatelessWidget {
  const _MetricTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFF8F5EE),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(color: const Color(0xFF125B52)),
            ),
          ],
        ),
      ),
    );
  }
}

class _LoadingGroup extends StatelessWidget {
  const _LoadingGroup();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List<Widget>.generate(
        2,
        (_) => Padding(
          padding: const EdgeInsets.only(bottom: 14),
          child: Container(
            height: 220,
            decoration: BoxDecoration(
              color: const Color(0xFFEDE7DB),
              borderRadius: BorderRadius.circular(28),
            ),
          ),
        ),
      ),
    );
  }
}
