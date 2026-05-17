import 'todo_api.dart';

class TodoRepository {
  const TodoRepository({required this.api});

  final TodoApi api;

  String get listPath => api.listPath;
  String get completePathPattern => api.completePathPattern;
}
