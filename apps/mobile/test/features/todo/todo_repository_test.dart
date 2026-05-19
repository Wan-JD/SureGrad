import 'package:flutter_test/flutter_test.dart';
import 'package:suregrad_mobile/core/network/api_result.dart';
import 'package:suregrad_mobile/core/state/app_refresh_store.dart';
import 'package:suregrad_mobile/features/todo/data/todo_api.dart';
import 'package:suregrad_mobile/features/todo/data/todo_repository.dart';

import '../../support/fake_api_client.dart';

void main() {
  test('completeTodo marks refresh store dirty after success', () async {
    final refreshStore = AppRefreshStore();
    final repository = TodoRepository(
      api: TodoApi(
        client: FakeApiClient(
          onPost: (path, {body, queryParameters}) async {
            expect(path, '/todo-items/todo-1/complete');
            return const ApiSuccess(<String, dynamic>{'ok': true});
          },
        ),
      ),
      refreshStore: refreshStore,
    );

    await repository.completeTodo('todo-1');

    expect(refreshStore.revision, 1);
  });
}
