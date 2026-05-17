import '../../../core/network/api_client.dart';

class ProfileApi {
  const ProfileApi({required this.client});

  final ApiClient client;

  String get mePath => '/users/me';
  String get currentTargetPath => '/user-targets/current';

  Uri meUri() => client.resolve(mePath);
}
