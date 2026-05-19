import 'dart:convert';
import 'dart:io';

import '../state/app_session_store.dart';
import 'api_config.dart';
import 'api_result.dart';

class ApiClient {
  ApiClient({required this.config, required this.sessionStore});

  final ApiConfig config;
  final AppSessionStore sessionStore;

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
    return _send('GET', path, queryParameters: queryParameters);
  }

  Future<ApiResult<Map<String, dynamic>>> post(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    return _send('POST', path, body: body);
  }

  Future<ApiResult<Map<String, dynamic>>> put(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    return _send('PUT', path, body: body);
  }

  Future<ApiResult<Map<String, dynamic>>> patch(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    return _send('PATCH', path, body: body);
  }

  Future<ApiResult<Map<String, dynamic>>> delete(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    return _send('DELETE', path, queryParameters: queryParameters);
  }

  Future<ApiResult<Map<String, dynamic>>> _send(
    String method,
    String path, {
    Map<String, dynamic>? queryParameters,
    Map<String, dynamic>? body,
  }) async {
    final client = HttpClient();

    try {
      final request = await client.openUrl(
        method,
        resolve(path, queryParameters),
      );

      request.headers.set(HttpHeaders.acceptHeader, 'application/json');
      if (body != null) {
        request.headers.set(
          HttpHeaders.contentTypeHeader,
          'application/json; charset=utf-8',
        );
      }

      final accessToken = sessionStore.accessToken;
      if (accessToken != null && accessToken.isNotEmpty) {
        request.headers.set(
          HttpHeaders.authorizationHeader,
          'Bearer $accessToken',
        );
      }

      if (body != null) {
        request.write(jsonEncode(body));
      }

      final response = await request.close();
      final responseBody = await utf8.decodeStream(response);
      final statusCode = response.statusCode;
      final decoded = _decodeJson(responseBody);

      if (statusCode >= 200 && statusCode < 300) {
        return ApiSuccess(decoded);
      }

      return ApiFailure(
        _extractErrorMessage(decoded, responseBody),
        statusCode: statusCode,
      );
    } on SocketException {
      return const ApiFailure('无法连接到 SureGrad API。请确认本地后端已启动。');
    } on HttpException catch (error) {
      return ApiFailure(error.message);
    } on FormatException {
      return const ApiFailure('API 返回了无法解析的响应。');
    } catch (_) {
      return const ApiFailure('请求失败，请稍后重试。');
    } finally {
      client.close(force: true);
    }
  }

  Map<String, dynamic> _decodeJson(String rawBody) {
    if (rawBody.trim().isEmpty) {
      return <String, dynamic>{};
    }

    final decoded = jsonDecode(rawBody);
    if (decoded is Map<String, dynamic>) {
      return decoded;
    }
    if (decoded is Map) {
      return decoded.map((key, value) => MapEntry('$key', value));
    }
    return <String, dynamic>{'data': decoded};
  }

  String _extractErrorMessage(Map<String, dynamic> json, String rawBody) {
    final message = json['message'];
    if (message is List && message.isNotEmpty) {
      return message.join('\n');
    }
    if (message is String && message.isNotEmpty) {
      return message;
    }
    if (rawBody.trim().isNotEmpty) {
      return rawBody;
    }
    return '请求失败，请稍后重试。';
  }
}
