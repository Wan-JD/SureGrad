class ScoreLineSummary {
  const ScoreLineSummary({
    required this.examYear,
    required this.totalScore,
    required this.scoreLineType,
  });

  final int examYear;
  final int totalScore;
  final String scoreLineType;

  factory ScoreLineSummary.fromJson(Map<String, dynamic> json) {
    return ScoreLineSummary(
      examYear: (json['examYear'] as num?)?.toInt() ?? 0,
      totalScore: (json['totalScore'] as num?)?.toInt() ?? 0,
      scoreLineType: json['scoreLineType'] as String? ?? '',
    );
  }
}

class ApplicationRatioSummary {
  const ApplicationRatioSummary({
    required this.examYear,
    required this.applicationRatio,
    required this.applicantCount,
    required this.admittedCount,
  });

  final int examYear;
  final num applicationRatio;
  final int applicantCount;
  final int admittedCount;

  factory ApplicationRatioSummary.fromJson(Map<String, dynamic> json) {
    return ApplicationRatioSummary(
      examYear: (json['examYear'] as num?)?.toInt() ?? 0,
      applicationRatio: (json['applicationRatio'] as num?) ?? 0,
      applicantCount: (json['applicantCount'] as num?)?.toInt() ?? 0,
      admittedCount: (json['admittedCount'] as num?)?.toInt() ?? 0,
    );
  }
}

class InterviewRatioSummary {
  const InterviewRatioSummary({
    required this.examYear,
    required this.interviewRatio,
    required this.retestCandidateCount,
    required this.finalAdmittedCount,
  });

  final int examYear;
  final num interviewRatio;
  final int retestCandidateCount;
  final int finalAdmittedCount;

  factory InterviewRatioSummary.fromJson(Map<String, dynamic> json) {
    return InterviewRatioSummary(
      examYear: (json['examYear'] as num?)?.toInt() ?? 0,
      interviewRatio: (json['interviewRatio'] as num?) ?? 0,
      retestCandidateCount:
          (json['retestCandidateCount'] as num?)?.toInt() ?? 0,
      finalAdmittedCount: (json['finalAdmittedCount'] as num?)?.toInt() ?? 0,
    );
  }
}

class MatchedProgramSummary {
  const MatchedProgramSummary({
    required this.programId,
    required this.programName,
    required this.degreeType,
  });

  final String programId;
  final String programName;
  final String degreeType;

  factory MatchedProgramSummary.fromJson(Map<String, dynamic> json) {
    return MatchedProgramSummary(
      programId: json['programId'] as String? ?? '',
      programName: json['programName'] as String? ?? '',
      degreeType: json['degreeType'] as String? ?? '',
    );
  }
}

class HotProgramSummary {
  const HotProgramSummary({
    required this.programId,
    required this.programName,
    required this.departmentId,
    required this.departmentName,
    required this.degreeType,
    required this.scoreLineSummary,
    required this.applicationRatioSummary,
  });

  final String programId;
  final String programName;
  final String? departmentId;
  final String? departmentName;
  final String degreeType;
  final ScoreLineSummary? scoreLineSummary;
  final ApplicationRatioSummary? applicationRatioSummary;

  factory HotProgramSummary.fromJson(Map<String, dynamic> json) {
    return HotProgramSummary(
      programId: json['programId'] as String? ?? '',
      programName: json['programName'] as String? ?? '',
      departmentId: json['departmentId'] as String?,
      departmentName: json['departmentName'] as String?,
      degreeType: json['degreeType'] as String? ?? '',
      scoreLineSummary: json['scoreLineSummary'] is Map<String, dynamic>
          ? ScoreLineSummary.fromJson(
              json['scoreLineSummary'] as Map<String, dynamic>,
            )
          : null,
      applicationRatioSummary:
          json['applicationRatioSummary'] is Map<String, dynamic>
          ? ApplicationRatioSummary.fromJson(
              json['applicationRatioSummary'] as Map<String, dynamic>,
            )
          : null,
    );
  }
}

class SchoolSummary {
  const SchoolSummary({
    required this.id,
    required this.name,
    required this.province,
    required this.city,
    required this.schoolLevel,
    required this.schoolType,
    required this.matchedPrograms,
    required this.scoreLineSummary,
    required this.applicationRatioSummary,
    required this.missingFlags,
    required this.isFavorited,
  });

  final String id;
  final String name;
  final String province;
  final String city;
  final String? schoolLevel;
  final String? schoolType;
  final List<MatchedProgramSummary> matchedPrograms;
  final ScoreLineSummary? scoreLineSummary;
  final ApplicationRatioSummary? applicationRatioSummary;
  final List<String> missingFlags;
  final bool isFavorited;

  factory SchoolSummary.fromJson(Map<String, dynamic> json) {
    final matchedPrograms =
        json['matchedPrograms'] as List<dynamic>? ?? const [];
    final missingFlags = json['missingFlags'] as List<dynamic>? ?? const [];
    return SchoolSummary(
      id: json['schoolId'] as String? ?? '',
      name: json['schoolName'] as String? ?? '',
      province: json['province'] as String? ?? '',
      city: json['city'] as String? ?? '',
      schoolLevel: json['schoolLevel'] as String?,
      schoolType: json['schoolType'] as String?,
      matchedPrograms: matchedPrograms
          .whereType<Map<String, dynamic>>()
          .map(MatchedProgramSummary.fromJson)
          .toList(growable: false),
      scoreLineSummary: json['scoreLineSummary'] is Map<String, dynamic>
          ? ScoreLineSummary.fromJson(
              json['scoreLineSummary'] as Map<String, dynamic>,
            )
          : null,
      applicationRatioSummary:
          json['applicationRatioSummary'] is Map<String, dynamic>
          ? ApplicationRatioSummary.fromJson(
              json['applicationRatioSummary'] as Map<String, dynamic>,
            )
          : null,
      missingFlags: missingFlags.map((item) => '$item').toList(growable: false),
      isFavorited: json['isFavorited'] as bool? ?? false,
    );
  }

  String get primaryProgramLabel {
    if (matchedPrograms.isEmpty) {
      return '暂无匹配专业';
    }
    return matchedPrograms.first.programName;
  }

  String get scoreLineLabel {
    final summary = scoreLineSummary;
    if (summary == null) {
      return '待补充';
    }
    return '${summary.examYear} / ${summary.totalScore}';
  }

  String get applicationRatioLabel {
    final summary = applicationRatioSummary;
    if (summary == null) {
      return '待补充';
    }
    return '${summary.applicationRatio}:1';
  }

  List<String> get tags => <String>[
    if (schoolLevel != null && schoolLevel!.isNotEmpty) schoolLevel!,
    if (schoolType != null && schoolType!.isNotEmpty) schoolType!,
    if (province.isNotEmpty) province,
  ];
}

class SchoolDetail {
  const SchoolDetail({
    required this.id,
    required this.name,
    required this.shortName,
    required this.province,
    required this.city,
    required this.schoolType,
    required this.schoolLevel,
    required this.hasGraduateSchool,
    required this.officialWebsite,
    required this.graduateWebsite,
    required this.description,
    required this.programCount,
    required this.hotPrograms,
    required this.isFavorited,
  });

  final String id;
  final String name;
  final String? shortName;
  final String province;
  final String city;
  final String? schoolType;
  final String? schoolLevel;
  final bool hasGraduateSchool;
  final String? officialWebsite;
  final String? graduateWebsite;
  final String? description;
  final int programCount;
  final List<HotProgramSummary> hotPrograms;
  final bool isFavorited;

  factory SchoolDetail.fromJson(Map<String, dynamic> json) {
    final hotPrograms = json['hotPrograms'] as List<dynamic>? ?? const [];
    return SchoolDetail(
      id: json['schoolId'] as String? ?? '',
      name: json['schoolName'] as String? ?? '',
      shortName: json['shortName'] as String?,
      province: json['province'] as String? ?? '',
      city: json['city'] as String? ?? '',
      schoolType: json['schoolType'] as String?,
      schoolLevel: json['schoolLevel'] as String?,
      hasGraduateSchool: json['hasGraduateSchool'] as bool? ?? false,
      officialWebsite: json['officialWebsite'] as String?,
      graduateWebsite: json['graduateWebsite'] as String?,
      description: json['description'] as String?,
      programCount: (json['programCount'] as num?)?.toInt() ?? 0,
      hotPrograms: hotPrograms
          .whereType<Map<String, dynamic>>()
          .map(HotProgramSummary.fromJson)
          .toList(growable: false),
      isFavorited: json['isFavorited'] as bool? ?? false,
    );
  }
}

class SchoolProgram {
  const SchoolProgram({
    required this.id,
    required this.name,
    required this.code,
    required this.departmentId,
    required this.departmentName,
    required this.degreeType,
    required this.disciplineCategory,
    required this.researchDirection,
    required this.scoreLineSummary,
    required this.applicationRatioSummary,
    required this.interviewRatioSummary,
    required this.isFavorited,
    required this.isInComparison,
  });

  final String id;
  final String name;
  final String? code;
  final String? departmentId;
  final String? departmentName;
  final String degreeType;
  final String? disciplineCategory;
  final String? researchDirection;
  final ScoreLineSummary? scoreLineSummary;
  final ApplicationRatioSummary? applicationRatioSummary;
  final InterviewRatioSummary? interviewRatioSummary;
  final bool isFavorited;
  final bool isInComparison;

  factory SchoolProgram.fromJson(Map<String, dynamic> json) {
    return SchoolProgram(
      id: json['programId'] as String? ?? '',
      name: json['programName'] as String? ?? '',
      code: json['programCode'] as String?,
      departmentId: json['departmentId'] as String?,
      departmentName: json['departmentName'] as String?,
      degreeType: json['degreeType'] as String? ?? '',
      disciplineCategory: json['disciplineCategory'] as String?,
      researchDirection: json['researchDirection'] as String?,
      scoreLineSummary: json['scoreLineSummary'] is Map<String, dynamic>
          ? ScoreLineSummary.fromJson(
              json['scoreLineSummary'] as Map<String, dynamic>,
            )
          : null,
      applicationRatioSummary:
          json['applicationRatioSummary'] is Map<String, dynamic>
          ? ApplicationRatioSummary.fromJson(
              json['applicationRatioSummary'] as Map<String, dynamic>,
            )
          : null,
      interviewRatioSummary:
          json['interviewRatioSummary'] is Map<String, dynamic>
          ? InterviewRatioSummary.fromJson(
              json['interviewRatioSummary'] as Map<String, dynamic>,
            )
          : null,
      isFavorited: json['isFavorited'] as bool? ?? false,
      isInComparison: json['isInComparison'] as bool? ?? false,
    );
  }

  String get scoreLineLabel {
    final summary = scoreLineSummary;
    if (summary == null) {
      return '待补充';
    }
    return '${summary.examYear} / ${summary.totalScore}';
  }

  String get applicationRatioLabel {
    final summary = applicationRatioSummary;
    if (summary == null) {
      return '待补充';
    }
    return '${summary.applicationRatio}:1';
  }

  String get interviewRatioLabel {
    final summary = interviewRatioSummary;
    if (summary == null) {
      return '待补充';
    }
    return '${summary.interviewRatio}:1';
  }
}
