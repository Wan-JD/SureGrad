import 'package:suregrad_mobile/core/network/api_client.dart';
import 'package:suregrad_mobile/core/network/api_config.dart';
import 'package:suregrad_mobile/core/network/api_result.dart';
import 'package:suregrad_mobile/core/state/app_session_store.dart';

typedef GetHandler =
    Future<ApiResult<Map<String, dynamic>>> Function(
      String path, {
      Map<String, dynamic>? queryParameters,
    });
typedef WriteHandler =
    Future<ApiResult<Map<String, dynamic>>> Function(
      String path, {
      Map<String, dynamic>? body,
      Map<String, dynamic>? queryParameters,
    });

class FakeApiClient extends ApiClient {
  FakeApiClient({
    this.onGet,
    this.onPost,
    this.onPut,
    this.onPatch,
    this.onDelete,
  }) : super(
         config: const ApiConfig(baseUrl: 'http://example.test'),
         sessionStore: AppSessionStore(),
       );

  final GetHandler? onGet;
  final WriteHandler? onPost;
  final WriteHandler? onPut;
  final WriteHandler? onPatch;
  final GetHandler? onDelete;

  @override
  Future<ApiResult<Map<String, dynamic>>> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) {
    return onGet!.call(path, queryParameters: queryParameters);
  }

  @override
  Future<ApiResult<Map<String, dynamic>>> post(
    String path, {
    Map<String, dynamic>? body,
  }) {
    return onPost!.call(path, body: body);
  }

  @override
  Future<ApiResult<Map<String, dynamic>>> put(
    String path, {
    Map<String, dynamic>? body,
  }) {
    return onPut!.call(path, body: body);
  }

  @override
  Future<ApiResult<Map<String, dynamic>>> patch(
    String path, {
    Map<String, dynamic>? body,
  }) {
    return onPatch!.call(path, body: body);
  }

  @override
  Future<ApiResult<Map<String, dynamic>>> delete(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) {
    return onDelete!.call(path, queryParameters: queryParameters);
  }
}
