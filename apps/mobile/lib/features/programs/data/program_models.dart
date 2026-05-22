import '../../schools/data/school_models.dart';

class ProgramSchoolSummary {
  const ProgramSchoolSummary({
    required this.schoolId,
    required this.schoolName,
    required this.shortName,
    required this.province,
    required this.city,
    required this.schoolType,
    required this.schoolLevel,
    required this.hasGraduateSchool,
    required this.officialWebsite,
    required this.graduateWebsite,
  });

  final String schoolId;
  final String schoolName;
  final String? shortName;
  final String? province;
  final String? city;
  final String? schoolType;
  final String? schoolLevel;
  final bool hasGraduateSchool;
  final String? officialWebsite;
  final String? graduateWebsite;

  factory ProgramSchoolSummary.fromJson(Map<String, dynamic> json) {
    return ProgramSchoolSummary(
      schoolId: json['schoolId'] as String? ?? '',
      schoolName: json['schoolName'] as String? ?? '',
      shortName: json['shortName'] as String?,
      province: json['province'] as String?,
      city: json['city'] as String?,
      schoolType: json['schoolType'] as String?,
      schoolLevel: json['schoolLevel'] as String?,
      hasGraduateSchool: json['hasGraduateSchool'] as bool? ?? false,
      officialWebsite: json['officialWebsite'] as String?,
      graduateWebsite: json['graduateWebsite'] as String?,
    );
  }
}

class ProgramDepartmentSummary {
  const ProgramDepartmentSummary({
    required this.departmentId,
    required this.departmentName,
    required this.departmentCode,
    required this.website,
  });

  final String departmentId;
  final String departmentName;
  final String? departmentCode;
  final String? website;

  factory ProgramDepartmentSummary.fromJson(Map<String, dynamic> json) {
    return ProgramDepartmentSummary(
      departmentId: json['departmentId'] as String? ?? '',
      departmentName: json['departmentName'] as String? ?? '',
      departmentCode: json['departmentCode'] as String?,
      website: json['website'] as String?,
    );
  }
}

class ProgramAdmissionRecord {
  const ProgramAdmissionRecord({
    required this.examYear,
    required this.plannedEnrollment,
    required this.recommendedExemptionCount,
    required this.unifiedExamQuota,
    required this.actualEnrollment,
    required this.isCrossMajorAllowed,
    required this.memo,
  });

  final int? examYear;
  final int? plannedEnrollment;
  final int? recommendedExemptionCount;
  final int? unifiedExamQuota;
  final int? actualEnrollment;
  final bool? isCrossMajorAllowed;
  final String? memo;

  factory ProgramAdmissionRecord.fromJson(Map<String, dynamic> json) {
    return ProgramAdmissionRecord(
      examYear: (json['examYear'] as num?)?.toInt(),
      plannedEnrollment: (json['plannedEnrollment'] as num?)?.toInt(),
      recommendedExemptionCount:
          (json['recommendedExemptionCount'] as num?)?.toInt(),
      unifiedExamQuota: (json['unifiedExamQuota'] as num?)?.toInt(),
      actualEnrollment: (json['actualEnrollment'] as num?)?.toInt(),
      isCrossMajorAllowed: json['isCrossMajorAllowed'] as bool?,
      memo: json['memo'] as String?,
    );
  }
}

class ProgramScoreLineRecord {
  const ProgramScoreLineRecord({
    required this.examYear,
    required this.totalScore,
    required this.politicsScore,
    required this.englishScore,
    required this.subjectOneScore,
    required this.subjectTwoScore,
    required this.scoreLineType,
    required this.notes,
  });

  final int? examYear;
  final int? totalScore;
  final int? politicsScore;
  final int? englishScore;
  final int? subjectOneScore;
  final int? subjectTwoScore;
  final String? scoreLineType;
  final String? notes;

  factory ProgramScoreLineRecord.fromJson(Map<String, dynamic> json) {
    return ProgramScoreLineRecord(
      examYear: (json['examYear'] as num?)?.toInt(),
      totalScore: (json['totalScore'] as num?)?.toInt(),
      politicsScore: (json['politicsScore'] as num?)?.toInt(),
      englishScore: (json['englishScore'] as num?)?.toInt(),
      subjectOneScore: (json['subjectOneScore'] as num?)?.toInt(),
      subjectTwoScore: (json['subjectTwoScore'] as num?)?.toInt(),
      scoreLineType: json['scoreLineType'] as String?,
      notes: json['notes'] as String?,
    );
  }
}

class ProgramApplicationStatRecord {
  const ProgramApplicationStatRecord({
    required this.examYear,
    required this.applicantCount,
    required this.actualExamCount,
    required this.admittedCount,
    required this.applicationRatio,
    required this.notes,
  });

  final int? examYear;
  final int? applicantCount;
  final int? actualExamCount;
  final int? admittedCount;
  final num? applicationRatio;
  final String? notes;

  factory ProgramApplicationStatRecord.fromJson(Map<String, dynamic> json) {
    return ProgramApplicationStatRecord(
      examYear: (json['examYear'] as num?)?.toInt(),
      applicantCount: (json['applicantCount'] as num?)?.toInt(),
      actualExamCount: (json['actualExamCount'] as num?)?.toInt(),
      admittedCount: (json['admittedCount'] as num?)?.toInt(),
      applicationRatio: json['applicationRatio'] as num?,
      notes: json['notes'] as String?,
    );
  }
}

class ProgramInterviewStatRecord {
  const ProgramInterviewStatRecord({
    required this.examYear,
    required this.retestCandidateCount,
    required this.finalAdmittedCount,
    required this.interviewRatio,
    required this.retestWeight,
    required this.initialExamWeight,
    required this.notes,
  });

  final int? examYear;
  final int? retestCandidateCount;
  final int? finalAdmittedCount;
  final num? interviewRatio;
  final num? retestWeight;
  final num? initialExamWeight;
  final String? notes;

  factory ProgramInterviewStatRecord.fromJson(Map<String, dynamic> json) {
    return ProgramInterviewStatRecord(
      examYear: (json['examYear'] as num?)?.toInt(),
      retestCandidateCount: (json['retestCandidateCount'] as num?)?.toInt(),
      finalAdmittedCount: (json['finalAdmittedCount'] as num?)?.toInt(),
      interviewRatio: json['interviewRatio'] as num?,
      retestWeight: json['retestWeight'] as num?,
      initialExamWeight: json['initialExamWeight'] as num?,
      notes: json['notes'] as String?,
    );
  }
}

class ProgramExamSubjectRecord {
  const ProgramExamSubjectRecord({
    required this.examYear,
    required this.sequence,
    required this.subjectRole,
    required this.subjectCode,
    required this.subjectName,
    required this.notes,
  });

  final int? examYear;
  final int? sequence;
  final String? subjectRole;
  final String? subjectCode;
  final String? subjectName;
  final String? notes;

  factory ProgramExamSubjectRecord.fromJson(Map<String, dynamic> json) {
    return ProgramExamSubjectRecord(
      examYear: (json['examYear'] as num?)?.toInt(),
      sequence: (json['sequence'] as num?)?.toInt(),
      subjectRole: json['subjectRole'] as String?,
      subjectCode: json['subjectCode'] as String?,
      subjectName: json['subjectName'] as String?,
      notes: json['notes'] as String?,
    );
  }
}

class ProgramReferenceBookRecord {
  const ProgramReferenceBookRecord({
    required this.examYear,
    required this.title,
    required this.author,
    required this.publisher,
    required this.isbn,
    required this.edition,
    required this.subjectRole,
    required this.isRequired,
    required this.notes,
  });

  final int? examYear;
  final String title;
  final String? author;
  final String? publisher;
  final String? isbn;
  final String? edition;
  final String? subjectRole;
  final bool? isRequired;
  final String? notes;

  factory ProgramReferenceBookRecord.fromJson(Map<String, dynamic> json) {
    return ProgramReferenceBookRecord(
      examYear: (json['examYear'] as num?)?.toInt(),
      title: json['title'] as String? ?? '',
      author: json['author'] as String?,
      publisher: json['publisher'] as String?,
      isbn: json['isbn'] as String?,
      edition: json['edition'] as String?,
      subjectRole: json['subjectRole'] as String?,
      isRequired: json['isRequired'] as bool?,
      notes: json['notes'] as String?,
    );
  }
}

class ProgramSourceLinkRecord {
  const ProgramSourceLinkRecord({
    required this.sourceLinkId,
    required this.examYear,
    required this.sourceType,
    required this.title,
    required this.url,
    required this.publisherName,
    required this.status,
    required this.notes,
  });

  final String sourceLinkId;
  final int? examYear;
  final String? sourceType;
  final String title;
  final String? url;
  final String? publisherName;
  final String? status;
  final String? notes;

  factory ProgramSourceLinkRecord.fromJson(Map<String, dynamic> json) {
    return ProgramSourceLinkRecord(
      sourceLinkId: json['sourceLinkId'] as String? ?? '',
      examYear: (json['examYear'] as num?)?.toInt(),
      sourceType: json['sourceType'] as String?,
      title: json['title'] as String? ?? '',
      url: json['url'] as String?,
      publisherName: json['publisherName'] as String?,
      status: json['status'] as String?,
      notes: json['notes'] as String?,
    );
  }
}

class ProgramDetail {
  const ProgramDetail({
    required this.programId,
    required this.programName,
    required this.programCode,
    required this.degreeType,
    required this.disciplineCategory,
    required this.researchDirection,
    required this.school,
    required this.department,
    required this.scoreLineSummary,
    required this.applicationRatioSummary,
    required this.interviewRatioSummary,
    required this.admissions,
    required this.scoreLines,
    required this.applicationStats,
    required this.interviewStats,
    required this.examSubjects,
    required this.referenceBooks,
    required this.sourceLinks,
    required this.dataUpdatedAt,
    required this.disclaimer,
    required this.isFavorited,
    required this.isInComparison,
  });

  final String programId;
  final String programName;
  final String? programCode;
  final String degreeType;
  final String? disciplineCategory;
  final String? researchDirection;
  final ProgramSchoolSummary school;
  final ProgramDepartmentSummary department;
  final ScoreLineSummary? scoreLineSummary;
  final ApplicationRatioSummary? applicationRatioSummary;
  final InterviewRatioSummary? interviewRatioSummary;
  final List<ProgramAdmissionRecord> admissions;
  final List<ProgramScoreLineRecord> scoreLines;
  final List<ProgramApplicationStatRecord> applicationStats;
  final List<ProgramInterviewStatRecord> interviewStats;
  final List<ProgramExamSubjectRecord> examSubjects;
  final List<ProgramReferenceBookRecord> referenceBooks;
  final List<ProgramSourceLinkRecord> sourceLinks;
  final String? dataUpdatedAt;
  final String disclaimer;
  final bool isFavorited;
  final bool isInComparison;

  factory ProgramDetail.fromJson(Map<String, dynamic> json) {
    List<T> mapList<T>(
      String key,
      T Function(Map<String, dynamic> item) mapper,
    ) {
      final raw = json[key] as List<dynamic>? ?? const [];
      return raw
          .whereType<Map<String, dynamic>>()
          .map(mapper)
          .toList(growable: false);
    }

    return ProgramDetail(
      programId: json['programId'] as String? ?? '',
      programName: json['programName'] as String? ?? '',
      programCode: json['programCode'] as String?,
      degreeType: json['degreeType'] as String? ?? '',
      disciplineCategory: json['disciplineCategory'] as String?,
      researchDirection: json['researchDirection'] as String?,
      school: ProgramSchoolSummary.fromJson(
        json['school'] as Map<String, dynamic>? ?? const {},
      ),
      department: ProgramDepartmentSummary.fromJson(
        json['department'] as Map<String, dynamic>? ?? const {},
      ),
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
      interviewRatioSummary: json['interviewRatioSummary'] is Map<String, dynamic>
          ? InterviewRatioSummary.fromJson(
              json['interviewRatioSummary'] as Map<String, dynamic>,
            )
          : null,
      admissions: mapList('admissions', ProgramAdmissionRecord.fromJson),
      scoreLines: mapList('scoreLines', ProgramScoreLineRecord.fromJson),
      applicationStats:
          mapList('applicationStats', ProgramApplicationStatRecord.fromJson),
      interviewStats:
          mapList('interviewStats', ProgramInterviewStatRecord.fromJson),
      examSubjects: mapList('examSubjects', ProgramExamSubjectRecord.fromJson),
      referenceBooks: mapList('referenceBooks', ProgramReferenceBookRecord.fromJson),
      sourceLinks: mapList('sourceLinks', ProgramSourceLinkRecord.fromJson),
      dataUpdatedAt: json['dataUpdatedAt'] as String?,
      disclaimer: json['disclaimer'] as String? ?? '以官方最新公告为准',
      isFavorited: json['isFavorited'] as bool? ?? false,
      isInComparison: json['isInComparison'] as bool? ?? false,
    );
  }

  String get degreeTypeLabel {
    switch (degreeType) {
      case 'academic':
        return '学硕';
      case 'professional':
        return '专硕';
      default:
        return degreeType.isEmpty ? '学位类型待补充' : degreeType;
    }
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
