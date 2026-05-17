import 'api_config.dart';
import 'api_result.dart';

class ApiClient {
  const ApiClient({required this.config});

  final ApiConfig config;

  Uri resolve(String path, [Map<String, dynamic>? queryParameters]) {
    final uri = Uri.parse('${config.baseUrl}$path');
    if (queryParameters == null || queryParameters.isEmpty) {
      return uri;
    }

    return uri.replace(
      queryParameters: queryParameters.map(
        (key, value) => MapEntry(key, value.toString()),
      ),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    resolve(path, queryParameters);
    return const ApiFailure('API client is reserved and not wired yet.');
  }

  Future<ApiResult<Map<String, dynamic>>> post(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    resolve(path);
    return const ApiFailure('API client is reserved and not wired yet.');
  }
}
