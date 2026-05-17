import 'profile_api.dart';

class ProfileRepository {
  const ProfileRepository({required this.api});

  final ProfileApi api;

  String get mePath => api.mePath;
  String get currentTargetPath => api.currentTargetPath;
}
