import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';

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
  final _accountController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _nicknameController = TextEditingController();
  final _codeController = TextEditingController();
  LoginController? _controller;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _controller ??= LoginController(
      repository: AppScope.of(context).authRepository,
    );
  }

  @override
  void dispose() {
    _accountController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _nicknameController.dispose();
    _codeController.dispose();
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
            final isRegister = controller.isRegisterMode;
            return ListView(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 32),
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: IconButton.filledTonal(
                    onPressed: () => Navigator.of(context).maybePop(),
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
                    borderRadius: BorderRadius.circular(28),
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
                            'SureGrad',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        const SizedBox(height: 22),
                        Text(
                          isRegister ? '创建账号，保存你的择校进度' : '登录后继续你的择校闭环',
                          style: Theme.of(context).textTheme.headlineMedium
                              ?.copyWith(color: Colors.white, height: 1.1),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          '成功后会回到$routeLabel，继续刚才的动作。',
                          style: Theme.of(context).textTheme.bodyLarge
                              ?.copyWith(color: const Color(0xFFD5EEE8)),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                SectionCard(
                  title: isRegister ? '注册账号' : '账号登录',
                  subtitle: isRegister
                      ? '手机号或邮箱均可注册，密码会加密存储。'
                      : '使用手机号或邮箱加密码登录。',
                  children: [
                    SegmentedButton<AuthMode>(
                      segments: const [
                        ButtonSegment(
                          value: AuthMode.login,
                          icon: Icon(Icons.login_rounded),
                          label: Text('登录'),
                        ),
                        ButtonSegment(
                          value: AuthMode.register,
                          icon: Icon(Icons.person_add_alt_1_rounded),
                          label: Text('注册'),
                        ),
                      ],
                      selected: {controller.mode},
                      onSelectionChanged: controller.isSubmitting
                          ? null
                          : (selection) {
                              final mode = selection.first;
                              controller.setMode(mode);
                              if (mode == AuthMode.register &&
                                  controller.captcha == null) {
                                controller.loadCaptcha();
                              }
                            },
                    ),
                    const SizedBox(height: 16),
                    _AuthTextField(
                      controller: _accountController,
                      labelText: '手机号或邮箱',
                      hintText: '13800138000 / name@example.com',
                      keyboardType: TextInputType.emailAddress,
                      icon: Icons.alternate_email_rounded,
                    ),
                    const SizedBox(height: 14),
                    if (isRegister) ...[
                      _AuthTextField(
                        controller: _nicknameController,
                        labelText: '昵称',
                        hintText: '可选',
                        icon: Icons.badge_outlined,
                      ),
                      const SizedBox(height: 14),
                    ],
                    _AuthTextField(
                      controller: _passwordController,
                      labelText: '密码',
                      hintText: '至少 8 位',
                      icon: Icons.lock_outline_rounded,
                      obscureText: _obscurePassword,
                      suffixIcon: IconButton(
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                        icon: Icon(
                          _obscurePassword
                              ? Icons.visibility_rounded
                              : Icons.visibility_off_rounded,
                        ),
                      ),
                    ),
                    if (isRegister) ...[
                      const SizedBox(height: 14),
                      _AuthTextField(
                        controller: _confirmPasswordController,
                        labelText: '确认密码',
                        hintText: '再次输入密码',
                        icon: Icons.lock_reset_rounded,
                        obscureText: _obscureConfirmPassword,
                        suffixIcon: IconButton(
                          onPressed: () {
                            setState(() {
                              _obscureConfirmPassword =
                                  !_obscureConfirmPassword;
                            });
                          },
                          icon: Icon(
                            _obscureConfirmPassword
                                ? Icons.visibility_rounded
                                : Icons.visibility_off_rounded,
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: _AuthTextField(
                              controller: _codeController,
                              labelText: '图形验证码',
                              hintText: '输入图片字符',
                              icon: Icons.verified_user_outlined,
                              inputFormatters: [
                                FilteringTextInputFormatter.allow(
                                  RegExp(r'[A-Za-z0-9]'),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 10),
                          _CaptchaImage(controller: controller),
                        ],
                      ),
                      if (controller.captchaFeedbackText != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          controller.captchaFeedbackText!,
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(color: const Color(0xFF4A6962)),
                        ),
                      ],
                    ],
                    if (controller.errorText != null) ...[
                      const SizedBox(height: 12),
                      _ErrorBanner(message: controller.errorText!),
                    ],
                    const SizedBox(height: 18),
                    FilledButton.icon(
                      onPressed: controller.isSubmitting
                          ? null
                          : () => _submit(controller),
                      icon: controller.isSubmitting
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : Icon(
                              isRegister
                                  ? Icons.person_add_alt_1_rounded
                                  : Icons.login_rounded,
                            ),
                      label: Text(
                        controller.isSubmitting
                            ? '处理中...'
                            : isRegister
                            ? '注册并继续'
                            : '登录并继续',
                      ),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: () {
                        Navigator.of(context).pushNamedAndRemoveUntil(
                          AppRoutes.schools,
                          (_) => false,
                        );
                      },
                      icon: const Icon(Icons.explore_outlined),
                      label: const Text('先以游客身份浏览'),
                    ),
                  ],
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Future<void> _submit(LoginController controller) async {
    final sessionStore = AppScope.of(context).sessionStore;
    final navigator = Navigator.of(context);
    final AuthSession? session;
    if (controller.isRegisterMode) {
      session = await controller.register(
        account: _accountController.text,
        password: _passwordController.text,
        confirmPassword: _confirmPasswordController.text,
        nickname: _nicknameController.text,
        code: _codeController.text,
      );
    } else {
      session = await controller.login(
        account: _accountController.text,
        password: _passwordController.text,
      );
    }
    if (session == null || !mounted) {
      return;
    }

    _commitSession(
      sessionStore: sessionStore,
      account: _accountController.text.trim(),
      session: session,
    );
    final targetRoute = session.isNewUser || !session.profileCompleted
        ? AppRoutes.firstTimeSetup
        : widget.args.redirectTo;
    navigator.pushNamedAndRemoveUntil(
      targetRoute,
      (_) => false,
      arguments: targetRoute == AppRoutes.firstTimeSetup
          ? null
          : widget.args.redirectArguments,
    );
  }

  void _commitSession({
    required AppSessionStore sessionStore,
    required String account,
    required AuthSession session,
  }) {
    sessionStore.signIn(
      account: account,
      phoneNumber: account,
      userId: session.user.userId,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      profileCompleted: session.profileCompleted,
      nickname: session.user.nickname,
      phoneMasked: session.user.phoneMasked,
      accountLabel: session.user.accountLabel,
      avatarUrl: session.user.avatarUrl,
    );
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
      case AppRoutes.programDetail:
        return '专业详情页';
      default:
        return '目标页面';
    }
  }
}

class _CaptchaImage extends StatelessWidget {
  const _CaptchaImage({required this.controller});

  final LoginController controller;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: controller.isLoadingCaptcha ? null : controller.loadCaptcha,
      child: Container(
        width: 112,
        height: 54,
        decoration: BoxDecoration(
          color: const Color(0xFFF0F0F0),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFD8D3CA)),
        ),
        child: controller.isLoadingCaptcha
            ? const Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              )
            : controller.captcha != null
            ? ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: SvgPicture.string(
                  controller.captcha!.image,
                  fit: BoxFit.cover,
                ),
              )
            : const Center(
                child: Text('点击获取', style: TextStyle(fontSize: 12)),
              ),
      ),
    );
  }
}

class _AuthTextField extends StatelessWidget {
  const _AuthTextField({
    required this.controller,
    required this.labelText,
    required this.hintText,
    required this.icon,
    this.keyboardType,
    this.obscureText = false,
    this.suffixIcon,
    this.inputFormatters,
  });

  final TextEditingController controller;
  final String labelText;
  final String hintText;
  final IconData icon;
  final TextInputType? keyboardType;
  final bool obscureText;
  final Widget? suffixIcon;
  final List<TextInputFormatter>? inputFormatters;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: obscureText,
      inputFormatters: inputFormatters,
      decoration: InputDecoration(
        labelText: labelText,
        hintText: hintText,
        prefixIcon: Icon(icon),
        suffixIcon: suffixIcon,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE4DDD2)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF125B52), width: 2),
        ),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
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
              message,
              style: TextStyle(
                color: Theme.of(context).colorScheme.error,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
