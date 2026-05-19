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
              if (snapshot.hasError)
                EmptyStateCard(
                  title: '资料中心不可用',
                  message: _errorMessage(snapshot.error),
                  actionLabel: '重试',
                  onAction: () => setState(() {}),
                )
              else if (!snapshot.hasData)
                const _PageLoading()
              else if (snapshot.data!.isEmpty)
                const EmptyStateCard(
                  title: '还没有资料',
                  message: '真实接口已经接上，只是当前没有返回资料数据。',
                )
              else
                SectionCard(
                  title: '真实资料列表',
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
