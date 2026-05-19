class TodayCheckinSnapshot {
  const TodayCheckinSnapshot({
    required this.checkinId,
    required this.checkinDate,
    required this.totalStudyMinutes,
    required this.completedTodoCount,
    required this.primarySubjectId,
    required this.primarySubjectName,
    required this.reflection,
    required this.moodTag,
    required this.isCheckedIn,
  });

  final String? checkinId;
  final String checkinDate;
  final int? totalStudyMinutes;
  final int completedTodoCount;
  final String? primarySubjectId;
  final String? primarySubjectName;
  final String? reflection;
  final String? moodTag;
  final bool isCheckedIn;

  factory TodayCheckinSnapshot.fromJson(Map<String, dynamic> json) {
    return TodayCheckinSnapshot(
      checkinId: json['checkinId'] as String?,
      checkinDate: json['checkinDate'] as String? ?? '',
      totalStudyMinutes: (json['totalStudyMinutes'] as num?)?.toInt(),
      completedTodoCount: (json['completedTodoCount'] as num?)?.toInt() ?? 0,
      primarySubjectId: json['primarySubjectId'] as String?,
      primarySubjectName: json['primarySubjectName'] as String?,
      reflection: json['reflection'] as String?,
      moodTag: json['moodTag'] as String?,
      isCheckedIn: json['isCheckedIn'] as bool? ?? false,
    );
  }
}

class StudyStatsOverview {
  const StudyStatsOverview({
    required this.todayStudyMinutes,
    required this.weekStudyMinutes,
    required this.continuousCheckinDays,
    required this.todoCompletionRate,
    required this.todayPendingTodoCount,
    required this.currentTargetName,
    required this.currentPlanTitle,
    required this.subjectDistribution,
  });

  final int todayStudyMinutes;
  final int weekStudyMinutes;
  final int continuousCheckinDays;
  final double todoCompletionRate;
  final int todayPendingTodoCount;
  final String? currentTargetName;
  final String? currentPlanTitle;
  final List<SubjectDistributionItem> subjectDistribution;

  factory StudyStatsOverview.fromJson(Map<String, dynamic> json) {
    final distribution =
        json['subjectDistribution'] as List<dynamic>? ?? const [];
    final currentTarget = json['currentTarget'];
    final currentPlan = json['currentPlan'];
    return StudyStatsOverview(
      todayStudyMinutes: (json['todayStudyMinutes'] as num?)?.toInt() ?? 0,
      weekStudyMinutes: (json['weekStudyMinutes'] as num?)?.toInt() ?? 0,
      continuousCheckinDays:
          (json['continuousCheckinDays'] as num?)?.toInt() ?? 0,
      todoCompletionRate: (json['todoCompletionRate'] as num?)?.toDouble() ?? 0,
      todayPendingTodoCount:
          (json['todayPendingTodoCount'] as num?)?.toInt() ?? 0,
      currentTargetName: currentTarget is Map<String, dynamic>
          ? currentTarget['programName'] as String? ??
                currentTarget['schoolName'] as String?
          : null,
      currentPlanTitle: currentPlan is Map<String, dynamic>
          ? currentPlan['title'] as String?
          : null,
      subjectDistribution: distribution
          .whereType<Map<String, dynamic>>()
          .map(SubjectDistributionItem.fromJson)
          .toList(growable: false),
    );
  }
}

class SubjectDistributionItem {
  const SubjectDistributionItem({
    required this.subjectId,
    required this.subjectName,
    required this.studyMinutes,
    required this.ratio,
  });

  final String? subjectId;
  final String? subjectName;
  final int studyMinutes;
  final double ratio;

  factory SubjectDistributionItem.fromJson(Map<String, dynamic> json) {
    return SubjectDistributionItem(
      subjectId: json['subjectId'] as String?,
      subjectName: json['subjectName'] as String?,
      studyMinutes: (json['studyMinutes'] as num?)?.toInt() ?? 0,
      ratio: (json['ratio'] as num?)?.toDouble() ?? 0,
    );
  }
}

class CreateCheckinResult {
  const CreateCheckinResult({
    required this.checkinId,
    required this.checkinDate,
    required this.continuousDays,
    required this.todayStudyMinutes,
  });

  final String checkinId;
  final String checkinDate;
  final int continuousDays;
  final int todayStudyMinutes;

  factory CreateCheckinResult.fromJson(Map<String, dynamic> json) {
    return CreateCheckinResult(
      checkinId: json['checkinId'] as String? ?? '',
      checkinDate: json['checkinDate'] as String? ?? '',
      continuousDays: (json['continuousDays'] as num?)?.toInt() ?? 0,
      todayStudyMinutes: (json['todayStudyMinutes'] as num?)?.toInt() ?? 0,
    );
  }
}
