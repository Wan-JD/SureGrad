class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
    required this.isNewUser,
    required this.profileCompleted,
    required this.user,
  });

  final String accessToken;
  final String refreshToken;
  final int expiresIn;
  final bool isNewUser;
  final bool profileCompleted;
  final AuthUserSummary user;

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      accessToken: json['accessToken'] as String? ?? '',
      refreshToken: json['refreshToken'] as String? ?? '',
      expiresIn: (json['expiresIn'] as num?)?.toInt() ?? 0,
      isNewUser: json['isNewUser'] as bool? ?? false,
      profileCompleted: json['profileCompleted'] as bool? ?? false,
      user: AuthUserSummary.fromJson(
        json['user'] is Map<String, dynamic>
            ? json['user'] as Map<String, dynamic>
            : const <String, dynamic>{},
      ),
    );
  }
}

class AuthUserSummary {
  const AuthUserSummary({
    required this.userId,
    required this.phoneMasked,
    required this.nickname,
    required this.avatarUrl,
  });

  final String userId;
  final String? phoneMasked;
  final String? nickname;
  final String? avatarUrl;

  factory AuthUserSummary.fromJson(Map<String, dynamic> json) {
    return AuthUserSummary(
      userId: json['userId'] as String? ?? '',
      phoneMasked: json['phoneMasked'] as String?,
      nickname: json['nickname'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
    );
  }
}

class OtpSendResult {
  const OtpSendResult({
    required this.sent,
    required this.expireSeconds,
    required this.retryAfterSeconds,
  });

  final bool sent;
  final int expireSeconds;
  final int retryAfterSeconds;

  factory OtpSendResult.fromJson(Map<String, dynamic> json) {
    return OtpSendResult(
      sent: json['sent'] as bool? ?? false,
      expireSeconds: (json['expireSeconds'] as num?)?.toInt() ?? 0,
      retryAfterSeconds: (json['retryAfterSeconds'] as num?)?.toInt() ?? 0,
    );
  }
}
