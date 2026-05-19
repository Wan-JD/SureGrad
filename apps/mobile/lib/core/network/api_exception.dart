class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class FeatureUnavailableException extends ApiException {
  const FeatureUnavailableException({
    required this.domain,
    required this.action,
    required this.nextSteps,
    required String message,
  }) : super(message);

  final String domain;
  final String action;
  final List<String> nextSteps;

  factory FeatureUnavailableException.fromJson(Map<String, dynamic> json) {
    final rawNextSteps = json['nextSteps'];
    return FeatureUnavailableException(
      domain: json['domain'] as String? ?? 'unknown',
      action: json['action'] as String? ?? 'unknown',
      message: json['message'] as String? ?? 'This endpoint is not ready yet.',
      nextSteps: rawNextSteps is List
          ? rawNextSteps.map((item) => '$item').toList(growable: false)
          : const <String>[],
    );
  }
}
