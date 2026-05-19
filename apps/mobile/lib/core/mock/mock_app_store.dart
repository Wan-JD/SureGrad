import 'package:flutter/foundation.dart';

enum ComparisonMutationResult { added, removed, limitReached }

class MockSchool {
  const MockSchool({
    required this.id,
    required this.name,
    required this.heroLabel,
    required this.province,
    required this.city,
    required this.strengthSummary,
    required this.overview,
    required this.tags,
    required this.hotPrograms,
    required this.lastUpdated,
    required this.featuredProgramId,
    required this.disclaimer,
    required this.links,
    required this.missingFields,
  });

  final String id;
  final String name;
  final String heroLabel;
  final String province;
  final String city;
  final String strengthSummary;
  final String overview;
  final List<String> tags;
  final List<String> hotPrograms;
  final String lastUpdated;
  final String featuredProgramId;
  final String disclaimer;
  final List<MockLink> links;
  final List<String> missingFields;
}

class MockProgramMetric {
  const MockProgramMetric({
    required this.year,
    required this.scoreLine,
    required this.applicationRatio,
    required this.interviewRatio,
    required this.intake,
    required this.tuition,
  });

  final int year;
  final int scoreLine;
  final String applicationRatio;
  final String interviewRatio;
  final int intake;
  final String tuition;
}

class MockProgram {
  const MockProgram({
    required this.id,
    required this.schoolId,
    required this.schoolName,
    required this.departmentName,
    required this.name,
    required this.code,
    required this.degreeTypeLabel,
    required this.researchDirection,
    required this.city,
    required this.recommendation,
    required this.suitability,
    required this.examMathRequired,
    required this.examSubjects,
    required this.referenceBooks,
    required this.metrics,
  });

  final String id;
  final String schoolId;
  final String schoolName;
  final String departmentName;
  final String name;
  final String code;
  final String degreeTypeLabel;
  final String researchDirection;
  final String city;
  final String recommendation;
  final String suitability;
  final bool examMathRequired;
  final List<String> examSubjects;
  final List<String> referenceBooks;
  final List<MockProgramMetric> metrics;

  MockProgramMetric get latestMetric => metrics.first;
}

class MockLink {
  const MockLink({
    required this.label,
    required this.url,
    this.isAvailable = true,
  });

  final String label;
  final String url;
  final bool isAvailable;
}

class MockResourceFavorite {
  const MockResourceFavorite({
    required this.id,
    required this.title,
    required this.typeLabel,
    required this.stageLabel,
    required this.provider,
  });

  final String id;
  final String title;
  final String typeLabel;
  final String stageLabel;
  final String provider;
}

class MockReminder {
  const MockReminder({
    required this.id,
    required this.title,
    required this.content,
    required this.timeLabel,
    required this.typeLabel,
    required this.isSystemDefault,
    required this.isEnabled,
  });

  final String id;
  final String title;
  final String content;
  final String timeLabel;
  final String typeLabel;
  final bool isSystemDefault;
  final bool isEnabled;

  MockReminder copyWith({bool? isEnabled}) {
    return MockReminder(
      id: id,
      title: title,
      content: content,
      timeLabel: timeLabel,
      typeLabel: typeLabel,
      isSystemDefault: isSystemDefault,
      isEnabled: isEnabled ?? this.isEnabled,
    );
  }
}

class MockPlanStage {
  const MockPlanStage({
    required this.title,
    required this.period,
    required this.focus,
    required this.goal,
  });

  final String title;
  final String period;
  final String focus;
  final String goal;
}

class MockWeekTask {
  const MockWeekTask({
    required this.subject,
    required this.hours,
    required this.priorityLabel,
    required this.statusLabel,
  });

  final String subject;
  final int hours;
  final String priorityLabel;
  final String statusLabel;
}

class MockPlanningSnapshot {
  const MockPlanningSnapshot({
    required this.examYear,
    required this.identityLabel,
    required this.dailyStudyHours,
    required this.hasTarget,
    required this.hasPlan,
    required this.usingGenericTemplate,
    required this.planLabel,
    required this.headline,
    required this.subheadline,
    required this.warnings,
    required this.stages,
    required this.weekTasks,
    required this.todayTodos,
    this.school,
    this.program,
  });

  final int examYear;
  final String identityLabel;
  final int dailyStudyHours;
  final bool hasTarget;
  final bool hasPlan;
  final bool usingGenericTemplate;
  final String planLabel;
  final String headline;
  final String subheadline;
  final List<String> warnings;
  final List<MockPlanStage> stages;
  final List<MockWeekTask> weekTasks;
  final List<String> todayTodos;
  final MockSchool? school;
  final MockProgram? program;
}

class MockAppStore extends ChangeNotifier {
  MockAppStore();

  final List<MockSchool> _schools = const [
    MockSchool(
      id: 'swu',
      name: '西南大学',
      heroLabel: '211 · 师范强校 · 信息学科稳健',
      province: '重庆',
      city: '重庆',
      strengthSummary: '适合希望在师范强校里冲刺计算机方向、同时看重稳健报考窗口的用户。',
      overview: '近三年招生节奏相对稳定，分数线波动可控，适合作为主冲与稳妥对比项。',
      tags: ['综合类', '211', '有研究生院'],
      hotPrograms: ['计算机科学与技术', '人工智能', '软件工程'],
      lastUpdated: '2026-05-10',
      featuredProgramId: 'swu-cs-academic',
      disclaimer: '页面数据仅作择校参考，以院校官方最新公告为准。',
      links: [
        MockLink(label: '研究生院官网', url: 'https://yz.swu.edu.cn'),
        MockLink(label: '招生简章', url: 'https://yz.swu.edu.cn/zsjz'),
        MockLink(
          label: '考试大纲',
          url: 'https://yz.swu.edu.cn/outline',
          isAvailable: false,
        ),
      ],
      missingFields: ['2023 年复录比'],
    ),
    MockSchool(
      id: 'scnu',
      name: '华南师范大学',
      heroLabel: '双一流 · 广州区位 · AI 热门赛道',
      province: '广东',
      city: '广州',
      strengthSummary: '更适合看重城市资源、就业连接和人工智能赛道热度的用户。',
      overview: '热门方向竞争更强，但城市与平台吸引力明显，适合放在重点冲刺位。',
      tags: ['师范类', '双一流', '珠三角'],
      hotPrograms: ['人工智能', '教育技术学', '现代教育技术'],
      lastUpdated: '2026-05-12',
      featuredProgramId: 'scnu-ai-professional',
      disclaimer: '页面数据仅作择校参考，以院校官方最新公告为准。',
      links: [
        MockLink(label: '研究生招生网', url: 'https://yz.scnu.edu.cn'),
        MockLink(label: '专业目录', url: 'https://yz.scnu.edu.cn/catalog'),
      ],
      missingFields: ['2024 年推免人数说明'],
    ),
    MockSchool(
      id: 'nenu',
      name: '东北师范大学',
      heroLabel: '双一流 · 教育科技优势 · 性价比高',
      province: '吉林',
      city: '长春',
      strengthSummary: '适合目标偏教育技术或跨考，希望兼顾平台和竞争压力的用户。',
      overview: '教育与技术结合方向成熟，学费与生活成本友好，常作为稳妥对比项。',
      tags: ['师范类', '双一流', '教育技术'],
      hotPrograms: ['教育技术学', '现代教育技术'],
      lastUpdated: '2026-05-08',
      featuredProgramId: 'nenu-edtech-academic',
      disclaimer: '页面数据仅作择校参考，以院校官方最新公告为准。',
      links: [
        MockLink(label: '研究生招生信息网', url: 'https://yz.nenu.edu.cn'),
        MockLink(label: '复试通知', url: 'https://yz.nenu.edu.cn/review'),
      ],
      missingFields: ['2025 年复录比'],
    ),
  ];

  final List<MockProgram> _programs = const [
    MockProgram(
      id: 'swu-cs-academic',
      schoolId: 'swu',
      schoolName: '西南大学',
      departmentName: '计算机与信息科学学院',
      name: '计算机科学与技术',
      code: '081200',
      degreeTypeLabel: '学硕',
      researchDirection: '智能系统与数据工程',
      city: '重庆',
      recommendation: '主冲稳妥兼顾，适合重视基础课体系和报考稳定性的用户。',
      suitability: '适合本专业或数一/408 基础较扎实的用户。',
      examMathRequired: true,
      examSubjects: ['101 思想政治理论', '201 英语一', '301 数学一', '408 计算机学科专业基础'],
      referenceBooks: ['《数据结构》', '《计算机组成原理》', '《计算机网络》'],
      metrics: [
        MockProgramMetric(
          year: 2025,
          scoreLine: 328,
          applicationRatio: '7.8:1',
          interviewRatio: '1.26:1',
          intake: 26,
          tuition: '8000/年',
        ),
        MockProgramMetric(
          year: 2024,
          scoreLine: 322,
          applicationRatio: '7.1:1',
          interviewRatio: '1.22:1',
          intake: 24,
          tuition: '8000/年',
        ),
        MockProgramMetric(
          year: 2023,
          scoreLine: 319,
          applicationRatio: '6.9:1',
          interviewRatio: '待补充',
          intake: 23,
          tuition: '8000/年',
        ),
      ],
    ),
    MockProgram(
      id: 'swu-ai-professional',
      schoolId: 'swu',
      schoolName: '西南大学',
      departmentName: '人工智能学院',
      name: '人工智能',
      code: '085410',
      degreeTypeLabel: '专硕',
      researchDirection: '行业智能应用',
      city: '重庆',
      recommendation: '如果你更关注应用导向与就业转化，这一项更灵活。',
      suitability: '适合希望以项目实践为主、接受竞争上升的用户。',
      examMathRequired: true,
      examSubjects: ['101 思想政治理论', '204 英语二', '302 数学二', '自命题专业基础'],
      referenceBooks: ['《模式识别》', '《机器学习》'],
      metrics: [
        MockProgramMetric(
          year: 2025,
          scoreLine: 335,
          applicationRatio: '8.9:1',
          interviewRatio: '1.31:1',
          intake: 32,
          tuition: '12000/年',
        ),
        MockProgramMetric(
          year: 2024,
          scoreLine: 331,
          applicationRatio: '8.4:1',
          interviewRatio: '1.28:1',
          intake: 30,
          tuition: '12000/年',
        ),
      ],
    ),
    MockProgram(
      id: 'scnu-ai-professional',
      schoolId: 'scnu',
      schoolName: '华南师范大学',
      departmentName: '人工智能学院',
      name: '人工智能',
      code: '085410',
      degreeTypeLabel: '专硕',
      researchDirection: '教育智能与多模态',
      city: '广州',
      recommendation: '城市资源和赛道热度都更强，适合愿意冲高位的用户。',
      suitability: '适合能接受更高竞争、但希望在珠三角实习就业的人群。',
      examMathRequired: true,
      examSubjects: ['101 思想政治理论', '204 英语二', '302 数学二', '自命题人工智能综合'],
      referenceBooks: ['《深度学习》', '《数字图像处理》'],
      metrics: [
        MockProgramMetric(
          year: 2025,
          scoreLine: 342,
          applicationRatio: '10.6:1',
          interviewRatio: '1.38:1',
          intake: 28,
          tuition: '16000/年',
        ),
        MockProgramMetric(
          year: 2024,
          scoreLine: 338,
          applicationRatio: '9.8:1',
          interviewRatio: '1.35:1',
          intake: 26,
          tuition: '16000/年',
        ),
      ],
    ),
    MockProgram(
      id: 'nenu-edtech-academic',
      schoolId: 'nenu',
      schoolName: '东北师范大学',
      departmentName: '信息科学与技术学院',
      name: '教育技术学',
      code: '078401',
      degreeTypeLabel: '学硕',
      researchDirection: '学习分析与教育数据',
      city: '长春',
      recommendation: '作为稳妥位很有价值，特别适合教育技术相关背景或跨考转向者。',
      suitability: '适合希望兼顾竞争压力、成本和学科匹配度的用户。',
      examMathRequired: false,
      examSubjects: ['101 思想政治理论', '201 英语一', '311 教育学专业基础'],
      referenceBooks: ['《教育传播学》', '《教育技术学导论》'],
      metrics: [
        MockProgramMetric(
          year: 2025,
          scoreLine: 352,
          applicationRatio: '5.6:1',
          interviewRatio: '1.18:1',
          intake: 18,
          tuition: '8000/年',
        ),
        MockProgramMetric(
          year: 2024,
          scoreLine: 348,
          applicationRatio: '5.1:1',
          interviewRatio: '1.16:1',
          intake: 17,
          tuition: '8000/年',
        ),
      ],
    ),
  ];

  final List<MockResourceFavorite> _resources = const [
    MockResourceFavorite(
      id: 'resource-01',
      title: '408 高频错题复盘模板',
      typeLabel: '公开资料',
      stageLabel: '强化期',
      provider: 'SureGrad 编辑部',
    ),
    MockResourceFavorite(
      id: 'resource-02',
      title: '教育技术学复试资料整理清单',
      typeLabel: '清单模板',
      stageLabel: '复试期',
      provider: '站内合集',
    ),
  ];

  List<MockReminder> _reminders = const [
    MockReminder(
      id: 'reminder-1',
      title: '晚间复盘',
      content: '21:30 回看今日 Todo，补上学习记录。',
      timeLabel: '每天 21:30',
      typeLabel: '日常学习提醒',
      isSystemDefault: false,
      isEnabled: true,
    ),
    MockReminder(
      id: 'reminder-2',
      title: '报名节点提醒',
      content: '预计 9 月下旬开始网报，提前检查报考信息。',
      timeLabel: '2026-09-20',
      typeLabel: '关键节点提醒',
      isSystemDefault: true,
      isEnabled: true,
    ),
    MockReminder(
      id: 'reminder-3',
      title: '准考证下载',
      content: '考前一周核对准考证打印与考试地点。',
      timeLabel: '2026-12-12',
      typeLabel: '关键节点提醒',
      isSystemDefault: true,
      isEnabled: false,
    ),
  ];

  final Set<String> _favoriteSchoolIds = <String>{'scnu', 'nenu'};
  final Set<String> _favoriteProgramIds = <String>{'scnu-ai-professional'};
  final Set<String> _favoriteResourceIds = <String>{'resource-01'};
  final List<String> _recentSchoolIds = <String>['scnu', 'swu'];
  final List<String> _comparisonProgramIds = <String>[
    'scnu-ai-professional',
    'nenu-edtech-academic',
  ];

  String? _selectedTargetProgramId;
  bool _usingGenericTemplate = false;
  bool _hasGeneratedPlan = false;
  bool _notificationsAuthorized = false;

  List<MockSchool> searchSchools({
    String query = '',
    String cityFilter = '全部',
    String degreeFilter = '全部',
    bool? mathRequired,
  }) {
    final normalizedQuery = query.trim().toLowerCase();

    return _schools.where((school) {
      final programs = programsForSchool(school.id);
      final queryMatched =
          normalizedQuery.isEmpty ||
          school.name.toLowerCase().contains(normalizedQuery) ||
          school.heroLabel.toLowerCase().contains(normalizedQuery) ||
          programs.any(
            (program) =>
                program.name.toLowerCase().contains(normalizedQuery) ||
                program.departmentName.toLowerCase().contains(normalizedQuery),
          );

      final cityMatched = cityFilter == '全部' || school.city == cityFilter;

      final degreeMatched =
          degreeFilter == '全部' ||
          programs.any((program) => program.degreeTypeLabel == degreeFilter);

      final mathMatched =
          mathRequired == null ||
          programs.any((program) => program.examMathRequired == mathRequired);

      return queryMatched && cityMatched && degreeMatched && mathMatched;
    }).toList();
  }

  MockSchool? schoolById(String schoolId) {
    for (final school in _schools) {
      if (school.id == schoolId) {
        return school;
      }
    }
    return null;
  }

  List<MockSchool> get recentSchools {
    return _recentSchoolIds
        .map(schoolById)
        .whereType<MockSchool>()
        .toList(growable: false);
  }

  List<MockProgram> programsForSchool(String schoolId) {
    return _programs
        .where((program) => program.schoolId == schoolId)
        .toList(growable: false);
  }

  MockProgram? programById(String programId) {
    for (final program in _programs) {
      if (program.id == programId) {
        return program;
      }
    }
    return null;
  }

  void markRecentSchool(String schoolId) {
    if (_recentSchoolIds.isNotEmpty && _recentSchoolIds.first == schoolId) {
      return;
    }
    _recentSchoolIds.remove(schoolId);
    _recentSchoolIds.insert(0, schoolId);
    if (_recentSchoolIds.length > 3) {
      _recentSchoolIds.removeLast();
    }
    notifyListeners();
  }

  bool isSchoolFavorited(String schoolId) =>
      _favoriteSchoolIds.contains(schoolId);

  bool isProgramFavorited(String programId) =>
      _favoriteProgramIds.contains(programId);

  bool isProgramInComparison(String programId) =>
      _comparisonProgramIds.contains(programId);

  bool isResourceFavorited(String resourceId) =>
      _favoriteResourceIds.contains(resourceId);

  void toggleSchoolFavorite(String schoolId) {
    if (_favoriteSchoolIds.contains(schoolId)) {
      _favoriteSchoolIds.remove(schoolId);
    } else {
      _favoriteSchoolIds.add(schoolId);
    }
    notifyListeners();
  }

  void toggleProgramFavorite(String programId) {
    if (_favoriteProgramIds.contains(programId)) {
      _favoriteProgramIds.remove(programId);
    } else {
      _favoriteProgramIds.add(programId);
    }
    notifyListeners();
  }

  void toggleResourceFavorite(String resourceId) {
    if (_favoriteResourceIds.contains(resourceId)) {
      _favoriteResourceIds.remove(resourceId);
    } else {
      _favoriteResourceIds.add(resourceId);
    }
    notifyListeners();
  }

  ComparisonMutationResult toggleComparisonProgram(String programId) {
    if (_comparisonProgramIds.contains(programId)) {
      _comparisonProgramIds.remove(programId);
      notifyListeners();
      return ComparisonMutationResult.removed;
    }

    if (_comparisonProgramIds.length >= 4) {
      return ComparisonMutationResult.limitReached;
    }

    _comparisonProgramIds.add(programId);
    notifyListeners();
    return ComparisonMutationResult.added;
  }

  List<MockProgram> get comparisonPrograms {
    return _comparisonProgramIds
        .map(programById)
        .whereType<MockProgram>()
        .toList(growable: false);
  }

  void setTargetProgram(String programId) {
    _selectedTargetProgramId = programId;
    _usingGenericTemplate = false;
    _hasGeneratedPlan = true;
    notifyListeners();
  }

  void generateGenericPlan() {
    _selectedTargetProgramId = null;
    _usingGenericTemplate = true;
    _hasGeneratedPlan = true;
    notifyListeners();
  }

  MockPlanningSnapshot planningSnapshot() {
    final program = _selectedTargetProgramId == null
        ? null
        : programById(_selectedTargetProgramId!);
    final school = program == null ? null : schoolById(program.schoolId);

    final usingGenericTemplate = _usingGenericTemplate || program == null;
    final hasTarget = program != null;
    final hasPlan = _hasGeneratedPlan || hasTarget;
    final planLabel = usingGenericTemplate ? '通用稳步模板' : '目标院校定制模板';

    return MockPlanningSnapshot(
      examYear: 2027,
      identityLabel: '二战冲刺',
      dailyStudyHours: 6,
      hasTarget: hasTarget,
      hasPlan: hasPlan,
      usingGenericTemplate: usingGenericTemplate,
      planLabel: planLabel,
      headline: hasTarget
          ? '${school!.name} · ${program.name}'
          : '先用通用模板把节奏跑起来',
      subheadline: hasTarget
          ? '已根据 ${program.degreeTypeLabel} 与考试科目结构生成第一版路线。'
          : '目标院校允许暂时为空，先把时间结构、主攻科目和本周 Todo 建起来。',
      warnings: const [
        '当前模板只生成本周计划与对应日计划，后续周次按需展开。',
        '若每日可投入时长低于 4 小时，建议重新评估冲刺节奏。',
      ],
      stages: [
        MockPlanStage(
          title: '基础回补',
          period: '5-7 月',
          focus: usingGenericTemplate
              ? '英语 + 政治起步 + 专业课框架'
              : program.examSubjects.take(2).join(' / '),
          goal: '完成首轮知识地图，补齐薄弱基础。',
        ),
        MockPlanStage(
          title: '强化突破',
          period: '8-10 月',
          focus: usingGenericTemplate
              ? '数学或专业课主线强化'
              : program.examSubjects.skip(2).join(' / '),
          goal: '围绕核心科目做题与错题复盘，建立稳定节奏。',
        ),
        const MockPlanStage(
          title: '冲刺与复盘',
          period: '11-12 月',
          focus: '真题、模拟、复盘与报名节点提醒',
          goal: '压缩失分点，稳住时间管理和临场状态。',
        ),
      ],
      weekTasks: [
        const MockWeekTask(
          subject: '英语阅读',
          hours: 8,
          priorityLabel: '高优先级',
          statusLabel: '本周主线',
        ),
        MockWeekTask(
          subject: hasTarget && program.examMathRequired ? '数学强化' : '专业课框架',
          hours: 10,
          priorityLabel: '高优先级',
          statusLabel: '建议连做 4 天',
        ),
        const MockWeekTask(
          subject: '政治起步',
          hours: 4,
          priorityLabel: '中优先级',
          statusLabel: '保持连续性',
        ),
      ],
      todayTodos: const [
        '完成 2 组英语阅读并复盘错因',
        '整理目标专业近三年分数线差异',
        '晚间 21:30 做 15 分钟复盘',
      ],
      school: school,
      program: program,
    );
  }

  List<MockSchool> get favoriteSchools {
    return _favoriteSchoolIds
        .map(schoolById)
        .whereType<MockSchool>()
        .toList(growable: false);
  }

  List<MockProgram> get favoritePrograms {
    return _favoriteProgramIds
        .map(programById)
        .whereType<MockProgram>()
        .toList(growable: false);
  }

  List<MockResourceFavorite> get favoriteResources {
    return _resources
        .where((resource) => _favoriteResourceIds.contains(resource.id))
        .toList(growable: false);
  }

  List<MockReminder> get reminders => List.unmodifiable(_reminders);

  bool get notificationsAuthorized => _notificationsAuthorized;

  void setNotificationsAuthorized(bool value) {
    _notificationsAuthorized = value;
    notifyListeners();
  }

  void toggleReminder(String reminderId, bool enabled) {
    _reminders = _reminders
        .map(
          (reminder) => reminder.id == reminderId
              ? reminder.copyWith(isEnabled: enabled)
              : reminder,
        )
        .toList(growable: false);
    notifyListeners();
  }
}
