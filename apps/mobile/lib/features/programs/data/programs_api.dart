import '../../../core/network/api_client.dart';

class ProgramsApi {
  const ProgramsApi({required this.client});

  final ApiClient client;

  String programPath(String programId) => '/programs/$programId';
  String get favoritesPath => '/favorites';
  String get comparisonItemsPath => '/comparison-items';
  String get currentTargetPath => '/user-targets/current';
}
