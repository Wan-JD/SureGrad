import 'package:flutter/foundation.dart';

class CurrentTargetPreview {
  const CurrentTargetPreview({
    required this.schoolId,
    required this.schoolName,
    required this.departmentId,
    required this.departmentName,
    required this.programId,
    required this.programName,
    required this.targetScore,
  });

  final String? schoolId;
  final String? schoolName;
  final String? departmentId;
  final String? departmentName;
  final String? programId;
  final String? programName;
  final int? targetScore;

  String get headline {
    final parts = <String>[
      if (schoolName != null && schoolName!.isNotEmpty) schoolName!,
      if (programName != null && programName!.isNotEmpty) programName!,
    ];
    if (parts.isEmpty) {
      return '已设置目标';
    }
    return parts.join(' / ');
  }
}

class CurrentTargetStore extends ChangeNotifier {
  CurrentTargetPreview? _preview;

  CurrentTargetPreview? get preview => _preview;

  void update(CurrentTargetPreview preview) {
    _preview = preview;
    notifyListeners();
  }

  void clear() {
    if (_preview == null) {
      return;
    }
    _preview = null;
    notifyListeners();
  }
}
