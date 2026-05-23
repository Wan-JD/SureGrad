class ResourceDetail {
  const ResourceDetail({
    required this.resourceId,
    required this.title,
    required this.resourceType,
    this.subjectId,
    this.subjectName,
    required this.stageTag,
    this.providerName,
    this.summary,
    this.usageAdvice,
    required this.sourceUrl,
    required this.isPublicLegal,
    required this.isFavorited,
  });

  final String resourceId;
  final String title;
  final String resourceType;
  final String? subjectId;
  final String? subjectName;
  final String stageTag;
  final String? providerName;
  final String? summary;
  final String? usageAdvice;
  final String sourceUrl;
  final bool isPublicLegal;
  final bool isFavorited;

  factory ResourceDetail.fromJson(Map<String, dynamic> json) {
    return ResourceDetail(
      resourceId: json['resourceId'] as String? ?? '',
      title: json['title'] as String? ?? '未命名资料',
      resourceType: json['resourceType'] as String? ?? 'public_resource',
      subjectId: json['subjectId'] as String?,
      subjectName: json['subjectName'] as String?,
      stageTag: json['stageTag'] as String? ?? 'foundation',
      providerName: json['providerName'] as String?,
      summary: json['summary'] as String?,
      usageAdvice: json['usageAdvice'] as String?,
      sourceUrl: json['sourceUrl'] as String? ?? '',
      isPublicLegal: json['isPublicLegal'] as bool? ?? true,
      isFavorited: json['isFavorited'] as bool? ?? false,
    );
  }

  String get resourceTypeLabel {
    switch (resourceType) {
      case 'course':
        return '网课';
      case 'book':
        return '参考书';
      case 'past_exam':
        return '真题';
      case 'public_resource':
        return '公开资源';
      case 'article':
        return '文章';
      default:
        return resourceType.isEmpty ? '资料' : resourceType;
    }
  }

  String get stageTagLabel {
    switch (stageTag) {
      case 'foundation':
        return '基础阶段';
      case 'intensive':
        return '强化阶段';
      case 'final':
        return '冲刺阶段';
      case 'interview':
        return '复试阶段';
      default:
        return stageTag.isEmpty ? '阶段待补充' : stageTag;
    }
  }

  String get summaryLabel => summary?.trim().isNotEmpty == true ? summary!.trim() : '待补充';

  String get usageAdviceLabel =>
      usageAdvice?.trim().isNotEmpty == true ? usageAdvice!.trim() : '待补充';

  String get providerLabel =>
      providerName?.trim().isNotEmpty == true ? providerName!.trim() : '待补充';

  String get subjectLabel =>
      subjectName?.trim().isNotEmpty == true ? subjectName!.trim() : '待补充';
}
