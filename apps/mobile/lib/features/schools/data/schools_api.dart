import '../../../core/network/api_client.dart';

class SchoolsApi {
  const SchoolsApi({required this.client});

  final ApiClient client;

  String get listPath => '/schools';
  String get detailPathPattern => '/schools/{schoolId}';
  String get programsPathPattern => '/schools/{schoolId}/programs';

  Uri listUri() => client.resolve(listPath);
  Uri detailUri(String schoolId) => client.resolve('/schools/$schoolId');
}
