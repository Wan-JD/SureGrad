class ComparisonResult {
  const ComparisonResult({
    required this.items,
    required this.dimensions,
    required this.pool,
  });

  final List<ComparisonItem> items;
  final List<ComparisonDimension> dimensions;
  final ComparisonPool pool;

  bool get isEmpty => items.isEmpty;

  ComparisonDimension? dimensionFor(String key) {
    for (final dimension in dimensions) {
      if (dimension.key == key) {
        return dimension;
      }
    }
    return null;
  }

  factory ComparisonResult.fromJson(Map<String, dynamic> json) {
    final items = (json['items'] as List<dynamic>? ?? const [])
        .whereType<Map<String, dynamic>>()
        .map(ComparisonItem.fromJson)
        .toList(growable: false);
    final dimensions = (json['dimensions'] as List<dynamic>? ?? const [])
        .whereType<Map<String, dynamic>>()
        .map(ComparisonDimension.fromJson)
        .toList(growable: false);

    return ComparisonResult(
      items: items,
      dimensions: dimensions,
      pool: ComparisonPool.fromJson(
        json['pool'] as Map<String, dynamic>?,
        fallbackCurrentCount: items.length,
      ),
    );
  }
}

class ComparisonItem {
  const ComparisonItem({
    required this.targetId,
    required this.targetType,
    required this.schoolName,
    required this.programName,
    required this.departmentName,
    required this.degreeType,
    required this.disciplineCategory,
    required this.researchDirection,
    required this.examMathRequired,
    required this.examYear,
    required this.totalScore,
    required this.applicationRatio,
    required this.interviewRatio,
    required this.plannedEnrollment,
    required this.tuitionPerYear,
    required this.city,
    required this.examSubjects,
    required this.missingFlags,
  });

  final String targetId;
  final String targetType;
  final String schoolName;
  final String programName;
  final String departmentName;
  final String degreeType;
  final String disciplineCategory;
  final String? researchDirection;
  final bool examMathRequired;
  final int? examYear;
  final num? totalScore;
  final num? applicationRatio;
  final num? interviewRatio;
  final num? plannedEnrollment;
  final num tuitionPerYear;
  final String city;
  final List<String> examSubjects;
  final List<String> missingFlags;

  int get missingFieldCount => missingFlags.length;

  factory ComparisonItem.fromJson(Map<String, dynamic> json) {
    return ComparisonItem(
      targetId: json['targetId'] as String? ?? '',
      targetType: json['targetType'] as String? ?? 'program',
      schoolName: json['schoolName'] as String? ?? '',
      programName: json['programName'] as String? ?? 'Unnamed program',
      departmentName: json['departmentName'] as String? ?? '',
      degreeType: json['degreeType'] as String? ?? '',
      disciplineCategory: json['disciplineCategory'] as String? ?? '',
      researchDirection: json['researchDirection'] as String?,
      examMathRequired: json['examMathRequired'] as bool? ?? false,
      examYear: (json['examYear'] as num?)?.toInt(),
      totalScore: json['totalScore'] as num?,
      applicationRatio: json['applicationRatio'] as num?,
      interviewRatio: json['interviewRatio'] as num?,
      plannedEnrollment: json['plannedEnrollment'] as num?,
      tuitionPerYear: json['tuitionPerYear'] as num? ?? 0,
      city: json['city'] as String? ?? '',
      examSubjects: (json['examSubjects'] as List<dynamic>? ?? const [])
          .whereType<String>()
          .toList(growable: false),
      missingFlags: (json['missingFlags'] as List<dynamic>? ?? const [])
          .whereType<String>()
          .toList(growable: false),
    );
  }
}

class ComparisonDimension {
  const ComparisonDimension({
    required this.key,
    required this.label,
    required this.unit,
  });

  final String key;
  final String label;
  final String? unit;

  factory ComparisonDimension.fromJson(Map<String, dynamic> json) {
    return ComparisonDimension(
      key: json['key'] as String? ?? '',
      label: json['label'] as String? ?? '',
      unit: json['unit'] as String?,
    );
  }
}

class ComparisonPool {
  const ComparisonPool({
    required this.currentCount,
    required this.maxCount,
    required this.isEmpty,
  });

  final int currentCount;
  final int maxCount;
  final bool isEmpty;

  factory ComparisonPool.fromJson(
    Map<String, dynamic>? json, {
    required int fallbackCurrentCount,
  }) {
    return ComparisonPool(
      currentCount:
          (json?['currentCount'] as num?)?.toInt() ?? fallbackCurrentCount,
      maxCount: (json?['maxCount'] as num?)?.toInt() ?? 4,
      isEmpty: json?['isEmpty'] as bool? ?? fallbackCurrentCount == 0,
    );
  }
}
