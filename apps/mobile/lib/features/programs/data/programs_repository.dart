import '../../../core/network/api_exception.dart';
import '../../../core/network/api_result.dart';
import '../../../core/state/app_refresh_store.dart';
import '../../../core/state/current_target_store.dart';
import 'program_models.dart';
import 'programs_api.dart';

class ProgramsRepository {
  ProgramsRepository({
    required this.api,
    required this.refreshStore,
    required this.currentTargetStore,
  });

  final ProgramsApi api;
  final AppRefreshStore refreshStore;
  final CurrentTargetStore currentTargetStore;

  Future<ProgramDetail> fetchProgramDetail(
    String programId, {
    String? examYears,
  }) async {
    final result = await api.client.get(
      api.programPath(programId),
      queryParameters: examYears == null || examYears.isEmpty
          ? null
          : <String, dynamic>{'examYears': examYears},
    );
    return ProgramDetail.fromJson(_unwrap(result));
  }

  Future<void> toggleProgramFavorite({
    required String programId,
    required bool isFavorited,
  }) async {
    final result = isFavorited
        ? await api.client.delete(
            api.favoritesPath,
            queryParameters: <String, dynamic>{
              'targetType': 'program',
              'targetId': programId,
            },
          )
        : await api.client.post(
            api.favoritesPath,
            body: <String, dynamic>{
              'targetType': 'program',
              'targetId': programId,
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

  Future<CurrentTargetPreview> setCurrentTarget(ProgramDetail detail) async {
    final result = await api.client.put(
      api.currentTargetPath,
      body: <String, dynamic>{
        'schoolId': detail.school.schoolId,
        if (detail.department.departmentId.isNotEmpty)
          'departmentId': detail.department.departmentId,
        'programId': detail.programId,
      },
    );
    final json = _unwrap(result);
    final summary = json['targetSummary'] is Map<String, dynamic>
        ? json['targetSummary'] as Map<String, dynamic>
        : const <String, dynamic>{};
    final preview = CurrentTargetPreview(
      schoolId: summary['schoolId'] as String?,
      schoolName: summary['schoolName'] as String? ?? detail.school.schoolName,
      departmentId:
          summary['departmentId'] as String? ?? detail.department.departmentId,
      departmentName: summary['departmentName'] as String? ??
          detail.department.departmentName,
      programId: summary['programId'] as String? ?? detail.programId,
      programName: summary['programName'] as String? ?? detail.programName,
      targetScore: (summary['targetScore'] as num?)?.toInt(),
    );
    currentTargetStore.update(preview);
    refreshStore.markDirty();
    return preview;
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
