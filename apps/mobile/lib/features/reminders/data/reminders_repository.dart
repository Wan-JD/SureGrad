import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/network/api_result.dart';
import 'reminder_models.dart';

class RemindersRepository {
  const RemindersRepository({required this.client});

  final ApiClient client;

  String get path => '/reminders';

  Future<List<ReminderItem>> fetchReminders() async {
    final json = _unwrap(await client.get(path));
    final items = json['items'] as List<dynamic>? ?? const [];
    return items
        .whereType<Map<String, dynamic>>()
        .map(ReminderItem.fromJson)
        .toList(growable: false);
  }

  Future<void> updateReminder(String reminderId, bool enabled) async {
    final result = await client.patch(
      '/reminders/$reminderId',
      body: <String, dynamic>{'isEnabled': enabled},
    );
    _unwrap(result);
  }

  Map<String, dynamic> _unwrap(ApiResult<Map<String, dynamic>> result) {
    if (result is ApiFailure<Map<String, dynamic>>) {
      throw ApiException(result.message, statusCode: result.statusCode);
    }
    final json = (result as ApiSuccess<Map<String, dynamic>>).data;
    if (json['implemented'] == false) {
      throw FeatureUnavailableException.fromJson(json);
    }
    return json;
  }
}
