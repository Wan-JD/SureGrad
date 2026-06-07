import '../../../core/network/api_exception.dart';
import '../../../core/network/api_result.dart';
import '../../../core/state/current_target_store.dart';
import '../../planning/data/planning_models.dart';
import 'profile_api.dart';
import 'profile_models.dart';

class ProfileRepository {
  const ProfileRepository({
    required this.api,
    required this.currentTargetStore,
  });

  final ProfileApi api;
  final CurrentTargetStore currentTargetStore;

  String get mePath => api.mePath;
  String get currentTargetPath => api.currentTargetPath;

  Future<ProfileScreenData> fetchProfile() async {
    final me = UserProfileSnapshot.fromJson(
      _unwrap(await api.client.get(api.mePath)),
    );
    final currentTarget = CurrentTargetRecord.fromJson(
      _unwrap(await api.client.get(api.currentTargetPath)),
    );
    return ProfileScreenData(
      me: me,
      currentTarget: currentTarget,
      targetPreview: _resolveTargetPreview(currentTarget),
    );
  }

  CurrentTargetPreview? _resolveTargetPreview(CurrentTargetRecord target) {
    final preview = currentTargetStore.preview;
    if (preview == null) {
      return null;
    }
    if (preview.programId != null &&
        target.programId != null &&
        preview.programId != target.programId) {
      return null;
    }
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

  Future<void> updateProfile({
    required int examYear,
    required String identityType,
    required String intendedDiscipline,
    required double dailyStudyHours,
  }) async {
    final result = await api.updateProfile(
      examYear: examYear,
      identityType: identityType,
      intendedDiscipline: intendedDiscipline,
      dailyStudyHours: dailyStudyHours,
      onboardingCompleted: true,
    );
    if (result is ApiFailure<Map<String, dynamic>>) {
      throw ApiException(result.message, statusCode: result.statusCode);
    }
  }
}
