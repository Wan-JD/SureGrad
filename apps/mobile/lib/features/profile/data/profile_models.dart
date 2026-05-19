import '../../../core/state/current_target_store.dart';
import '../../planning/data/planning_models.dart';

class UserProfileSnapshot {
  const UserProfileSnapshot({
    required this.userId,
    required this.phoneMasked,
    required this.nickname,
    required this.avatarUrl,
    required this.profileCompleted,
    required this.hasActiveTarget,
    required this.hasActivePlan,
  });

  final String userId;
  final String? phoneMasked;
  final String? nickname;
  final String? avatarUrl;
  final bool profileCompleted;
  final bool hasActiveTarget;
  final bool hasActivePlan;

  factory UserProfileSnapshot.fromJson(Map<String, dynamic> json) {
    return UserProfileSnapshot(
      userId: json['userId'] as String? ?? '',
      phoneMasked: json['phoneMasked'] as String?,
      nickname: json['nickname'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      profileCompleted: json['profileCompleted'] as bool? ?? false,
      hasActiveTarget: json['hasActiveTarget'] as bool? ?? false,
      hasActivePlan: json['hasActivePlan'] as bool? ?? false,
    );
  }
}

class ProfileScreenData {
  const ProfileScreenData({
    required this.me,
    required this.currentTarget,
    required this.targetPreview,
  });

  final UserProfileSnapshot me;
  final CurrentTargetRecord currentTarget;
  final CurrentTargetPreview? targetPreview;

  String get targetHeadline {
    if (targetPreview != null) {
      return targetPreview!.headline;
    }
    if (currentTarget.hasTarget) {
      return '已设置目标专业';
    }
    return '尚未设置目标';
  }
}
