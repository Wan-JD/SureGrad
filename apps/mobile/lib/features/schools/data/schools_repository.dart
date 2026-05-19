import '../../../core/network/api_exception.dart';
import '../../../core/network/api_result.dart';
import '../../../core/state/app_refresh_store.dart';
import '../../../core/state/current_target_store.dart';
import 'school_models.dart';
import 'schools_api.dart';

class SchoolsRepository {
  SchoolsRepository({
    required this.api,
    required this.refreshStore,
    required this.currentTargetStore,
  });

  final SchoolsApi api;
  final AppRefreshStore refreshStore;
  final CurrentTargetStore currentTargetStore;
  final List<SchoolSummary> _recentSchools = <SchoolSummary>[];

  String get listPath => api.listPath;
  String get detailPathPattern => api.detailPathPattern;
  String get programsPathPattern => api.programsPathPattern;

  List<SchoolSummary> get recentSchools =>
      List<SchoolSummary>.unmodifiable(_recentSchools);

  Future<List<SchoolSummary>> fetchSchools({
    String query = '',
    String cityFilter = '全部',
    String degreeFilter = '全部',
    bool? mathRequired,
  }) async {
    final result = await api.client.get(
      api.listPath,
      queryParameters: <String, dynamic>{
        ...?query.isEmpty ? null : <String, dynamic>{'q': query},
        ...?cityFilter == '全部' ? null : <String, dynamic>{'city': cityFilter},
        ...?degreeFilter == '全部'
            ? null
            : <String, dynamic>{'degreeType': degreeFilter},
        ...?mathRequired == null
            ? null
            : <String, dynamic>{'examMathRequired': mathRequired},
      },
    );
    final json = _unwrap(result);
    final items = json['items'] as List<dynamic>? ?? const [];
    return items
        .whereType<Map<String, dynamic>>()
        .map(SchoolSummary.fromJson)
        .toList(growable: false);
  }

  Future<SchoolDetail?> fetchSchoolDetail(String schoolId) async {
    final result = await api.client.get('/schools/$schoolId');
    final json = _unwrap(result);
    final detail = SchoolDetail.fromJson(json);
    _remember(
      SchoolSummary(
        id: detail.id,
        name: detail.name,
        province: detail.province,
        city: detail.city,
        schoolLevel: detail.schoolLevel,
        schoolType: detail.schoolType,
        matchedPrograms: detail.hotPrograms
            .map(
              (program) => MatchedProgramSummary(
                programId: program.programId,
                programName: program.programName,
                degreeType: program.degreeType,
              ),
            )
            .toList(growable: false),
        scoreLineSummary: detail.hotPrograms.firstOrNull?.scoreLineSummary,
        applicationRatioSummary:
            detail.hotPrograms.firstOrNull?.applicationRatioSummary,
        missingFlags: const <String>[],
        isFavorited: detail.isFavorited,
      ),
    );
    return detail;
  }

  Future<List<SchoolProgram>> fetchPrograms(String schoolId) async {
    final result = await api.client.get('/schools/$schoolId/programs');
    final json = _unwrap(result);
    final items = json['items'] as List<dynamic>? ?? const [];
    return items
        .whereType<Map<String, dynamic>>()
        .map(SchoolProgram.fromJson)
        .toList(growable: false);
  }

  Future<void> toggleSchoolFavorite({
    required String schoolId,
    required bool isFavorited,
  }) async {
    final result = isFavorited
        ? await api.client.delete(
            api.favoritesPath,
            queryParameters: <String, dynamic>{
              'targetType': 'school',
              'targetId': schoolId,
            },
          )
        : await api.client.post(
            api.favoritesPath,
            body: <String, dynamic>{
              'targetType': 'school',
              'targetId': schoolId,
            },
          );
    _unwrap(result);
    refreshStore.markDirty();
  }

  Future<void> toggleProgramComparison({
    required String programId,
    required bool isInComparison,
  }) async {
    final result = isInComparison
        ? await api.client.delete(
            api.comparisonItemsPath,
            queryParameters: <String, dynamic>{
              'targetType': 'program',
              'targetId': programId,
            },
          )
        : await api.client.post(
            api.comparisonItemsPath,
            body: <String, dynamic>{
              'targetType': 'program',
              'targetId': programId,
            },
          );
    _unwrap(result);
    refreshStore.markDirty();
  }

  Future<CurrentTargetPreview> setTargetProgram({
    required SchoolDetail school,
    required SchoolProgram program,
  }) async {
    final result = await api.client.put(
      api.currentTargetPath,
      body: <String, dynamic>{
        'schoolId': school.id,
        if (program.departmentId != null) 'departmentId': program.departmentId,
        'programId': program.id,
      },
    );
    final json = _unwrap(result);
    final summary = json['targetSummary'] is Map<String, dynamic>
        ? json['targetSummary'] as Map<String, dynamic>
        : const <String, dynamic>{};
    final preview = CurrentTargetPreview(
      schoolId: summary['schoolId'] as String?,
      schoolName: summary['schoolName'] as String? ?? school.name,
      departmentId: summary['departmentId'] as String? ?? program.departmentId,
      departmentName:
          summary['departmentName'] as String? ?? program.departmentName,
      programId: summary['programId'] as String? ?? program.id,
      programName: summary['programName'] as String? ?? program.name,
      targetScore: (summary['targetScore'] as num?)?.toInt(),
    );
    currentTargetStore.update(preview);
    refreshStore.markDirty();
    return preview;
  }

  void _remember(SchoolSummary school) {
    _recentSchools.removeWhere((item) => item.id == school.id);
    _recentSchools.insert(0, school);
    if (_recentSchools.length > 5) {
      _recentSchools.removeRange(5, _recentSchools.length);
    }
  }

  Map<String, dynamic> _unwrap(ApiResult<Map<String, dynamic>> result) {
    if (result is ApiFailure<Map<String, dynamic>>) {
      throw ApiException(result.message, statusCode: result.statusCode);
    }

    final json = (result as ApiSuccess<Map<String, dynamic>>).data;
    if (json['implemented'] == false) {
      throw FeatureUnavailableException.fromJson(json);
    }
    return json;
  }
}

extension on List<HotProgramSummary> {
  HotProgramSummary? get firstOrNull => isEmpty ? null : first;
}
