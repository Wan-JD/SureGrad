import 'dart:async';

import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/login_route_args.dart';
import '../../../core/state/app_session_store.dart';
import '../../../core/widgets/section_card.dart';
import '../data/auth_models.dart';
import 'login_controller.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key, required this.args});

  final LoginRouteArgs args;

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController(text: '123456');
  LoginController? _controller;
  int _countdown = 0;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _controller ??= LoginController(
      repository: AppScope.of(context).authRepository,
    );
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = _controller!;
    final routeLabel = _routeLabel(widget.args.redirectTo);

    return Scaffold(
      body: SafeArea(
        child: AnimatedBuilder(
          animation: controller,
          builder: (context, _) {
            return ListView(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 32),
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: IconButton.filledTonal(
                    onPressed: () {
                      Navigator.of(context).maybePop();
                    },
                    icon: const Icon(Icons.arrow_back_rounded),
                  ),
                ),
                const SizedBox(height: 12),
                DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF104A44), Color(0xFF1E7A67)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(32),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: const Text(
                            'SureGrad Android MVP',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        const SizedBox(height: 22),
                        Text(
                          '登录后继续你的择校闭环',
                          style: Theme.of(context).textTheme.headlineMedium
                              ?.copyWith(color: Colors.white, height: 1.1),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          '当前拦截点会在登录成功后回到$routeLabel，继续刚才的动作，不会把你扔回首页。',
                          style: Theme.of(context).textTheme.bodyLarge
                              ?.copyWith(color: const Color(0xFFD5EEE8)),
                        ),
                        const SizedBox(height: 18),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: const [
                            _HeroChip(label: '手机号验证码'),
                            _HeroChip(label: '返回原触发页'),
                            _HeroChip(label: '游客先浏览也可以'),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                SectionCard(
                  title: '验证码登录',
                  subtitle:
                      '这里已经改成真实调用 /auth/otp/send 和 /auth/login/otp。当前后端演示验证码仍为 123456。',
                  children: [
                    TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        labelText: '手机号',
                        hintText: '输入 13800138000',
                        prefixIcon: Icon(Icons.phone_android_rounded),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _otpController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(
                              labelText: '验证码',
                              hintText: '输入 123456',
                              prefixIcon: Icon(Icons.password_rounded),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        SizedBox(
                          width: 128,
                          child: OutlinedButton(
                            onPressed: _countdown > 0 || controller.isSendingOtp
                                ? null
                                : () async {
                                    final messenger = ScaffoldMessenger.of(
                                      context,
                                    );
                                    final sent = await controller.sendOtp(
                                      _phoneController.text,
                                    );
                                    if (!sent || !mounted) {
                                      return;
                                    }
                                    setState(() => _countdown = 59);
                                    final message = controller.otpFeedbackText;
                                    if (message != null) {
                                      messenger.showSnackBar(
                                        SnackBar(content: Text(message)),
                                      );
                                    }
                                    unawaited(_tickCountdown());
                                  },
                            child: Text(
                              controller.isSendingOtp
                                  ? '发送中...'
                                  : _countdown > 0
                                  ? '$_countdown s'
                                  : '获取验证码',
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (controller.errorText != null) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFEFEA),
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.error_outline_rounded,
                              color: Theme.of(context).colorScheme.error,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                controller.errorText!,
                                style: TextStyle(
                                  color: Theme.of(context).colorScheme.error,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 18),
                    FilledButton(
                      onPressed: controller.isSubmitting
                          ? null
                          : () async {
                              final sessionStore = AppScope.of(
                                context,
                              ).sessionStore;
                              final navigator = Navigator.of(context);
                              final session = await controller.submit(
                                phone: _phoneController.text,
                                otpCode: _otpController.text,
                              );
                              if (session == null || !mounted) {
                                return;
                              }

                              _commitSession(
                                sessionStore: sessionStore,
                                phoneNumber: _phoneController.text.trim(),
                                session: session,
                              );
                              navigator.pushNamedAndRemoveUntil(
                                widget.args.redirectTo,
                                (_) => false,
                                arguments: widget.args.redirectArguments,
                              );
                            },
                      child: Text(controller.isSubmitting ? '登录中...' : '登录并继续'),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton(
                      onPressed: () {
                        Navigator.of(context).pushNamedAndRemoveUntil(
                          AppRoutes.schools,
                          (_) => false,
                        );
                      },
                      child: const Text('先以游客身份浏览'),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                const SectionCard(
                  title: '这页现在解决什么',
                  children: [
                    _SmallPoint('拦截收藏、对比、规划、Todo 等受限动作'),
                    SizedBox(height: 8),
                    _SmallPoint('网络失败时保留已填手机号和验证码'),
                    SizedBox(height: 8),
                    _SmallPoint('登录成功后跳回原触发页继续，而不是强制回首页'),
                  ],
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  void _commitSession({
    required AppSessionStore sessionStore,
    required String phoneNumber,
    required AuthSession session,
  }) {
    sessionStore.signIn(
      phoneNumber: phoneNumber,
      userId: session.user.userId,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      profileCompleted: session.profileCompleted,
      nickname: session.user.nickname,
      phoneMasked: session.user.phoneMasked,
      avatarUrl: session.user.avatarUrl,
    );
  }

  Future<void> _tickCountdown() async {
    while (mounted && _countdown > 0) {
      await Future<void>.delayed(const Duration(seconds: 1));
      if (!mounted) {
        return;
      }
      setState(() {
        _countdown -= 1;
      });
    }
  }

  String _routeLabel(String routeName) {
    switch (routeName) {
      case AppRoutes.planning:
        return '规划页';
      case AppRoutes.todo:
        return 'Todo 页';
      case AppRoutes.favorites:
        return '收藏页';
      case AppRoutes.comparison:
        return '对比页';
      case AppRoutes.reminders:
        return '提醒中心';
      case AppRoutes.schoolDetail:
        return '院校详情页';
      default:
        return '目标页面';
    }
  }
}

class _HeroChip extends StatelessWidget {
  const _HeroChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w700,
          fontSize: 12,
        ),
      ),
    );
  }
}

class _SmallPoint extends StatelessWidget {
  const _SmallPoint(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(top: 4),
          child: Icon(
            Icons.check_circle_rounded,
            size: 16,
            color: Color(0xFF125B52),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(child: Text(text)),
      ],
    );
  }
}
