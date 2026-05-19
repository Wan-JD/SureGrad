import '../../../core/models/feature_list_item.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/network/api_result.dart';

class ComparisonRepository {
  const ComparisonRepository({required this.client});

  final ApiClient client;

  String get resultPath => '/comparison-items/result';

  Future<List<FeatureListItem>> fetchComparisonResult() async {
    final json = _unwrap(await client.get(resultPath));
    final items = json['items'] as List<dynamic>? ?? const [];
    return items
        .whereType<Map<String, dynamic>>()
        .map(
          (item) => FeatureListItem(
            id:
                item['targetId'] as String? ??
                item['programId'] as String? ??
                '',
            title:
                item['title'] as String? ??
                item['programName'] as String? ??
                '未命名对比项',
            subtitle:
                item['schoolName'] as String? ??
                item['targetType'] as String? ??
                'comparison',
            footnote: item['summary'] as String?,
          ),
        )
        .toList(growable: false);
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
