import 'dart:convert';

import 'package:http/http.dart' as http;

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
    try {
      final uri = resolve(path, queryParameters);
      final headers = <String, String>{'Accept': 'application/json'};
      if (body != null) {
        headers['Content-Type'] = 'application/json; charset=utf-8';
      }

      final accessToken = sessionStore.accessToken;
      if (accessToken != null && accessToken.isNotEmpty) {
        headers['Authorization'] = 'Bearer $accessToken';
      }

      final encodedBody = body == null ? null : jsonEncode(body);
      final response = await _dispatch(method, uri, headers, encodedBody);
      final responseBody = utf8.decode(response.bodyBytes);
      final statusCode = response.statusCode;
      final decoded = _decodeJson(responseBody);

      if (statusCode >= 200 && statusCode < 300) {
        return ApiSuccess(decoded);
      }

      return ApiFailure(
        _extractErrorMessage(decoded, responseBody),
        statusCode: statusCode,
      );
    } on http.ClientException {
      return const ApiFailure('无法连接到 SureGrad API。请确认本地后端已启动。');
    } on FormatException {
      return const ApiFailure('API 返回了无法解析的响应。');
    } catch (_) {
      return const ApiFailure('请求失败，请稍后重试。');
    }
  }

  Future<http.Response> _dispatch(
    String method,
    Uri uri,
    Map<String, String> headers,
    String? body,
  ) {
    switch (method) {
      case 'GET':
        return http.get(uri, headers: headers);
      case 'POST':
        return http.post(uri, headers: headers, body: body);
      case 'PUT':
        return http.put(uri, headers: headers, body: body);
      case 'PATCH':
        return http.patch(uri, headers: headers, body: body);
      case 'DELETE':
        return http.delete(uri, headers: headers);
      default:
        throw UnsupportedError('Unsupported HTTP method: $method');
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
