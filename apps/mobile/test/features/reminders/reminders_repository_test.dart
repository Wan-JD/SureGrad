import 'package:flutter_test/flutter_test.dart';
import 'package:suregrad_mobile/core/network/api_result.dart';
import 'package:suregrad_mobile/features/reminders/data/reminders_repository.dart';

import '../../support/fake_api_client.dart';

void main() {
  test('fetchReminders maps reminder state', () async {
    final repository = RemindersRepository(
      client: FakeApiClient(
        onGet: (path, {queryParameters}) async {
          expect(path, '/reminders');
          return const ApiSuccess(<String, dynamic>{
            'items': [
              {
                'reminderId': 'reminder-1',
                'title': '晚间复盘',
                'content': '记得整理错题',
                'reminderType': 'study',
                'remindAt': '2026-05-19T20:00:00.000Z',
                'isEnabled': true,
                'isSystemDefault': false,
              },
            ],
          });
        },
      ),
    );

    final reminders = await repository.fetchReminders();

    expect(reminders.single.id, 'reminder-1');
    expect(reminders.single.isEnabled, isTrue);
    expect(reminders.single.reminderType, 'study');
  });

  test('updateReminder sends enabled state', () async {
    final repository = RemindersRepository(
      client: FakeApiClient(
        onPatch: (path, {body, queryParameters}) async {
          expect(path, '/reminders/reminder-1');
          expect(body, <String, dynamic>{'isEnabled': false});
          return const ApiSuccess(<String, dynamic>{
            'reminderId': 'reminder-1',
            'isEnabled': false,
          });
        },
      ),
    );

    await repository.updateReminder('reminder-1', false);
  });
}
