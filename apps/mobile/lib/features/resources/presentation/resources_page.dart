import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_tab.dart';
import '../../../core/models/feature_list_item.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/widgets/app_navigation_scaffold.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';

class ResourcesPage extends StatefulWidget {
  const ResourcesPage({super.key});

  @override
  State<ResourcesPage> createState() => _ResourcesPageState();
}

class _ResourcesPageState extends State<ResourcesPage> {
  @override
  Widget build(BuildContext context) {
    final repository = AppScope.of(context).resourcesRepository;

    return AppNavigationScaffold(
      currentTab: AppTab.resources,
      title: '资料',
      child: FutureBuilder<List<FeatureListItem>>(
        future: repository.fetchResources(),
        builder: (context, snapshot) {
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const SectionCard(
                title: '备考资料',
                subtitle: '这里集中展示可直接查看的参考内容，方便你在择校和规划之间快速切换。',
                children: [
                  Text('优先查看与你当前目标相关的内容。'),
                  SizedBox(height: 6),
                  Text('如果资料暂时为空，可以稍后刷新再次确认。'),
                ],
              ),
              const SizedBox(height: 16),
              if (snapshot.hasError)
                EmptyStateCard(
                  title: '资料中心暂时不可用',
                  message: _errorMessage(snapshot.error),
                  actionLabel: '重试',
                  onAction: () => setState(() {}),
                )
              else if (!snapshot.hasData)
                const _PageLoading()
              else if (snapshot.data!.isEmpty)
                const EmptyStateCard(
                  title: '暂时还没有资料',
                  message: '当前还没有可展示的内容，稍后刷新看看，或先继续完成择校与规划。',
                )
              else
                SectionCard(
                  title: '可用内容',
                  subtitle: '根据当前返回结果整理展示，进入备考时可以先从这里补充信息。',
                  children: snapshot.data!
                      .map(
                        (item) => ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(item.title),
                          subtitle: Text(item.subtitle),
                          trailing: item.footnote == null
                              ? null
                              : Text(item.footnote!),
                        ),
                      )
                      .toList(),
                ),
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

class _PageLoading extends StatelessWidget {
  const _PageLoading();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 220,
      decoration: BoxDecoration(
        color: const Color(0xFFEDE7DB),
        borderRadius: BorderRadius.circular(24),
      ),
    );
  }
}
