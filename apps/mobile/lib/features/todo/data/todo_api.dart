import '../../../core/network/api_client.dart';

class TodoApi {
  const TodoApi({required this.client});

  final ApiClient client;

  String get listPath => '/todo-items';
  String get completePathPattern => '/todo-items/{todoItemId}/complete';

  Uri listUri() => client.resolve(listPath);
}
