import '../../../core/network/api_client.dart';
import '../../../core/network/api_result.dart';

class ProfileApi {
  const ProfileApi({required this.client});

  final ApiClient client;

  String get mePath => '/users/me';
  String get currentTargetPath => '/user-targets/current';
  String get updateProfilePath => '/user-profiles/me';

  Future<ApiResult<Map<String, dynamic>>> updateProfile({
    required int examYear,
    required String identityType,
    required String intendedDiscipline,
    required double dailyStudyHours,
    bool onboardingCompleted = true,
  }) {
    return client.put(
      updateProfilePath,
      body: <String, dynamic>{
        'examYear': examYear,
        'identityType': identityType,
        'intendedDiscipline': intendedDiscipline,
        'dailyStudyHours': dailyStudyHours,
        'onboardingCompleted': onboardingCompleted,
      },
    );
  }
}
