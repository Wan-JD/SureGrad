import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:suregrad_mobile/app/bootstrap/app_bootstrap.dart';
import 'package:suregrad_mobile/app/navigation/resource_detail_route_args.dart';
import 'package:suregrad_mobile/core/network/api_config.dart';
import 'package:suregrad_mobile/core/network/api_result.dart';
import 'package:suregrad_mobile/core/state/app_refresh_store.dart';
import 'package:suregrad_mobile/core/state/app_session_store.dart';
import 'package:suregrad_mobile/core/state/current_target_store.dart';
import 'package:suregrad_mobile/features/auth/data/auth_api.dart';
import 'package:suregrad_mobile/features/auth/data/auth_repository.dart';
import 'package:suregrad_mobile/features/checkins/data/checkins_api.dart';
import 'package:suregrad_mobile/features/checkins/data/checkins_repository.dart';
import 'package:suregrad_mobile/features/comparison/data/comparison_repository.dart';
import 'package:suregrad_mobile/features/favorites/data/favorites_repository.dart';
import 'package:suregrad_mobile/features/planning/data/planning_api.dart';
import 'package:suregrad_mobile/features/planning/data/planning_repository.dart';
import 'package:suregrad_mobile/features/profile/data/profile_api.dart';
import 'package:suregrad_mobile/features/profile/data/profile_repository.dart';
import 'package:suregrad_mobile/features/programs/data/programs_api.dart';
import 'package:suregrad_mobile/features/programs/data/programs_repository.dart';
import 'package:suregrad_mobile/features/reminders/data/reminders_repository.dart';
import 'package:suregrad_mobile/features/resources/data/resources_repository.dart';
import 'package:suregrad_mobile/features/resources/presentation/resource_detail_page.dart';
import 'package:suregrad_mobile/features/schools/data/schools_api.dart';
import 'package:suregrad_mobile/features/schools/data/schools_repository.dart';
import 'package:suregrad_mobile/features/todo/data/todo_api.dart';
import 'package:suregrad_mobile/features/todo/data/todo_repository.dart';

import '../../support/fake_api_client.dart';

void main() {
  testWidgets('resource detail page renders summary and source sections', (
    tester,
  ) async {
    final bootstrap = _createBootstrap(
      onGet: (path, {queryParameters}) async {
        if (path == '/study-resources/resource-1') {
          return const ApiSuccess(<String, dynamic>{
            'resourceId': 'resource-1',
            'title': '政治基础精讲（演示）',
            'resourceType': 'course',
            'subjectId': 'subject-1',
            'subjectName': '思想政治理论',
            'stageTag': 'foundation',
            'providerName': 'SureGrad Demo',
            'summary': '马原与思修入门串讲，适合首轮系统过一遍。',
            'usageAdvice': '每天 1 小时，配合章节练习。',
            'sourceUrl': 'https://example.com/demo/politics-foundation',
            'isPublicLegal': true,
            'isFavorited': false,
          });
        }
        return const ApiFailure('unexpected path', statusCode: 404);
      },
    );

    await tester.pumpWidget(
      MaterialApp(
        home: AppScope(
          bootstrap: bootstrap,
          child: const ResourceDetailPage(
            args: ResourceDetailRouteArgs(
              resourceId: 'resource-1',
              resourceTitle: '资料详情',
            ),
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('政治基础精讲（演示）'), findsWidgets);
    expect(find.text('资料简介'), findsOneWidget);
    expect(find.text('使用建议'), findsOneWidget);
    expect(find.text('来源链接'), findsOneWidget);
    expect(find.textContaining('example.com/demo/politics-foundation'), findsOneWidget);
  });
}

AppBootstrap _createBootstrap({
  required Future<ApiResult<Map<String, dynamic>>> Function(
    String path, {
    Map<String, dynamic>? queryParameters,
  })
  onGet,
}) {
  final client = FakeApiClient(onGet: onGet);
  final sessionStore = AppSessionStore();
  final refreshStore = AppRefreshStore();
  final currentTargetStore = CurrentTargetStore();
  const apiConfig = ApiConfig(baseUrl: 'http://localhost:3000/api/v1');

  return AppBootstrap(
    apiConfig: apiConfig,
    apiClient: client,
    sessionStore: sessionStore,
    refreshStore: refreshStore,
    currentTargetStore: currentTargetStore,
    authRepository: AuthRepository(api: AuthApi(client: client)),
    schoolsRepository: SchoolsRepository(
      api: SchoolsApi(client: client),
      refreshStore: refreshStore,
      currentTargetStore: currentTargetStore,
    ),
    programsRepository: ProgramsRepository(
      api: ProgramsApi(client: client),
      refreshStore: refreshStore,
      currentTargetStore: currentTargetStore,
    ),
    planningRepository: PlanningRepository(
      api: PlanningApi(client: client),
      refreshStore: refreshStore,
      currentTargetStore: currentTargetStore,
    ),
    todoRepository: TodoRepository(
      api: TodoApi(client: client),
      refreshStore: refreshStore,
    ),
    checkinsRepository: CheckinsRepository(
      api: CheckinsApi(client: client),
      refreshStore: refreshStore,
    ),
    profileRepository: ProfileRepository(
      api: ProfileApi(client: client),
      currentTargetStore: currentTargetStore,
    ),
    favoritesRepository: FavoritesRepository(client: client),
    comparisonRepository: ComparisonRepository(client: client),
    remindersRepository: RemindersRepository(client: client),
    resourcesRepository: ResourcesRepository(client: client),
  );
}
