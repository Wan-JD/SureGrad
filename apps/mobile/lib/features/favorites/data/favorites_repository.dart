import '../../../core/models/feature_list_item.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/network/api_result.dart';
import '../../../core/network/api_client.dart';

class FavoritesRepository {
  const FavoritesRepository({required this.client});

  final ApiClient client;

  String get path => '/favorites';

  Future<List<FeatureListItem>> fetchFavorites() async {
    final json = _unwrap(await client.get(path));
    final items = json['items'] as List<dynamic>? ?? const [];
    return items
        .whereType<Map<String, dynamic>>()
        .map(
          (item) => FeatureListItem(
            id: item['targetId'] as String? ?? item['id'] as String? ?? '',
            title:
                item['title'] as String? ??
                item['schoolName'] as String? ??
                item['programName'] as String? ??
                item['resourceTitle'] as String? ??
                '未命名收藏',
            subtitle: item['targetType'] as String? ?? 'favorite',
            footnote: item['subtitle'] as String?,
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
