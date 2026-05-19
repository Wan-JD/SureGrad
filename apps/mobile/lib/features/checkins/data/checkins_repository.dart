import '../../../core/network/api_exception.dart';
import '../../../core/network/api_result.dart';
import '../../../core/state/app_refresh_store.dart';
import 'checkins_api.dart';
import 'checkins_models.dart';

class CheckinsRepository {
  const CheckinsRepository({required this.api, required this.refreshStore});

  final CheckinsApi api;
  final AppRefreshStore refreshStore;

  Future<TodayCheckinSnapshot> fetchTodayCheckin() async {
    final json = _unwrap(await api.client.get(api.todayPath));
    return TodayCheckinSnapshot.fromJson(json);
  }

  Future<StudyStatsOverview> fetchOverview({String range = 'week'}) async {
    final json = _unwrap(
      await api.client.get(
        api.overviewPath,
        queryParameters: <String, dynamic>{'range': range},
      ),
    );
    return StudyStatsOverview.fromJson(json);
  }

  Future<CreateCheckinResult> createCheckin({
    required int totalStudyMinutes,
    String? reflection,
    String? moodTag,
  }) async {
    final json = _unwrap(
      await api.client.post(
        api.createPath,
        body: <String, dynamic>{
          'totalStudyMinutes': totalStudyMinutes,
          if (reflection != null && reflection.trim().isNotEmpty)
            'reflection': reflection.trim(),
          if (moodTag != null && moodTag.isNotEmpty) 'moodTag': moodTag,
        },
      ),
    );
    refreshStore.markDirty();
    return CreateCheckinResult.fromJson(json);
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
