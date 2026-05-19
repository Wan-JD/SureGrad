import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:suregrad_mobile/app/bootstrap/app_bootstrap.dart';
import 'package:suregrad_mobile/core/models/main_journey_state.dart';
import 'package:suregrad_mobile/core/network/api_config.dart';
import 'package:suregrad_mobile/core/network/api_result.dart';
import 'package:suregrad_mobile/core/state/app_refresh_store.dart';
import 'package:suregrad_mobile/core/state/app_session_store.dart';
import 'package:suregrad_mobile/core/state/current_target_store.dart';
import 'package:suregrad_mobile/features/auth/data/auth_api.dart';
import 'package:suregrad_mobile/features/auth/data/auth_repository.dart';
import 'package:suregrad_mobile/features/comparison/data/comparison_repository.dart';
import 'package:suregrad_mobile/features/favorites/data/favorites_repository.dart';
import 'package:suregrad_mobile/features/home/presentation/home_page.dart';
import 'package:suregrad_mobile/features/planning/data/planning_api.dart';
import 'package:suregrad_mobile/features/planning/data/planning_models.dart';
import 'package:suregrad_mobile/features/planning/data/planning_repository.dart';
import 'package:suregrad_mobile/features/planning/presentation/planning_page.dart';
import 'package:suregrad_mobile/features/profile/data/profile_api.dart';
import 'package:suregrad_mobile/features/profile/data/profile_models.dart';
import 'package:suregrad_mobile/features/profile/data/profile_repository.dart';
import 'package:suregrad_mobile/features/profile/presentation/profile_page.dart';
import 'package:suregrad_mobile/features/reminders/data/reminders_repository.dart';
import 'package:suregrad_mobile/features/resources/data/resources_repository.dart';
import 'package:suregrad_mobile/features/schools/data/schools_api.dart';
import 'package:suregrad_mobile/features/schools/data/schools_repository.dart';
import 'package:suregrad_mobile/features/todo/data/todo_api.dart';
import 'package:suregrad_mobile/features/todo/data/todo_repository.dart';

import '../../support/fake_api_client.dart';

void main() {
  group('main journey state models', () {
    test('planning snapshot derives noTarget, noPlan, hasPlan', () {
      expect(
        _planningSnapshot(hasTarget: false, hasPlan: false).journeyState.label,
        '未设目标',
      );
      expect(
        _planningSnapshot(hasTarget: true, hasPlan: false).journeyState.label,
        '无计划',
      );
      expect(
        _planningSnapshot(hasTarget: true, hasPlan: true).journeyState.label,
        '有计划',
      );
    });

    test('profile screen derives noTarget, noPlan, hasPlan', () {
      expect(
        _profileData(hasTarget: false, hasPlan: false).journeyState.label,
        '未设目标',
      );
      expect(
        _profileData(hasTarget: true, hasPlan: false).journeyState.label,
        '无计划',
      );
      expect(
        _profileData(hasTarget: true, hasPlan: true).journeyState.label,
        '有计划',
      );
    });
  });

  group('main journey pages', () {
    testWidgets('home page shows no target state', (tester) async {
      final bootstrap = _createBootstrap(
        loggedIn: true,
        onGet: (path, {queryParameters}) async {
          switch (path) {
            case '/user-targets/current':
              return const ApiSuccess(<String, dynamic>{});
            case '/study-plans/current':
              return const ApiSuccess(<String, dynamic>{
                'phases': <Map<String, dynamic>>[],
              });
            default:
              return const ApiFailure('unexpected path', statusCode: 404);
          }
        },
      );

      await tester.pumpWidget(_wrap(const HomePage(), bootstrap));
      await tester.pumpAndSettle();

      expect(find.text('未设目标'), findsWidgets);
      expect(find.text('先完成目标设置'), findsOneWidget);
    });

    testWidgets('planning page shows no plan state', (tester) async {
      final bootstrap = _createBootstrap(
        loggedIn: true,
        onGet: (path, {queryParameters}) async {
          switch (path) {
            case '/user-targets/current':
              return const ApiSuccess(<String, dynamic>{
                'userTargetId': 'target-1',
                'schoolId': 'school-1',
                'programId': 'program-1',
              });
            case '/study-plans/current':
              return const ApiSuccess(<String, dynamic>{
                'phases': <Map<String, dynamic>>[],
              });
            default:
              return const ApiFailure('unexpected path', statusCode: 404);
          }
        },
      );

      await tester.pumpWidget(_wrap(const PlanningPage(), bootstrap));
      await tester.pumpAndSettle();

      expect(find.text('无计划'), findsWidgets);
      expect(find.text('目标已同步，暂时还没有计划'), findsOneWidget);
    });

    testWidgets('profile page shows has plan state', (tester) async {
      final bootstrap = _createBootstrap(
        loggedIn: true,
        onGet: (path, {queryParameters}) async {
          switch (path) {
            case '/users/me':
              return const ApiSuccess(<String, dynamic>{
                'userId': 'user-1',
                'phoneMasked': '138****0000',
                'nickname': 'SureGrad',
                'profileCompleted': true,
                'hasActiveTarget': true,
                'hasActivePlan': true,
              });
            case '/user-targets/current':
              return const ApiSuccess(<String, dynamic>{
                'userTargetId': 'target-1',
                'schoolId': 'school-1',
                'programId': 'program-1',
              });
            default:
              return const ApiFailure('unexpected path', statusCode: 404);
          }
        },
      );

      await tester.pumpWidget(_wrap(const ProfilePage(), bootstrap));
      await tester.pumpAndSettle();

      expect(find.text('有计划'), findsWidgets);
      expect(find.text('当前进度'), findsOneWidget);
      expect(find.text('查看今日 Todo'), findsOneWidget);
    });

    testWidgets('planning page shows load failure state', (tester) async {
      final bootstrap = _createBootstrap(
        loggedIn: true,
        onGet: (path, {queryParameters}) async {
          return const ApiFailure('server down', statusCode: 500);
        },
      );

      await tester.pumpWidget(_wrap(const PlanningPage(), bootstrap));
      await tester.pumpAndSettle();

      expect(find.text('规划加载失败'), findsOneWidget);
      expect(find.textContaining('server down'), findsOneWidget);
      expect(find.text('重试'), findsOneWidget);
    });
  });
}

PlanningSnapshot _planningSnapshot({
  required bool hasTarget,
  required bool hasPlan,
}) {
  return PlanningSnapshot(
    currentTarget: CurrentTargetRecord(
      userTargetId: hasTarget ? 'target-1' : null,
      schoolId: hasTarget ? 'school-1' : null,
      departmentId: null,
      programId: hasTarget ? 'program-1' : null,
      targetScore: null,
      targetStatus: null,
      selectedAt: null,
    ),
    currentPlan: CurrentStudyPlan(
      studyPlanId: hasPlan ? 'plan-1' : null,
      title: null,
      templateType: null,
      startDate: null,
      endDate: null,
      status: null,
      totalExpectedHours: null,
      phases: const [],
      currentWeek: null,
      todayPlan: null,
    ),
    weeklyPlan: null,
    dailyPlan: null,
    targetPreview: null,
  );
}

ProfileScreenData _profileData({
  required bool hasTarget,
  required bool hasPlan,
}) {
  return ProfileScreenData(
    me: UserProfileSnapshot(
      userId: 'user-1',
      phoneMasked: null,
      nickname: null,
      avatarUrl: null,
      profileCompleted: true,
      hasActiveTarget: hasTarget,
      hasActivePlan: hasPlan,
    ),
    currentTarget: CurrentTargetRecord(
      userTargetId: hasTarget ? 'target-1' : null,
      schoolId: hasTarget ? 'school-1' : null,
      departmentId: null,
      programId: hasTarget ? 'program-1' : null,
      targetScore: null,
      targetStatus: null,
      selectedAt: null,
    ),
    targetPreview: null,
  );
}

Widget _wrap(Widget child, AppBootstrap bootstrap) {
  return AppScope(
    bootstrap: bootstrap,
    child: MaterialApp(home: child),
  );
}

AppBootstrap _createBootstrap({
  required bool loggedIn,
  required GetHandler onGet,
}) {
  final sessionStore = AppSessionStore();
  if (loggedIn) {
    sessionStore.signIn(
      phoneNumber: '13800000000',
      userId: 'user-1',
      accessToken: 'token',
      refreshToken: 'refresh',
      profileCompleted: true,
    );
  }

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
    planningRepository: PlanningRepository(
      api: PlanningApi(client: client),
      refreshStore: refreshStore,
      currentTargetStore: currentTargetStore,
    ),
    todoRepository: TodoRepository(
      api: TodoApi(client: client),
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
