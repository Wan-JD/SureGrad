import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/resource_detail_route_args.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';
import '../data/resource_models.dart';
import '../data/resources_repository.dart';

class ResourceDetailPage extends StatefulWidget {
  const ResourceDetailPage({super.key, required this.args});

  final ResourceDetailRouteArgs args;

  @override
  State<ResourceDetailPage> createState() => _ResourceDetailPageState();
}

class _ResourceDetailPageState extends State<ResourceDetailPage> {
  Future<ResourceDetail>? _future;
  String? _loadedResourceId;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_loadedResourceId != widget.args.resourceId) {
      _loadedResourceId = widget.args.resourceId;
      _future = _load(AppScope.of(context).resourcesRepository);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<ResourceDetail>(
      future: _future,
      builder: (context, snapshot) {
        final detail = snapshot.data;

        return Scaffold(
          appBar: AppBar(
            title: Text(detail?.title ?? widget.args.resourceTitle ?? '资料详情'),
          ),
          body: SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
              children: [
                if (snapshot.hasError)
                  EmptyStateCard(
                    title: '资料详情加载失败',
                    message: _errorMessage(snapshot.error),
                    actionLabel: '重试',
                    onAction: _reload,
                  )
                else if (!snapshot.hasData)
                  const _DetailLoading()
                else if (detail == null)
                  const EmptyStateCard(
                    title: '资料不存在',
                    message: '当前资料详情没有从真实接口拿到结果。',
                  )
                else ...[
                  _ResourceHero(detail: detail),
                  const SizedBox(height: 16),
                  SectionCard(
                    title: '资料简介',
                    subtitle: '来自 /study-resources/{id} 的 summary 字段。',
                    children: [Text(detail.summaryLabel)],
                  ),
                  const SizedBox(height: 16),
                  SectionCard(
                    title: '使用建议',
                    subtitle: '适合在规划页制定节奏前先确认用法。',
                    children: [Text(detail.usageAdviceLabel)],
                  ),
                  const SizedBox(height: 16),
                  SectionCard(
                    title: '来源链接',
                    subtitle: '优先展示公开合法来源；链接失效时会保留地址文本。',
                    children: [
                      if (detail.sourceUrl.trim().isEmpty)
                        const Text('链接待更新')
                      else
                        Text(detail.sourceUrl),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    detail.isPublicLegal
                        ? '该资料已标记为公开合法来源。'
                        : '该资料尚未标记为公开合法来源，请谨慎使用。',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Future<ResourceDetail> _load(ResourcesRepository repository) {
    return repository.fetchResourceDetail(widget.args.resourceId);
  }

  void _reload() {
    setState(() {
      _future = _load(AppScope.of(context).resourcesRepository);
    });
  }

  String _errorMessage(Object? error) {
    if (error is ApiException && error.statusCode == 404) {
      return '资料不存在或已下线，请返回列表重新选择。';
    }
    if (error is FeatureUnavailableException) {
      return '${error.message}\n${error.nextSteps.join('\n')}';
    }
    return '$error';
  }
}

class _ResourceHero extends StatelessWidget {
  const _ResourceHero({required this.detail});

  final ResourceDetail detail;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF125B52), Color(0xFF1E8578)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              detail.title,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _HeroChip(label: detail.resourceTypeLabel),
                _HeroChip(label: detail.stageTagLabel),
                if (detail.isPublicLegal) const _HeroChip(label: '公开合法'),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              '${detail.subjectLabel} · ${detail.providerLabel}',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.white.withValues(alpha: 0.92),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HeroChip extends StatelessWidget {
  const _HeroChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Text(
          label,
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
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
      height: 320,
      decoration: BoxDecoration(
        color: const Color(0xFFEDE7DB),
        borderRadius: BorderRadius.circular(24),
      ),
    );
  }
}
