import '../../../core/network/api_client.dart';

class CheckinsApi {
  const CheckinsApi({required this.client});

  final ApiClient client;

  String get todayPath => '/study-checkins/today';
  String get createPath => '/study-checkins';
  String get overviewPath => '/study-stats/overview';
}
