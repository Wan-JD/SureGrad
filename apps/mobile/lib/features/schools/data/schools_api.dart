import '../../../core/network/api_client.dart';

class SchoolsApi {
  const SchoolsApi({required this.client});

  final ApiClient client;

  String get listPath => '/schools';
  String get detailPathPattern => '/schools/{schoolId}';
  String get programsPathPattern => '/schools/{schoolId}/programs';
  String get favoritesPath => '/favorites';
  String get comparisonItemsPath => '/comparison-items';
  String get currentTargetPath => '/user-targets/current';
}
