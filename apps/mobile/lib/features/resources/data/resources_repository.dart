import '../../../core/models/feature_list_item.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/network/api_result.dart';

class ResourcesRepository {
  const ResourcesRepository({required this.client});

  final ApiClient client;

  String get path => '/study-resources';

  Future<List<FeatureListItem>> fetchResources() async {
    final json = _unwrap(await client.get(path));
    final items = json['items'] as List<dynamic>? ?? const [];
    return items
        .whereType<Map<String, dynamic>>()
        .map(
          (item) => FeatureListItem(
            id: item['resourceId'] as String? ?? item['id'] as String? ?? '',
            title: item['title'] as String? ?? '未命名资料',
            subtitle:
                item['subjectName'] as String? ??
                item['resourceType'] as String? ??
                'resource',
            footnote: item['provider'] as String?,
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
