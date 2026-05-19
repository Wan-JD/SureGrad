import '../../../core/state/current_target_store.dart';

class CurrentTargetRecord {
  const CurrentTargetRecord({
    required this.userTargetId,
    required this.schoolId,
    required this.departmentId,
    required this.programId,
    required this.targetScore,
    required this.targetStatus,
    required this.selectedAt,
  });

  final String? userTargetId;
  final String? schoolId;
  final String? departmentId;
  final String? programId;
  final int? targetScore;
  final String? targetStatus;
  final String? selectedAt;

  bool get hasTarget => userTargetId != null && schoolId != null;

  factory CurrentTargetRecord.fromJson(Map<String, dynamic> json) {
    return CurrentTargetRecord(
      userTargetId: json['userTargetId'] as String?,
      schoolId: json['schoolId'] as String?,
      departmentId: json['departmentId'] as String?,
      programId: json['programId'] as String?,
      targetScore: (json['targetScore'] as num?)?.toInt(),
      targetStatus: json['targetStatus'] as String?,
      selectedAt: json['selectedAt'] as String?,
    );
  }
}

class StudyPlanPhase {
  const StudyPlanPhase({
    required this.phaseId,
    required this.phaseType,
    required this.title,
    required this.startDate,
    required this.endDate,
    required this.goals,
    required this.focusSubjects,
  });

  final String phaseId;
  final String phaseType;
  final String title;
  final String startDate;
  final String endDate;
  final String? goals;
  final List<String> focusSubjects;

  factory StudyPlanPhase.fromJson(Map<String, dynamic> json) {
    final focusSubjects = json['focusSubjects'] as List<dynamic>? ?? const [];
    return StudyPlanPhase(
      phaseId: json['studyPlanPhaseId'] as String? ?? '',
      phaseType: json['phaseType'] as String? ?? '',
      title: json['title'] as String? ?? '',
      startDate: json['startDate'] as String? ?? '',
      endDate: json['endDate'] as String? ?? '',
      goals: json['goals'] as String?,
      focusSubjects: focusSubjects
          .map((item) => '$item')
          .toList(growable: false),
    );
  }
}

class WeekSummary {
  const WeekSummary({
    required this.weeklyPlanId,
    required this.weekStartDate,
    required this.weekEndDate,
    required this.title,
    required this.goals,
    required this.expectedHours,
    required this.status,
  });

  final String weeklyPlanId;
  final String weekStartDate;
  final String weekEndDate;
  final String title;
  final String? goals;
  final num? expectedHours;
  final String? status;

  factory WeekSummary.fromJson(Map<String, dynamic> json) {
    return WeekSummary(
      weeklyPlanId: json['weeklyPlanId'] as String? ?? '',
      weekStartDate: json['weekStartDate'] as String? ?? '',
      weekEndDate: json['weekEndDate'] as String? ?? '',
      title: json['title'] as String? ?? '',
      goals: json['goals'] as String?,
      expectedHours: json['expectedHours'] as num?,
      status: json['status'] as String?,
    );
  }
}

class DaySummary {
  const DaySummary({
    required this.dailyPlanId,
    required this.planDate,
    required this.title,
    required this.expectedHours,
    required this.notes,
    required this.status,
  });

  final String dailyPlanId;
  final String planDate;
  final String title;
  final num? expectedHours;
  final String? notes;
  final String? status;

  factory DaySummary.fromJson(Map<String, dynamic> json) {
    return DaySummary(
      dailyPlanId: json['dailyPlanId'] as String? ?? '',
      planDate: json['planDate'] as String? ?? '',
      title: json['title'] as String? ?? '',
      expectedHours: json['expectedHours'] as num?,
      notes: json['notes'] as String?,
      status: json['status'] as String?,
    );
  }
}

class CurrentStudyPlan {
  const CurrentStudyPlan({
    required this.studyPlanId,
    required this.title,
    required this.templateType,
    required this.startDate,
    required this.endDate,
    required this.status,
    required this.totalExpectedHours,
    required this.phases,
    required this.currentWeek,
    required this.todayPlan,
  });

  final String? studyPlanId;
  final String? title;
  final String? templateType;
  final String? startDate;
  final String? endDate;
  final String? status;
  final num? totalExpectedHours;
  final List<StudyPlanPhase> phases;
  final WeekSummary? currentWeek;
  final DaySummary? todayPlan;

  bool get hasPlan => studyPlanId != null;

  factory CurrentStudyPlan.fromJson(Map<String, dynamic> json) {
    final phases = json['phases'] as List<dynamic>? ?? const [];
    return CurrentStudyPlan(
      studyPlanId: json['studyPlanId'] as String?,
      title: json['title'] as String?,
      templateType: json['templateType'] as String?,
      startDate: json['startDate'] as String?,
      endDate: json['endDate'] as String?,
      status: json['status'] as String?,
      totalExpectedHours: json['totalExpectedHours'] as num?,
      phases: phases
          .whereType<Map<String, dynamic>>()
          .map(StudyPlanPhase.fromJson)
          .toList(growable: false),
      currentWeek: json['currentWeek'] is Map<String, dynamic>
          ? WeekSummary.fromJson(json['currentWeek'] as Map<String, dynamic>)
          : null,
      todayPlan: json['todayPlan'] is Map<String, dynamic>
          ? DaySummary.fromJson(json['todayPlan'] as Map<String, dynamic>)
          : null,
    );
  }
}

class WeeklyPlanItem {
  const WeeklyPlanItem({
    required this.dailyPlanId,
    required this.planDate,
    required this.title,
    required this.expectedHours,
    required this.status,
  });

  final String? dailyPlanId;
  final String planDate;
  final String? title;
  final num? expectedHours;
  final String? status;

  factory WeeklyPlanItem.fromJson(Map<String, dynamic> json) {
    return WeeklyPlanItem(
      dailyPlanId: json['dailyPlanId'] as String?,
      planDate: json['planDate'] as String? ?? '',
      title: json['title'] as String?,
      expectedHours: json['expectedHours'] as num?,
      status: json['status'] as String?,
    );
  }
}

class WeeklyPlan {
  const WeeklyPlan({
    required this.weeklyPlanId,
    required this.studyPlanId,
    required this.phaseId,
    required this.title,
    required this.weekStartDate,
    required this.weekEndDate,
    required this.goals,
    required this.expectedHours,
    required this.status,
    required this.dailyPlans,
  });

  final String? weeklyPlanId;
  final String? studyPlanId;
  final String? phaseId;
  final String? title;
  final String? weekStartDate;
  final String? weekEndDate;
  final String? goals;
  final num? expectedHours;
  final String? status;
  final List<WeeklyPlanItem> dailyPlans;

  factory WeeklyPlan.fromJson(Map<String, dynamic> json) {
    final dailyPlans = json['dailyPlans'] as List<dynamic>? ?? const [];
    return WeeklyPlan(
      weeklyPlanId: json['weeklyPlanId'] as String?,
      studyPlanId: json['studyPlanId'] as String?,
      phaseId: json['phaseId'] as String?,
      title: json['title'] as String?,
      weekStartDate: json['weekStartDate'] as String?,
      weekEndDate: json['weekEndDate'] as String?,
      goals: json['goals'] as String?,
      expectedHours: json['expectedHours'] as num?,
      status: json['status'] as String?,
      dailyPlans: dailyPlans
          .whereType<Map<String, dynamic>>()
          .map(WeeklyPlanItem.fromJson)
          .toList(growable: false),
    );
  }
}

class DailyTodo {
  const DailyTodo({
    required this.todoItemId,
    required this.title,
    required this.description,
    required this.dueDate,
    required this.expectedMinutes,
    required this.priority,
    required this.sourceType,
    required this.status,
    required this.completedAt,
    required this.subjectName,
  });

  final String todoItemId;
  final String title;
  final String? description;
  final String? dueDate;
  final int? expectedMinutes;
  final String? priority;
  final String? sourceType;
  final String? status;
  final String? completedAt;
  final String? subjectName;

  factory DailyTodo.fromJson(Map<String, dynamic> json) {
    return DailyTodo(
      todoItemId: json['todoItemId'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      dueDate: json['dueDate'] as String?,
      expectedMinutes: (json['expectedMinutes'] as num?)?.toInt(),
      priority: json['priority'] as String?,
      sourceType: json['sourceType'] as String?,
      status: json['status'] as String?,
      completedAt: json['completedAt'] as String?,
      subjectName: json['subjectName'] as String?,
    );
  }
}

class DailyPlan {
  const DailyPlan({
    required this.dailyPlanId,
    required this.studyPlanId,
    required this.weeklyPlanId,
    required this.planDate,
    required this.title,
    required this.expectedHours,
    required this.notes,
    required this.status,
    required this.todos,
  });

  final String? dailyPlanId;
  final String? studyPlanId;
  final String? weeklyPlanId;
  final String planDate;
  final String? title;
  final num? expectedHours;
  final String? notes;
  final String? status;
  final List<DailyTodo> todos;

  factory DailyPlan.fromJson(Map<String, dynamic> json) {
    final todos = json['todos'] as List<dynamic>? ?? const [];
    return DailyPlan(
      dailyPlanId: json['dailyPlanId'] as String?,
      studyPlanId: json['studyPlanId'] as String?,
      weeklyPlanId: json['weeklyPlanId'] as String?,
      planDate: json['planDate'] as String? ?? '',
      title: json['title'] as String?,
      expectedHours: json['expectedHours'] as num?,
      notes: json['notes'] as String?,
      status: json['status'] as String?,
      todos: todos
          .whereType<Map<String, dynamic>>()
          .map(DailyTodo.fromJson)
          .toList(growable: false),
    );
  }
}

class PlanningSnapshot {
  const PlanningSnapshot({
    required this.currentTarget,
    required this.currentPlan,
    required this.weeklyPlan,
    required this.dailyPlan,
    required this.targetPreview,
  });

  final CurrentTargetRecord currentTarget;
  final CurrentStudyPlan currentPlan;
  final WeeklyPlan? weeklyPlan;
  final DailyPlan? dailyPlan;
  final CurrentTargetPreview? targetPreview;

  bool get hasTarget => currentTarget.hasTarget;
  bool get hasPlan => currentPlan.hasPlan;

  String get headline {
    if (targetPreview != null) {
      return targetPreview!.headline;
    }
    if (hasTarget) {
      return '已设置目标专业';
    }
    return '尚未设置目标';
  }
}
