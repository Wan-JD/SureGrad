import 'package:flutter/widgets.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_config.dart';
import '../../core/state/app_session_store.dart';
import '../../features/auth/data/auth_api.dart';
import '../../features/auth/data/auth_repository.dart';
import '../../features/planning/data/planning_api.dart';
import '../../features/planning/data/planning_repository.dart';
import '../../features/profile/data/profile_api.dart';
import '../../features/profile/data/profile_repository.dart';
import '../../features/schools/data/schools_api.dart';
import '../../features/schools/data/schools_repository.dart';
import '../../features/todo/data/todo_api.dart';
import '../../features/todo/data/todo_repository.dart';

class AppBootstrap {
  const AppBootstrap._({
    required this.apiConfig,
    required this.apiClient,
    required this.sessionStore,
    required this.authRepository,
    required this.schoolsRepository,
    required this.planningRepository,
    required this.todoRepository,
    required this.profileRepository,
  });

  factory AppBootstrap.create() {
    const apiConfig = ApiConfig(baseUrl: 'http://localhost:3000/api/v1');
    const apiClient = ApiClient(config: apiConfig);
    final sessionStore = AppSessionStore();

    return AppBootstrap._(
      apiConfig: apiConfig,
      apiClient: apiClient,
      sessionStore: sessionStore,
      authRepository: AuthRepository(api: const AuthApi(client: apiClient)),
      schoolsRepository: SchoolsRepository(
        api: const SchoolsApi(client: apiClient),
      ),
      planningRepository: PlanningRepository(
        api: const PlanningApi(client: apiClient),
      ),
      todoRepository: TodoRepository(api: const TodoApi(client: apiClient)),
      profileRepository: ProfileRepository(
        api: const ProfileApi(client: apiClient),
      ),
    );
  }

  final ApiConfig apiConfig;
  final ApiClient apiClient;
  final AppSessionStore sessionStore;
  final AuthRepository authRepository;
  final SchoolsRepository schoolsRepository;
  final PlanningRepository planningRepository;
  final TodoRepository todoRepository;
  final ProfileRepository profileRepository;
}

class AppScope extends InheritedWidget {
  const AppScope({super.key, required this.bootstrap, required super.child});

  final AppBootstrap bootstrap;

  static AppBootstrap of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppScope>();
    assert(scope != null, 'AppScope is not available in this context.');
    return scope!.bootstrap;
  }

  @override
  bool updateShouldNotify(AppScope oldWidget) {
    return bootstrap != oldWidget.bootstrap;
  }
}
