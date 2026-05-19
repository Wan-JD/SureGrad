class TodoSummary {
  const TodoSummary({
    required this.date,
    required this.totalCount,
    required this.pendingCount,
    required this.completedCount,
    required this.cancelledCount,
  });

  final String date;
  final int totalCount;
  final int pendingCount;
  final int completedCount;
  final int cancelledCount;

  factory TodoSummary.fromJson(Map<String, dynamic> json) {
    return TodoSummary(
      date: json['date'] as String? ?? '',
      totalCount: (json['totalCount'] as num?)?.toInt() ?? 0,
      pendingCount: (json['pendingCount'] as num?)?.toInt() ?? 0,
      completedCount: (json['completedCount'] as num?)?.toInt() ?? 0,
      cancelledCount: (json['cancelledCount'] as num?)?.toInt() ?? 0,
    );
  }
}

class TodoItem {
  const TodoItem({
    required this.id,
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

  final String id;
  final String title;
  final String? description;
  final String? dueDate;
  final int? expectedMinutes;
  final String? priority;
  final String? sourceType;
  final String? status;
  final String? completedAt;
  final String? subjectName;

  bool get isCompleted => status == 'completed';

  factory TodoItem.fromJson(Map<String, dynamic> json) {
    return TodoItem(
      id: json['todoItemId'] as String? ?? '',
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

class TodoSnapshot {
  const TodoSnapshot({required this.summary, required this.items});

  final TodoSummary summary;
  final List<TodoItem> items;
}
