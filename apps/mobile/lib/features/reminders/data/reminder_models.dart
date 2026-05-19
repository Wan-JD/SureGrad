class ReminderItem {
  const ReminderItem({
    required this.id,
    required this.title,
    required this.content,
    required this.reminderType,
    required this.remindAt,
    required this.isEnabled,
    required this.isSystemDefault,
  });

  final String id;
  final String title;
  final String content;
  final String? reminderType;
  final String? remindAt;
  final bool isEnabled;
  final bool isSystemDefault;

  factory ReminderItem.fromJson(Map<String, dynamic> json) {
    return ReminderItem(
      id: json['reminderId'] as String? ?? json['id'] as String? ?? '',
      title: json['title'] as String? ?? '未命名提醒',
      content: json['content'] as String? ?? '',
      reminderType: json['reminderType'] as String?,
      remindAt: json['remindAt'] as String?,
      isEnabled: json['isEnabled'] as bool? ?? false,
      isSystemDefault: json['isSystemDefault'] as bool? ?? false,
    );
  }
}
