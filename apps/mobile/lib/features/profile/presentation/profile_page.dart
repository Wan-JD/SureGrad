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
import '../data/profile_models.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
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
      currentTab: AppTab.profile,
      title: '我的',
      actions: [
        if (sessionStore.isLoggedIn)
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
                  EmptyStateCard(
                    title: '还没有登录',
                    message: '登录后，这里会展示账号、目标和计划的真实状态，并和首页、规划页保持一致。',
                    actionLabel: '去登录',
                    onAction: () {
                      Navigator.of(context).pushNamed(AppRoutes.login);
                    },
                  ),
                ],
              ),
            );
          }

          return FutureBuilder<ProfileScreenData>(
            future: bootstrap.profileRepository.fetchProfile(),
            builder: (context, snapshot) {
              return RefreshIndicator(
                onRefresh: _refresh,
                child: ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: context.contentPadding(),
                  children: [
                    if (snapshot.hasError) ...[
                      _JourneyErrorCard(
                        title: '个人中心加载失败',
                        message: _errorMessage(snapshot.error),
                        onRetry: _refresh,
                      ),
                    ] else if (!snapshot.hasData) ...[
                      const _ProfileLoading(),
                    ] else ...[
                      _ProfileHero(data: snapshot.data!),
                      const SizedBox(height: 16),
                      ResponsiveColumns(
                        children: [
                          SectionCard(
                            title: '主链路状态',
                            subtitle: snapshot.data!.journeyState.title,
                            children: [
                              _ProfileRow(
                                label: '当前状态',
                                value: snapshot.data!.journeyState.label,
                              ),
                              _ProfileRow(
                                label: '当前目标',
                                value: snapshot.data!.targetHeadline,
                              ),
                              _ProfileRow(
                                label: '档案完成',
                                value: snapshot.data!.me.profileCompleted
                                    ? '是'
                                    : '否',
                              ),
                              _ProfileRow(
                                label: '建议动作',
                                value: _nextStepText(
                                  snapshot.data!.journeyState,
                                ),
                              ),
                            ],
                          ),
                          _ProfileStateAction(data: snapshot.data!),
                        ],
                      ),
                      const SizedBox(height: 16),
                      ResponsiveColumns(
                        children: [
                          SectionCard(
                            title: '账号信息',
                            children: [
                              _ProfileRow(
                                label: '账号',
                                value: snapshot.data!.me.accountLabel ??
                                    snapshot.data!.me.phoneMasked ??
                                    snapshot.data!.me.emailMasked ??
                                    '-',
                              ),
                              _ProfileRow(
                                label: '昵称',
                                value: snapshot.data!.me.nickname ?? '未设置',
                              ),
                              _ProfileRow(
                                label: '活跃目标',
                                value: snapshot.data!.me.hasActiveTarget
                                    ? '是'
                                    : '否',
                              ),
                              _ProfileRow(
                                label: '活跃计划',
                                value: snapshot.data!.me.hasActivePlan
                                    ? '是'
                                    : '否',
                              ),
                            ],
                          ),
                          SectionCard(
                            title: '我的入口',
                            children: [
                          ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: const Text('我的收藏'),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () {
                              Navigator.of(
                                context,
                              ).pushNamed(AppRoutes.favorites);
                            },
                          ),
                          const Divider(),
                          ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: const Text('专业对比'),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () {
                              Navigator.of(
                                context,
                              ).pushNamed(AppRoutes.comparison);
                            },
                          ),
                          const Divider(),
                          ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: const Text('提醒中心'),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () {
                              Navigator.of(
                                context,
                              ).pushNamed(AppRoutes.reminders);
                            },
                          ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      OutlinedButton(
                        onPressed: () {
                          sessionStore.signOut();
                          bootstrap.currentTargetStore.clear();
                          Navigator.of(context).pushNamedAndRemoveUntil(
                            AppRoutes.splash,
                            (_) => false,
                          );
                        },
                        child: const Text('退出登录'),
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

  String _nextStepText(MainJourneyState state) {
    switch (state) {
      case MainJourneyState.noTarget:
        return '去院校页设置目标';
      case MainJourneyState.noPlan:
        return '去规划页生成计划';
      case MainJourneyState.hasPlan:
        return '继续查看今日 Todo';
    }
  }

  String _errorMessage(Object? error) {
    if (error is FeatureUnavailableException) {
      return '${error.message}\n${error.nextSteps.join('\n')}';
    }
    return '$error';
  }
}

class _ProfileHero extends StatelessWidget {
  const _ProfileHero({required this.data});

  final ProfileScreenData data;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF153E38), Color(0xFF7B6145)],
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
                data.journeyState.label,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              data.targetHeadline,
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(color: Colors.white),
            ),
            const SizedBox(height: 10),
            Text(
              data.journeyState.summary,
              style: Theme.of(
                context,
              ).textTheme.bodyLarge?.copyWith(color: const Color(0xFFF0E7DB)),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileStateAction extends StatelessWidget {
  const _ProfileStateAction({required this.data});

  final ProfileScreenData data;

  @override
  Widget build(BuildContext context) {
    switch (data.journeyState) {
      case MainJourneyState.noTarget:
        return EmptyStateCard(
          title: '目标还没设好',
          message: '先去院校页设置目标，首页和规划页才会继续向下同步真实状态。',
          actionLabel: '去选学校',
          onAction: () {
            Navigator.of(context).pushNamed(AppRoutes.schools);
          },
        );
      case MainJourneyState.noPlan:
        return EmptyStateCard(
          title: '目标已就位，还没有计划',
          message: '当前账号信息已经同步完成，接下来去规划页生成第一版学习计划即可。',
          actionLabel: '去规划页',
          onAction: () {
            Navigator.of(context).pushNamed(AppRoutes.planning);
          },
        );
      case MainJourneyState.hasPlan:
        return SectionCard(
          title: '当前进度',
          subtitle: '主链路已经连通，可以直接继续执行。',
          children: [
            const Text('首页、规划页和今日 Todo 会按真实状态继续联动。'),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () {
                Navigator.of(context).pushNamed(AppRoutes.todo);
              },
              child: const Text('查看今日 Todo'),
            ),
          ],
        );
    }
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
    return EmptyStateCard(
      title: title,
      message: '$message\n\n下拉刷新或点击重试后，会重新拉取账号和目标状态。',
      actionLabel: '重试',
      onAction: onRetry,
    );
  }
}

class _ProfileRow extends StatelessWidget {
  const _ProfileRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 100, child: Text(label)),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}

class _ProfileLoading extends StatelessWidget {
  const _ProfileLoading();

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
