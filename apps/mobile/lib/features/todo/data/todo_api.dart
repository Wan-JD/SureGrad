import '../../../core/network/api_client.dart';

class TodoApi {
  const TodoApi({required this.client});

  final ApiClient client;

  String get listPath => '/todo-items';

  String completePath(String todoItemId) => '/todo-items/$todoItemId/complete';
}
