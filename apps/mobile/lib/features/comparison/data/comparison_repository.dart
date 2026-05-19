import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/network/api_result.dart';
import 'comparison_models.dart';

class ComparisonRepository {
  const ComparisonRepository({required this.client});

  final ApiClient client;

  String get resultPath => '/comparison-items/result';

  Future<ComparisonResult> fetchComparisonResult() async {
    final json = _unwrap(await client.get(resultPath));
    return ComparisonResult.fromJson(json);
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
