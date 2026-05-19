import '../../../core/network/api_exception.dart';
import '../../../core/network/api_result.dart';
import '../../../core/state/app_refresh_store.dart';
import '../../../core/state/current_target_store.dart';
import 'planning_api.dart';
import 'planning_models.dart';

class PlanningRepository {
  const PlanningRepository({
    required this.api,
    required this.refreshStore,
    required this.currentTargetStore,
  });

  final PlanningApi api;
  final AppRefreshStore refreshStore;
  final CurrentTargetStore currentTargetStore;

  String get currentPlanPath => api.currentPlanPath;
  String get generatePlanPath => api.generatePlanPath;
  String get weeklyPlanPath => api.weeklyPlanPath;
  String get dailyPlanPath => api.dailyPlanPath;

  Future<PlanningSnapshot> fetchPlanningSnapshot() async {
    final target = CurrentTargetRecord.fromJson(
      _unwrap(await api.client.get(api.currentTargetPath)),
    );
    final currentPlan = CurrentStudyPlan.fromJson(
      _unwrap(await api.client.get(api.currentPlanPath)),
    );

    WeeklyPlan? weeklyPlan;
    if (currentPlan.studyPlanId != null && currentPlan.currentWeek != null) {
      weeklyPlan = WeeklyPlan.fromJson(
        _unwrap(
          await api.client.get(
            api.weeklyPlanPath,
            queryParameters: <String, dynamic>{
              'studyPlanId': currentPlan.studyPlanId,
              'weekStartDate': currentPlan.currentWeek!.weekStartDate,
            },
          ),
        ),
      );
    }

    DailyPlan? dailyPlan;
    if (currentPlan.studyPlanId != null && currentPlan.todayPlan != null) {
      dailyPlan = DailyPlan.fromJson(
        _unwrap(
          await api.client.get(
            api.dailyPlanPath,
            queryParameters: <String, dynamic>{
              'studyPlanId': currentPlan.studyPlanId,
              'date': currentPlan.todayPlan!.planDate,
            },
          ),
        ),
      );
    }

    return PlanningSnapshot(
      currentTarget: target,
      currentPlan: currentPlan,
      weeklyPlan: weeklyPlan,
      dailyPlan: dailyPlan,
      targetPreview: _resolveTargetPreview(target),
    );
  }

  Future<void> generatePlan() async {
    final now = DateTime.now();
    final startDate = DateTime(now.year, now.month, now.day);
    var endDate = DateTime(now.year, 12, 21);
    if (!endDate.isAfter(startDate)) {
      endDate = DateTime(now.year + 1, 12, 21);
    }

    final result = await api.client.post(
      api.generatePlanPath,
      body: <String, dynamic>{
        'templateType': 'standard',
        'startDate': _toDateOnly(startDate),
        'endDate': _toDateOnly(endDate),
      },
    );

    if (result is ApiFailure<Map<String, dynamic>>) {
      throw ApiException(
        _mapGenerateError(result.message),
        statusCode: result.statusCode,
      );
    }

    final json = (result as ApiSuccess<Map<String, dynamic>>).data;
    if (json['implemented'] == false) {
      throw FeatureUnavailableException.fromJson(json);
    }
    refreshStore.markDirty();
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

  String _toDateOnly(DateTime value) {
    final month = value.month.toString().padLeft(2, '0');
    final day = value.day.toString().padLeft(2, '0');
    return '${value.year}-$month-$day';
  }

  String _mapGenerateError(String message) {
    switch (message) {
      case 'PROFILE_INCOMPLETE':
        return '当前后端要求先补全档案，才能生成学习规划。';
      case 'TARGET_REQUIRED':
        return '请先在院校详情页设置目标专业。';
      case 'PLAN_ALREADY_EXISTS':
        return '当前已经存在一份进行中的计划。';
      default:
        return message;
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
