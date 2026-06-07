import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../app/navigation/app_routes.dart';
import '../../../core/widgets/section_card.dart';

class FirstTimeSetupPage extends StatefulWidget {
  const FirstTimeSetupPage({super.key});

  @override
  State<FirstTimeSetupPage> createState() => _FirstTimeSetupPageState();
}

class _FirstTimeSetupPageState extends State<FirstTimeSetupPage> {
  int _examYear = 2026;
  String _identityType = 'undergraduate';
  String _intendedDiscipline = '';
  double _dailyStudyHours = 6;
  bool _submitting = false;
  String? _errorText;

  static const _identityOptions = [
    {'value': 'undergraduate', 'label': '应届本科生', 'icon': Icons.school_rounded},
    {'value': 'graduate', 'label': '往届生/二战', 'icon': Icons.history_edu_rounded},
    {'value': 'working', 'label': '在职备考', 'icon': Icons.work_outline_rounded},
  ];

  static const _yearOptions = [2025, 2026, 2027, 2028];

  static const _disciplineOptions = [
    '计算机科学与技术',
    '软件工程',
    '金融学',
    '经济学',
    '法学',
    '教育学',
    '文学',
    '管理学',
    '理学',
    '工学其他',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 32),
          children: [
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
                        '首次设置',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(height: 22),
                    Text(
                      '完善你的备考档案',
                      style: Theme.of(context).textTheme.headlineMedium
                          ?.copyWith(color: Colors.white, height: 1.1),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      '这些信息会帮助我们为你推荐更合适的院校和学习计划。设置后可以在"我的"页面随时修改。',
                      style: Theme.of(context).textTheme.bodyLarge
                          ?.copyWith(color: const Color(0xFFD5EEE8)),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 18),
            SectionCard(
              title: '备考年份',
              subtitle: '你计划在哪一年参加研究生入学考试？',
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _yearOptions.map((year) {
                    final selected = _examYear == year;
                    return ChoiceChip(
                      label: Text('$year'),
                      selected: selected,
                      onSelected: (_) => setState(() => _examYear = year),
                    );
                  }).toList(),
                ),
              ],
            ),
            const SizedBox(height: 14),
            SectionCard(
              title: '身份类型',
              subtitle: '你目前的身份是？',
              children: [
                ..._identityOptions.map((option) {
                  final selected = _identityType == option['value'];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      onTap: () => setState(() {
                        _identityType = option['value'] as String;
                      }),
                      leading: Icon(
                        option['icon'] as IconData,
                        color: selected
                            ? const Color(0xFF125B52)
                            : const Color(0xFF788881),
                      ),
                      title: Text(option['label'] as String),
                      trailing: Icon(
                        selected
                            ? Icons.radio_button_checked
                            : Icons.radio_button_unchecked,
                        color: selected
                            ? const Color(0xFF125B52)
                            : const Color(0xFFB6C4BF),
                      ),
                    ),
                  );
                }),
              ],
            ),
            const SizedBox(height: 14),
            SectionCard(
              title: '目标专业方向',
              subtitle: '你计划报考哪个专业方向？',
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _disciplineOptions.map((discipline) {
                    final selected = _intendedDiscipline == discipline;
                    return ChoiceChip(
                      label: Text(discipline),
                      selected: selected,
                      onSelected: (_) => setState(() {
                        _intendedDiscipline = discipline;
                      }),
                    );
                  }).toList(),
                ),
              ],
            ),
            const SizedBox(height: 14),
            SectionCard(
              title: '每日学习时长',
              subtitle: '你计划每天投入多少小时？（当前 ${_dailyStudyHours.toInt()} 小时）',
              children: [
                Slider(
                  value: _dailyStudyHours,
                  min: 2,
                  max: 14,
                  divisions: 12,
                  label: '${_dailyStudyHours.toInt()} 小时',
                  onChanged: (value) {
                    setState(() => _dailyStudyHours = value);
                  },
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('2 小时', style: Theme.of(context).textTheme.bodySmall),
                    Text('14 小时', style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ],
            ),
            if (_errorText != null) ...[
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
                        _errorText!,
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
              onPressed: _submitting ? null : _submit,
              child: Text(_submitting ? '保存中...' : '保存并开始择校'),
            ),
            const SizedBox(height: 10),
            OutlinedButton(
              onPressed: _skip,
              child: const Text('跳过，稍后设置'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (_intendedDiscipline.isEmpty) {
      setState(() => _errorText = '请选择目标专业方向。');
      return;
    }

    setState(() {
      _submitting = true;
      _errorText = null;
    });

    try {
      await AppScope.of(context).profileRepository.updateProfile(
        examYear: _examYear,
        identityType: _identityType,
        intendedDiscipline: _intendedDiscipline,
        dailyStudyHours: _dailyStudyHours,
      );
      if (!mounted) {
        return;
      }
      AppScope.of(context).sessionStore.updateProfileCompletion(true);
      Navigator.of(context).pushReplacementNamed(AppRoutes.schools);
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _errorText = '保存失败：$error';
        _submitting = false;
      });
    }
  }

  void _skip() {
    Navigator.of(context).pushReplacementNamed(AppRoutes.schools);
  }
}
