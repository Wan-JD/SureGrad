import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../app/navigation/login_route_args.dart';
import '../../../core/widgets/section_card.dart';
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

    return Scaffold(
      appBar: AppBar(title: const Text('登录')),
      body: SafeArea(
        child: AnimatedBuilder(
          animation: controller,
          builder: (context, _) {
            return ListView(
              padding: const EdgeInsets.all(24),
              children: [
                Text(
                  '手机号验证码登录',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 12),
                Text(
                  '当前仅接入演示登录流，用于验证“登录后返回原触发页面”的路由骨架。',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: '手机号',
                    hintText: '例如 13800138000',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: '验证码',
                    hintText: '输入 123456 进入演示态',
                  ),
                ),
                if (controller.errorText != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    controller.errorText!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
                ],
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: controller.isSubmitting
                      ? null
                      : () async {
                          final sessionStore = AppScope.of(
                            context,
                          ).sessionStore;
                          final navigator = Navigator.of(context);
                          final success = await controller.submit(
                            phone: _phoneController.text,
                            otpCode: _otpController.text,
                          );
                          if (!success || !mounted) {
                            return;
                          }

                          sessionStore.signIn(_phoneController.text.trim());
                          navigator.pushNamedAndRemoveUntil(
                            widget.args.redirectTo,
                            (_) => false,
                          );
                        },
                  child: Text(controller.isSubmitting ? '登录中...' : '登录并继续'),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () {
                    Navigator.of(
                      context,
                    ).pushNamedAndRemoveUntil(AppRoutes.schools, (_) => false);
                  },
                  child: const Text('先以游客身份浏览'),
                ),
                const SizedBox(height: 24),
                const SectionCard(
                  title: '后续联调预留',
                  subtitle: '接口与产品文档已经一一对齐。',
                  children: [
                    Text('• POST /auth/otp/send'),
                    SizedBox(height: 6),
                    Text('• POST /auth/login/otp'),
                    SizedBox(height: 6),
                    Text('• GET /users/me'),
                    SizedBox(height: 6),
                    Text('• PUT /user-profiles/me'),
                  ],
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
