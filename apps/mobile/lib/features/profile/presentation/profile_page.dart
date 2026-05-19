import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/app_tab.dart';
import '../../../core/network/api_exception.dart';
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
  @override
  Widget build(BuildContext context) {
    final bootstrap = AppScope.of(context);
    final sessionStore = bootstrap.sessionStore;

    return AppNavigationScaffold(
      currentTab: AppTab.profile,
      title: '我的',
      child: AnimatedBuilder(
        animation: Listenable.merge([
          sessionStore,
          bootstrap.refreshStore,
          bootstrap.currentTargetStore,
        ]),
        builder: (context, _) {
          if (!sessionStore.isLoggedIn) {
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                EmptyStateCard(
                  title: '未登录',
                  message: '登录后，这里会展示真实的 /users/me 和 /user-targets/current 结果。',
                  actionLabel: '去登录',
                  onAction: () {
                    Navigator.of(context).pushNamed(AppRoutes.login);
                  },
                ),
              ],
            );
          }

          return FutureBuilder<ProfileScreenData>(
            future: bootstrap.profileRepository.fetchProfile(),
            builder: (context, snapshot) {
              return ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (snapshot.hasError)
                    EmptyStateCard(
                      title: '个人中心加载失败',
                      message: _errorMessage(snapshot.error),
                      actionLabel: '重试',
                      onAction: () => setState(() {}),
                    )
                  else if (!snapshot.hasData)
                    const _ProfileLoading()
                  else ...[
                    _ProfileHero(data: snapshot.data!),
                    const SizedBox(height: 16),
                    SectionCard(
                      title: '账号信息',
                      children: [
                        _ProfileRow(
                          label: '手机号',
                          value: snapshot.data!.me.phoneMasked ?? '-',
                        ),
                        _ProfileRow(
                          label: '昵称',
                          value: snapshot.data!.me.nickname ?? '未设置',
                        ),
                        _ProfileRow(
                          label: '档案完成',
                          value: snapshot.data!.me.profileCompleted ? '是' : '否',
                        ),
                        _ProfileRow(
                          label: '当前目标',
                          value: snapshot.data!.targetHeadline,
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
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
            Text(
              data.targetHeadline,
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(color: Colors.white),
            ),
            const SizedBox(height: 10),
            Text(
              '这里不再拼 mock 收藏数，而是展示用户、目标和计划是否激活这些真实状态。',
              style: Theme.of(
                context,
              ).textTheme.bodyLarge?.copyWith(color: const Color(0xFFF0E7DB)),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                _MetricChip(
                  label: 'Active Target',
                  value: data.me.hasActiveTarget ? 'Yes' : 'No',
                ),
                _MetricChip(
                  label: 'Active Plan',
                  value: data.me.hasActivePlan ? 'Yes' : 'No',
                ),
                _MetricChip(
                  label: 'Profile',
                  value: data.me.profileCompleted ? 'Done' : 'Pending',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _MetricChip extends StatelessWidget {
  const _MetricChip({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFFE8D8C6))),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
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
