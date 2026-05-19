import '../../../core/network/api_exception.dart';
import '../../../core/network/api_result.dart';
import '../../../core/state/app_refresh_store.dart';
import 'todo_api.dart';
import 'todo_models.dart';

class TodoRepository {
  const TodoRepository({required this.api, required this.refreshStore});

  final TodoApi api;
  final AppRefreshStore refreshStore;

  String get listPath => api.listPath;

  Future<TodoSnapshot> fetchToday({String? date}) async {
    final result = await api.client.get(
      api.listPath,
      queryParameters: <String, dynamic>{
        ...?date == null ? null : <String, dynamic>{'date': date},
      },
    );
    final json = _unwrap(result);
    final items = json['items'] as List<dynamic>? ?? const [];
    return TodoSnapshot(
      summary: TodoSummary.fromJson(
        json['summary'] is Map<String, dynamic>
            ? json['summary'] as Map<String, dynamic>
            : const <String, dynamic>{},
      ),
      items: items
          .whereType<Map<String, dynamic>>()
          .map(TodoItem.fromJson)
          .toList(growable: false),
    );
  }

  Future<void> completeTodo(String todoItemId) async {
    final result = await api.client.post(api.completePath(todoItemId));
    _unwrap(result);
    refreshStore.markDirty();
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
