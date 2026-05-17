import 'planning_api.dart';

class PlanningRepository {
  const PlanningRepository({required this.api});

  final PlanningApi api;

  String get currentPlanPath => api.currentPlanPath;
  String get generatePlanPath => api.generatePlanPath;
  String get weeklyPlanPath => api.weeklyPlanPath;
  String get dailyPlanPath => api.dailyPlanPath;
}
