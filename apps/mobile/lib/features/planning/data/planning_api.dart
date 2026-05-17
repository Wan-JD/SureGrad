import '../../../core/network/api_client.dart';

class PlanningApi {
  const PlanningApi({required this.client});

  final ApiClient client;

  String get currentPlanPath => '/study-plans/current';
  String get generatePlanPath => '/study-plans/generate';
  String get weeklyPlanPath => '/weekly-plans';
  String get dailyPlanPath => '/daily-plans';

  Uri currentPlanUri() => client.resolve(currentPlanPath);
}
