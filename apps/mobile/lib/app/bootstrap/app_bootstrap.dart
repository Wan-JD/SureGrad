import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_config.dart';
import '../../core/state/app_refresh_store.dart';
import '../../core/state/app_session_store.dart';
import '../../core/state/current_target_store.dart';
import '../../features/auth/data/auth_api.dart';
import '../../features/auth/data/auth_repository.dart';
import '../../features/checkins/data/checkins_api.dart';
import '../../features/checkins/data/checkins_repository.dart';
import '../../features/comparison/data/comparison_repository.dart';
import '../../features/favorites/data/favorites_repository.dart';
import '../../features/planning/data/planning_api.dart';
import '../../features/planning/data/planning_repository.dart';
import '../../features/programs/data/programs_api.dart';
import '../../features/programs/data/programs_repository.dart';
import '../../features/profile/data/profile_api.dart';
import '../../features/profile/data/profile_repository.dart';
import '../../features/reminders/data/reminders_repository.dart';
import '../../features/resources/data/resources_repository.dart';
import '../../features/schools/data/schools_api.dart';
import '../../features/schools/data/schools_repository.dart';
import '../../features/todo/data/todo_api.dart';
import '../../features/todo/data/todo_repository.dart';

class AppBootstrap {
  const AppBootstrap({
    required this.apiConfig,
    required this.apiClient,
    required this.sessionStore,
    required this.refreshStore,
    required this.currentTargetStore,
    required this.authRepository,
    required this.schoolsRepository,
    required this.programsRepository,
    required this.planningRepository,
    required this.todoRepository,
    required this.checkinsRepository,
    required this.profileRepository,
    required this.favoritesRepository,
    required this.comparisonRepository,
    required this.remindersRepository,
    required this.resourcesRepository,
  });

  factory AppBootstrap.create() {
    const overrideBaseUrl = String.fromEnvironment(
      'SUREGRAD_API_BASE_URL',
      defaultValue: '',
    );
    final resolvedBaseUrl = overrideBaseUrl.isNotEmpty
        ? overrideBaseUrl
        : defaultTargetPlatform == TargetPlatform.android
        ? 'http://10.0.2.2:3000/api/v1'
        : 'http://localhost:3000/api/v1';

    final sessionStore = AppSessionStore();
    final refreshStore = AppRefreshStore();
    final currentTargetStore = CurrentTargetStore();
    final apiConfig = ApiConfig(baseUrl: resolvedBaseUrl);
    final apiClient = ApiClient(config: apiConfig, sessionStore: sessionStore);

    return AppBootstrap(
      apiConfig: apiConfig,
      apiClient: apiClient,
      sessionStore: sessionStore,
      refreshStore: refreshStore,
      currentTargetStore: currentTargetStore,
      authRepository: AuthRepository(api: AuthApi(client: apiClient)),
      schoolsRepository: SchoolsRepository(
        api: SchoolsApi(client: apiClient),
        refreshStore: refreshStore,
        currentTargetStore: currentTargetStore,
      ),
      programsRepository: ProgramsRepository(
        api: ProgramsApi(client: apiClient),
        refreshStore: refreshStore,
        currentTargetStore: currentTargetStore,
      ),
      planningRepository: PlanningRepository(
        api: PlanningApi(client: apiClient),
        refreshStore: refreshStore,
        currentTargetStore: currentTargetStore,
      ),
      todoRepository: TodoRepository(
        api: TodoApi(client: apiClient),
        refreshStore: refreshStore,
      ),
      checkinsRepository: CheckinsRepository(
        api: CheckinsApi(client: apiClient),
        refreshStore: refreshStore,
      ),
      profileRepository: ProfileRepository(
        api: ProfileApi(client: apiClient),
        currentTargetStore: currentTargetStore,
      ),
      favoritesRepository: FavoritesRepository(client: apiClient),
      comparisonRepository: ComparisonRepository(client: apiClient),
      remindersRepository: RemindersRepository(client: apiClient),
      resourcesRepository: ResourcesRepository(client: apiClient),
    );
  }

  final ApiConfig apiConfig;
  final ApiClient apiClient;
  final AppSessionStore sessionStore;
  final AppRefreshStore refreshStore;
  final CurrentTargetStore currentTargetStore;
  final AuthRepository authRepository;
  final SchoolsRepository schoolsRepository;
  final ProgramsRepository programsRepository;
  final PlanningRepository planningRepository;
  final TodoRepository todoRepository;
  final CheckinsRepository checkinsRepository;
  final ProfileRepository profileRepository;
  final FavoritesRepository favoritesRepository;
  final ComparisonRepository comparisonRepository;
  final RemindersRepository remindersRepository;
  final ResourcesRepository resourcesRepository;
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
