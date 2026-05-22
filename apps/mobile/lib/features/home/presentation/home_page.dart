import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/app_tab.dart';
import '../../../core/models/main_journey_state.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/layout/responsive_breakpoints.dart';
import '../../../core/widgets/app_navigation_scaffold.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';
import '../../planning/data/planning_models.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
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
    final sessionStore = bootstrap.sessionStore;

    return AppNavigationScaffold(
      currentTab: AppTab.home,
      title: '首页',
      actions: [
        IconButton(
          onPressed: _refresh,
          tooltip: '刷新',
          icon: const Icon(Icons.refresh_rounded),
        ),
      ],
      child: AnimatedBuilder(
        animation: Listenable.merge([
          sessionStore,
          bootstrap.refreshStore,
          bootstrap.currentTargetStore,
        ]),
        builder: (context, _) {
          if (!sessionStore.isLoggedIn) {
            return RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: context.contentPadding(),
                children: [
                  SectionCard(
                    title: '主链路状态',
                    subtitle: '当前处于游客模式',
                    children: const [Text('登录后，首页会直接展示目标、计划和 Todo 的真实联动状态。')],
                  ),
                  const SizedBox(height: 16),
                  ResponsiveColumns(
                    children: [
                      EmptyStateCard(
                        title: '还没进入主链路',
                        message:
                            '你可以先浏览院校，也可以先登录，然后按“设目标 -> 生成计划 -> 查看 Todo”继续演示。',
                        actionLabel: '去登录',
                        onAction: () {
                          Navigator.of(context).pushNamed(AppRoutes.login);
                        },
                      ),
                      SectionCard(
                        title: '主入口',
                        children: [
                          ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: const Text('浏览院校'),
                            subtitle: const Text('先去院校页查看并选择目标。'),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () {
                              Navigator.of(
                                context,
                              ).pushNamed(AppRoutes.schools);
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            );
          }

          return FutureBuilder<PlanningSnapshot>(
            future: bootstrap.planningRepository.fetchPlanningSnapshot(),
            builder: (context, snapshot) {
              return RefreshIndicator(
                onRefresh: _refresh,
                child: ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: context.contentPadding(),
                  children: [
                    if (snapshot.hasError) ...[
                      EmptyStateCard(
                        title: '首页状态加载失败',
                        message:
                            '${_errorMessage(snapshot.error)}\n\n下拉刷新或点击重试后，会重新拉取主链路状态。',
                        actionLabel: '重试',
                        onAction: _refresh,
                      ),
                    ] else if (!snapshot.hasData) ...[
                      const _HomeLoading(),
                    ] else ...[
                      _HomeHero(snapshot: snapshot.data!),
                      const SizedBox(height: 16),
                      ResponsiveColumns(
                        children: [
                          _HomeJourneyStats(snapshot: snapshot.data!),
                          _HomePrimaryAction(snapshot: snapshot.data!),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SectionCard(
                        title: '继续操作',
                        children: [
                          ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: const Text('进入规划页'),
                            subtitle: const Text('查看计划详情、周安排和今日计划。'),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () {
                              Navigator.of(
                                context,
                              ).pushNamed(AppRoutes.planning);
                            },
                          ),
                          const Divider(),
                          ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: const Text('查看个人中心'),
                            subtitle: const Text('确认账号、目标和计划状态是否一致。'),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () {
                              Navigator.of(
                                context,
                              ).pushNamed(AppRoutes.profile);
                            },
                          ),
                        ],
                      ),
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

  String _errorMessage(Object? error) {
    if (error is FeatureUnavailableException) {
      return '${error.message}\n${error.nextSteps.join('\n')}';
    }
    return '$error';
  }
}

class _HomeHero extends StatelessWidget {
  const _HomeHero({required this.snapshot});

  final PlanningSnapshot snapshot;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF17473B), Color(0xFF886240)],
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
              snapshot.journeyState.summary,
              style: Theme.of(
                context,
              ).textTheme.bodyLarge?.copyWith(color: const Color(0xFFF2E8D9)),
            ),
          ],
        ),
      ),
    );
  }
}

class _HomePrimaryAction extends StatelessWidget {
  const _HomePrimaryAction({required this.snapshot});

  final PlanningSnapshot snapshot;

  @override
  Widget build(BuildContext context) {
    switch (snapshot.journeyState) {
      case MainJourneyState.noTarget:
        return EmptyStateCard(
          title: '先完成目标设置',
          message: '设好目标之后，规划页才会继续向下拉取真实计划数据。',
          actionLabel: '去选学校',
          onAction: () {
            Navigator.of(context).pushNamed(AppRoutes.schools);
          },
        );
      case MainJourneyState.noPlan:
        return EmptyStateCard(
          title: '目标已同步，还没有计划',
          message: '当前首页已经确认目标可用，下一步去规划页生成计划即可。',
          actionLabel: '去规划页',
          onAction: () {
            Navigator.of(context).pushNamed(AppRoutes.planning);
          },
        );
      case MainJourneyState.hasPlan:
        return SectionCard(
          title: '演示建议',
          subtitle: '主链路已经进入可验收状态。',
          children: [
            const Text('可以直接进入规划页查看周安排，或进入 Todo 继续演示今天的执行闭环。'),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () {
                Navigator.of(context).pushNamed(AppRoutes.todo);
              },
              child: const Text('查看今日 Todo'),
            ),
            const SizedBox(height: 10),
            OutlinedButton(
              onPressed: () {
                Navigator.of(context).pushNamed(AppRoutes.todo);
              },
              child: const Text('去打卡'),
            ),
          ],
        );
    }
  }
}

class _HomeJourneyStats extends StatelessWidget {
  const _HomeJourneyStats({required this.snapshot});

  final PlanningSnapshot snapshot;

  @override
  Widget build(BuildContext context) {
    final tiles = [
      _HomeStatTile(label: '当前状态', value: snapshot.journeyState.label),
      _HomeStatTile(label: '当前目标', value: snapshot.headline),
      _HomeStatTile(label: '状态说明', value: snapshot.journeyState.summary),
      _HomeStatTile(
        label: '建议动作',
        value: _HomeJourneyStats._nextStepText(snapshot.journeyState),
      ),
    ];

    return SectionCard(
      title: '主链路状态',
      subtitle: snapshot.journeyState.title,
      children: [
        if (context.isCompact)
          ...tiles.map(
            (tile) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: tile,
            ),
          )
        else
          ResponsiveColumns(children: tiles),
      ],
    );
  }

  static String _nextStepText(MainJourneyState state) {
    switch (state) {
      case MainJourneyState.noTarget:
        return '去院校页设置目标';
      case MainJourneyState.noPlan:
        return '去规划页生成计划';
      case MainJourneyState.hasPlan:
        return '继续查看今日 Todo';
    }
  }
}

class _HomeStatTile extends StatelessWidget {
  const _HomeStatTile({required this.label, required this.value});

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

class _HomeLoading extends StatelessWidget {
  const _HomeLoading();

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
