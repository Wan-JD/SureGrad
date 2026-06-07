import 'package:flutter/material.dart';

import '../../../app/bootstrap/app_bootstrap.dart';
import '../../../core/layout/responsive_breakpoints.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';
import '../../checkins/data/checkins_models.dart';

class CheckinPage extends StatefulWidget {
  const CheckinPage({super.key});

  @override
  State<CheckinPage> createState() => _CheckinPageState();
}

class _CheckinPageState extends State<CheckinPage> {
  final TextEditingController _minutesController = TextEditingController();
  final TextEditingController _reflectionController = TextEditingController();
  String _selectedMoodTag = 'focused';
  bool _submitting = false;

  @override
  void dispose() {
    _minutesController.dispose();
    _reflectionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bootstrap = AppScope.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('今日打卡')),
      body: SafeArea(
        child: ResponsivePageBody(
          child: AnimatedBuilder(
            animation: bootstrap.refreshStore,
            builder: (context, _) {
              return FutureBuilder<_CheckinSnapshot>(
                future: _load(bootstrap),
                builder: (context, snapshot) {
                  return ListView(
                    padding: context.contentPadding(),
                    children: [
                      if (snapshot.hasError)
                        EmptyStateCard(
                          title: '打卡数据加载失败',
                          message: _errorMessage(snapshot.error),
                          actionLabel: '重试',
                          onAction: () => setState(() {}),
                        )
                      else if (!snapshot.hasData)
                        Container(
                          height: 200,
                          decoration: BoxDecoration(
                            color: const Color(0xFFEDE7DB),
                            borderRadius: BorderRadius.circular(28),
                          ),
                        )
                      else ...[
                        _CheckinHero(checkin: snapshot.data!.checkin),
                        const SizedBox(height: 16),
                        SectionCard(
                          title: '今日统计',
                          children: [
                            _StatRow(
                              label: '已完成 Todo',
                              value: '${snapshot.data!.checkin.completedTodoCount}',
                            ),
                            _StatRow(
                              label: '学习时长',
                              value: snapshot.data!.checkin.totalStudyMinutes == null
                                  ? '待填写'
                                  : '${snapshot.data!.checkin.totalStudyMinutes} 分钟',
                            ),
                            _StatRow(
                              label: '连续打卡',
                              value: '${snapshot.data!.continuousDays} 天',
                            ),
                            if ((snapshot.data!.checkin.reflection ?? '').trim().isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 8),
                                child: Text('复盘：${snapshot.data!.checkin.reflection}'),
                              ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        if (!snapshot.data!.checkin.isCheckedIn)
                          SectionCard(
                            title: '完成打卡',
                            subtitle: '记录今天的学习时长和状态。',
                            children: [
                              TextField(
                                controller: _minutesController,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(
                                  labelText: '学习时长（分钟）',
                                  hintText: '例如 90',
                                ),
                              ),
                              const SizedBox(height: 12),
                              DropdownButtonFormField<String>(
                                initialValue: _selectedMoodTag,
                                decoration: const InputDecoration(labelText: '今日状态'),
                                items: const [
                                  DropdownMenuItem(value: 'focused', child: Text('专注')),
                                  DropdownMenuItem(value: 'steady', child: Text('稳定')),
                                  DropdownMenuItem(value: 'tired', child: Text('有点累')),
                                ],
                                onChanged: (value) {
                                  if (value != null) {
                                    setState(() => _selectedMoodTag = value);
                                  }
                                },
                              ),
                              const SizedBox(height: 12),
                              TextField(
                                controller: _reflectionController,
                                maxLines: 3,
                                decoration: const InputDecoration(
                                  labelText: '复盘',
                                  hintText: '记录今天做得好的地方，或明天要补的一步。',
                                ),
                              ),
                              const SizedBox(height: 16),
                              SizedBox(
                                width: double.infinity,
                                child: FilledButton(
                                  onPressed: _submitting ? null : _submit,
                                  child: Text(_submitting ? '提交中...' : '提交打卡'),
                                ),
                              ),
                            ],
                          )
                        else
                          SectionCard(
                            title: '今日已打卡',
                            subtitle: '继续保持节奏。',
                            children: [
                              FilledButton(
                                onPressed: () {
                                  Navigator.of(context).pop();
                                },
                                child: const Text('返回'),
                              ),
                            ],
                          ),
                      ],
                    ],
                  );
                },
              );
            },
          ),
        ),
      ),
    );
  }

  Future<_CheckinSnapshot> _load(AppBootstrap bootstrap) async {
    final checkin = await bootstrap.checkinsRepository.fetchTodayCheckin();
    final overview = await bootstrap.checkinsRepository.fetchOverview();
    return _CheckinSnapshot(checkin: checkin, continuousDays: overview.continuousCheckinDays);
  }

  Future<void> _submit() async {
    final minutes = int.tryParse(_minutesController.text.trim());
    if (minutes == null || minutes <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('请输入有效的学习时长。')),
      );
      return;
    }

    setState(() => _submitting = true);

    try {
      final result = await AppScope.of(context).checkinsRepository.createCheckin(
        totalStudyMinutes: minutes,
        reflection: _reflectionController.text,
        moodTag: _selectedMoodTag,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('打卡成功，连续 ${result.continuousDays} 天。')),
      );
      setState(() {});
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage(error))),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  String _errorMessage(Object? error) {
    if (error is FeatureUnavailableException) {
      return '${error.message}\n${error.nextSteps.join('\n')}';
    }
    return '$error';
  }
}

class _CheckinSnapshot {
  const _CheckinSnapshot({required this.checkin, required this.continuousDays});
  final TodayCheckinSnapshot checkin;
  final int continuousDays;
}

class _CheckinHero extends StatelessWidget {
  const _CheckinHero({required this.checkin});
  final TodayCheckinSnapshot checkin;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: checkin.isCheckedIn
              ? [const Color(0xFF1A403A), const Color(0xFF2F6D59)]
              : [const Color(0xFF1A403A), const Color(0xFF7E5A3A)],
        ),
        borderRadius: BorderRadius.circular(32),
      ),
      child: Padding(
        padding: const EdgeInsets.all(22),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                checkin.isCheckedIn ? '已打卡' : '待打卡',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              checkin.isCheckedIn ? '今日打卡已完成' : '还没有打卡',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: Colors.white),
            ),
            const SizedBox(height: 10),
            Text(
              checkin.isCheckedIn
                  ? '继续保持节奏，顺手看一眼今天的复盘和连续天数。'
                  : '完成今日任务后，记录学习时长和简短复盘。',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: const Color(0xFFF3E8DA)),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatRow extends StatelessWidget {
  const _StatRow({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(child: Text(label)),
          Text(value, style: Theme.of(context).textTheme.titleMedium),
        ],
      ),
    );
  }
}
