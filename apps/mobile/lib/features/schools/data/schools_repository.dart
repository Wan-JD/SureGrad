import 'schools_api.dart';

class SchoolsRepository {
  const SchoolsRepository({required this.api});

  final SchoolsApi api;

  String get listPath => api.listPath;
  String get detailPathPattern => api.detailPathPattern;
  String get programsPathPattern => api.programsPathPattern;
}
