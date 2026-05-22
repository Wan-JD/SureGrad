import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:suregrad_mobile/app/bootstrap/app_bootstrap.dart';
import 'package:suregrad_mobile/app/navigation/program_detail_route_args.dart';
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
import 'package:suregrad_mobile/features/programs/presentation/program_detail_page.dart';
import 'package:suregrad_mobile/features/reminders/data/reminders_repository.dart';
import 'package:suregrad_mobile/features/resources/data/resources_repository.dart';
import 'package:suregrad_mobile/features/schools/data/schools_api.dart';
import 'package:suregrad_mobile/features/schools/data/schools_repository.dart';
import 'package:suregrad_mobile/features/todo/data/todo_api.dart';
import 'package:suregrad_mobile/features/todo/data/todo_repository.dart';

import '../../support/fake_api_client.dart';

void main() {
  testWidgets('program detail page renders aggregated sections', (tester) async {
    final bootstrap = _createBootstrap(
      onGet: (path, {queryParameters}) async {
        if (path == '/programs/program-1') {
          return const ApiSuccess(<String, dynamic>{
            'programId': 'program-1',
            'programName': '计算机科学与技术',
            'programCode': '081200',
            'degreeType': 'academic',
            'school': <String, dynamic>{
              'schoolId': 'school-1',
              'schoolName': '华东理工大学',
              'city': '上海',
            },
            'department': <String, dynamic>{
              'departmentId': 'dept-1',
              'departmentName': '信息科学与工程学院',
            },
            'scoreLineSummary': <String, dynamic>{
              'examYear': 2024,
              'totalScore': 360,
            },
            'scoreLines': <Map<String, dynamic>>[
              <String, dynamic>{'examYear': 2024, 'totalScore': 360},
            ],
            'applicationStats': <Map<String, dynamic>>[],
            'interviewStats': <Map<String, dynamic>>[],
            'admissions': <Map<String, dynamic>>[],
            'examSubjects': <Map<String, dynamic>>[],
            'referenceBooks': <Map<String, dynamic>>[],
            'sourceLinks': <Map<String, dynamic>>[
              <String, dynamic>{
                'sourceLinkId': 'link-1',
                'title': '2024 招生简章',
                'url': 'https://example.com/brochure',
              },
            ],
            'disclaimer': '以官方最新公告为准',
          });
        }
        return const ApiFailure('unexpected path', statusCode: 404);
      },
    );

    await tester.pumpWidget(
      MaterialApp(
        home: AppScope(
          bootstrap: bootstrap,
          child: const ProgramDetailPage(
            args: ProgramDetailRouteArgs(
              programId: 'program-1',
              programName: '计算机科学与技术',
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('计算机科学与技术'), findsWidgets);
    expect(find.text('关键指标摘要'), findsOneWidget);
    expect(find.text('加入对比'), findsOneWidget);
    expect(find.text('设为目标'), findsOneWidget);

    await tester.scrollUntilVisible(
      find.text('历年分数线'),
      120,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();

    expect(find.text('历年分数线'), findsOneWidget);
    expect(find.textContaining('2024'), findsWidgets);
    expect(find.textContaining('总分 360'), findsWidgets);
    expect(find.text('暂无报录比数据'), findsOneWidget);
  });
}

AppBootstrap _createBootstrap({required GetHandler onGet}) {
  final sessionStore = AppSessionStore();
  final refreshStore = AppRefreshStore();
  final currentTargetStore = CurrentTargetStore();
  final client = FakeApiClient(onGet: onGet);

  return AppBootstrap(
    apiConfig: const ApiConfig(baseUrl: 'http://example.test'),
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
