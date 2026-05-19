import 'package:flutter_test/flutter_test.dart';
import 'package:suregrad_mobile/core/network/api_result.dart';
import 'package:suregrad_mobile/core/state/app_refresh_store.dart';
import 'package:suregrad_mobile/features/checkins/data/checkins_api.dart';
import 'package:suregrad_mobile/features/checkins/data/checkins_repository.dart';

import '../../support/fake_api_client.dart';

void main() {
  test('fetchOverview maps overview aggregates', () async {
    final repository = CheckinsRepository(
      api: CheckinsApi(
        client: FakeApiClient(
          onGet: (path, {queryParameters}) async {
            expect(path, '/study-stats/overview');
            expect(queryParameters, <String, dynamic>{'range': 'week'});
            return const ApiSuccess(<String, dynamic>{
              'todayStudyMinutes': 120,
              'weekStudyMinutes': 420,
              'continuousCheckinDays': 5,
              'todoCompletionRate': 0.75,
              'todayPendingTodoCount': 1,
              'currentTarget': {'programName': '计算机科学'},
              'currentPlan': {'title': '五月冲刺计划'},
              'subjectDistribution': [
                {
                  'subjectId': 'subject-1',
                  'subjectName': '政治',
                  'studyMinutes': 240,
                  'ratio': 0.57,
                },
              ],
            });
          },
        ),
      ),
      refreshStore: AppRefreshStore(),
    );

    final overview = await repository.fetchOverview();

    expect(overview.weekStudyMinutes, 420);
    expect(overview.continuousCheckinDays, 5);
    expect(overview.currentTargetName, '计算机科学');
    expect(overview.currentPlanTitle, '五月冲刺计划');
    expect(overview.subjectDistribution.single.studyMinutes, 240);
  });

  test('createCheckin marks refresh store dirty after success', () async {
    final refreshStore = AppRefreshStore();
    final repository = CheckinsRepository(
      api: CheckinsApi(
        client: FakeApiClient(
          onPost: (path, {body, queryParameters}) async {
            expect(path, '/study-checkins');
            expect(body?['totalStudyMinutes'], 95);
            expect(body?['reflection'], '状态稳定');
            expect(body?['moodTag'], 'steady');
            return const ApiSuccess(<String, dynamic>{
              'checkinId': 'checkin-1',
              'checkinDate': '2026-05-19',
              'continuousDays': 4,
              'todayStudyMinutes': 95,
            });
          },
        ),
      ),
      refreshStore: refreshStore,
    );

    final result = await repository.createCheckin(
      totalStudyMinutes: 95,
      reflection: '状态稳定',
      moodTag: 'steady',
    );

    expect(result.continuousDays, 4);
    expect(refreshStore.revision, 1);
  });
}
