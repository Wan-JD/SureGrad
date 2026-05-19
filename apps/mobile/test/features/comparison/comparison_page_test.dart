import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:suregrad_mobile/app/bootstrap/app_bootstrap.dart';
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
import 'package:suregrad_mobile/features/comparison/presentation/comparison_page.dart';
import 'package:suregrad_mobile/features/favorites/data/favorites_repository.dart';
import 'package:suregrad_mobile/features/planning/data/planning_api.dart';
import 'package:suregrad_mobile/features/planning/data/planning_repository.dart';
import 'package:suregrad_mobile/features/profile/data/profile_api.dart';
import 'package:suregrad_mobile/features/profile/data/profile_repository.dart';
import 'package:suregrad_mobile/features/reminders/data/reminders_repository.dart';
import 'package:suregrad_mobile/features/resources/data/resources_repository.dart';
import 'package:suregrad_mobile/features/schools/data/schools_api.dart';
import 'package:suregrad_mobile/features/schools/data/schools_repository.dart';
import 'package:suregrad_mobile/features/todo/data/todo_api.dart';
import 'package:suregrad_mobile/features/todo/data/todo_repository.dart';

import '../../support/fake_api_client.dart';

void main() {
  testWidgets(
    'comparison page treats an empty comparison set as a first-class state',
    (tester) async {
      final bootstrap = _createBootstrap(
        onGet: (path, {queryParameters}) async {
          expect(path, '/comparison-items/result');
          return const ApiSuccess(<String, dynamic>{
            'items': <Map<String, dynamic>>[],
            'dimensions': <Map<String, dynamic>>[],
            'pool': <String, dynamic>{
              'currentCount': 0,
              'maxCount': 4,
              'isEmpty': true,
            },
          });
        },
      );

      await tester.pumpWidget(_wrap(const ComparisonPage(), bootstrap));
      await tester.pumpAndSettle();

      expect(find.text('比较池还是空的'), findsOneWidget);
      expect(find.textContaining('最多同时比较 4 个专业'), findsOneWidget);
      expect(find.text('看分数线'), findsOneWidget);
    },
  );

  testWidgets(
    'comparison page shows a decision surface for populated results',
    (tester) async {
      final bootstrap = _createBootstrap(
        onGet: (path, {queryParameters}) async {
          expect(path, '/comparison-items/result');
          return const ApiSuccess(<String, dynamic>{
            'dimensions': <Map<String, dynamic>>[
              <String, dynamic>{
                'key': 'totalScore',
                'label': '分数线',
                'unit': '分',
              },
              <String, dynamic>{
                'key': 'applicationRatio',
                'label': '报录比',
                'unit': '比值',
              },
              <String, dynamic>{
                'key': 'interviewRatio',
                'label': '复试比',
                'unit': '比值',
              },
              <String, dynamic>{
                'key': 'plannedEnrollment',
                'label': '招生人数',
                'unit': '人',
              },
              <String, dynamic>{
                'key': 'tuitionPerYear',
                'label': '学费',
                'unit': '元/年',
              },
            ],
            'pool': <String, dynamic>{
              'currentCount': 2,
              'maxCount': 4,
              'isEmpty': false,
            },
            'items': <Map<String, dynamic>>[
              <String, dynamic>{
                'targetId': 'program-1',
                'targetType': 'program',
                'schoolName': '测试大学',
                'programName': '计算机科学',
                'departmentName': '计算机学院',
                'degreeType': 'academic',
                'disciplineCategory': '工学',
                'researchDirection': '人工智能',
                'examMathRequired': true,
                'examYear': 2025,
                'totalScore': 390,
                'applicationRatio': 6.2,
                'interviewRatio': 1.5,
                'plannedEnrollment': 30,
                'tuitionPerYear': 12000,
                'city': '杭州',
                'examSubjects': <String>['101 思想政治理论', '201 英语一'],
                'missingFlags': <String>[],
              },
              <String, dynamic>{
                'targetId': 'program-2',
                'targetType': 'program',
                'schoolName': '另一所大学',
                'programName': '软件工程',
                'departmentName': '软件学院',
                'degreeType': 'professional',
                'disciplineCategory': '工学',
                'researchDirection': null,
                'examMathRequired': false,
                'examYear': 2025,
                'totalScore': null,
                'applicationRatio': 5.8,
                'interviewRatio': null,
                'plannedEnrollment': 45,
                'tuitionPerYear': 15000,
                'city': '上海',
                'examSubjects': <String>[],
                'missingFlags': <String>[
                  'score_line',
                  'interview_ratio',
                  'exam_subjects',
                ],
              },
            ],
          });
        },
      );

      await tester.pumpWidget(_wrap(const ComparisonPage(), bootstrap));
      await tester.pumpAndSettle();

      expect(find.text('计算机科学'), findsWidgets);
      expect(find.text('软件工程'), findsOneWidget);
      expect(find.textContaining('当前共 2 个专业'), findsOneWidget);
      expect(find.text('字段完整'), findsOneWidget);
      expect(find.text('缺失 3 项'), findsOneWidget);
      expect(find.text('390 分'), findsOneWidget);
    },
  );
}

Widget _wrap(Widget child, AppBootstrap bootstrap) {
  return AppScope(
    bootstrap: bootstrap,
    child: MaterialApp(home: child),
  );
}

AppBootstrap _createBootstrap({required GetHandler onGet}) {
  final sessionStore = AppSessionStore();
  sessionStore.signIn(
    phoneNumber: '13800000000',
    userId: 'user-1',
    accessToken: 'token',
    refreshToken: 'refresh',
    profileCompleted: true,
  );

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
