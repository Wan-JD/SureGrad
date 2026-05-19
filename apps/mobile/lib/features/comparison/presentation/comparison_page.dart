import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_tab.dart';
import '../../../core/models/feature_list_item.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/widgets/app_navigation_scaffold.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';

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
      child: FutureBuilder<List<FeatureListItem>>(
        future: repository.fetchComparisonResult(),
        builder: (context, snapshot) {
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (snapshot.hasError)
                EmptyStateCard(
                  title: '对比中心不可用',
                  message: _errorMessage(snapshot.error),
                  actionLabel: '重试',
                  onAction: () => setState(() {}),
                )
              else if (!snapshot.hasData)
                const _PageLoading()
              else if (snapshot.data!.isEmpty)
                const EmptyStateCard(
                  title: '当前没有对比结果',
                  message: '真实接口已经接上，只是当前没有返回可展示的对比项。',
                )
              else
                SectionCard(
                  title: '真实对比结果',
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
