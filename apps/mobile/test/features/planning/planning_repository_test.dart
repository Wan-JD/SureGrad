import 'package:flutter_test/flutter_test.dart';
import 'package:suregrad_mobile/core/network/api_exception.dart';
import 'package:suregrad_mobile/core/network/api_result.dart';
import 'package:suregrad_mobile/core/state/app_refresh_store.dart';
import 'package:suregrad_mobile/core/state/current_target_store.dart';
import 'package:suregrad_mobile/features/planning/data/planning_api.dart';
import 'package:suregrad_mobile/features/planning/data/planning_repository.dart';

import '../../support/fake_api_client.dart';

void main() {
  group('PlanningRepository', () {
    test('generatePlan maps TARGET_REQUIRED to user-facing guidance', () async {
      final repository = PlanningRepository(
        api: PlanningApi(
          client: FakeApiClient(
            onPost: (path, {body, queryParameters}) async {
              expect(path, '/study-plans/generate');
              return const ApiFailure('TARGET_REQUIRED', statusCode: 400);
            },
          ),
        ),
        refreshStore: AppRefreshStore(),
        currentTargetStore: CurrentTargetStore(),
      );

      expect(
        repository.generatePlan(),
        throwsA(
          isA<ApiException>().having(
            (error) => error.message,
            'message',
            '请先在院校详情页设置目标专业。',
          ),
        ),
      );
    });

    test(
      'fetchPlanningSnapshot reuses current target preview for headline',
      () async {
        final currentTargetStore = CurrentTargetStore()
          ..update(
            const CurrentTargetPreview(
              schoolId: 'school-1',
              schoolName: '西南大学',
              departmentId: 'dept-1',
              departmentName: '计算机学院',
              programId: 'program-1',
              programName: '计算机技术',
              targetScore: 360,
            ),
          );
        final repository = PlanningRepository(
          api: PlanningApi(
            client: FakeApiClient(
              onGet: (path, {queryParameters}) async {
                switch (path) {
                  case '/user-targets/current':
                    return const ApiSuccess(<String, dynamic>{
                      'userTargetId': 'target-1',
                      'schoolId': 'school-1',
                      'programId': 'program-1',
                      'targetStatus': 'active',
                    });
                  case '/study-plans/current':
                    return const ApiSuccess(<String, dynamic>{
                      'studyPlanId': 'plan-1',
                      'title': '冲刺计划',
                      'templateType': 'standard',
                      'phases': <Map<String, dynamic>>[],
                    });
                  default:
                    fail('Unexpected path: $path');
                }
              },
            ),
          ),
          refreshStore: AppRefreshStore(),
          currentTargetStore: currentTargetStore,
        );

        final snapshot = await repository.fetchPlanningSnapshot();

        expect(snapshot.headline, '西南大学 / 计算机技术');
      },
    );
  });
}
