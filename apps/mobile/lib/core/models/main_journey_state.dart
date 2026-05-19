enum MainJourneyState { noTarget, noPlan, hasPlan }

extension MainJourneyStateCopy on MainJourneyState {
  String get label {
    switch (this) {
      case MainJourneyState.noTarget:
        return '未设目标';
      case MainJourneyState.noPlan:
        return '无计划';
      case MainJourneyState.hasPlan:
        return '有计划';
    }
  }

  String get title {
    switch (this) {
      case MainJourneyState.noTarget:
        return '先设置目标院校';
      case MainJourneyState.noPlan:
        return '目标已同步，下一步生成计划';
      case MainJourneyState.hasPlan:
        return '学习计划已就绪';
    }
  }

  String get summary {
    switch (this) {
      case MainJourneyState.noTarget:
        return '设置目标后，规划页和今日任务才会同步出真实数据。';
      case MainJourneyState.noPlan:
        return '目标已可用，但还没有学习计划。生成后会继续带出周安排和今日任务。';
      case MainJourneyState.hasPlan:
        return '当前目标、学习计划和任务安排都已经进入可继续执行的状态。';
    }
  }

  String get nextStep {
    switch (this) {
      case MainJourneyState.noTarget:
        return '去选学校并设为目标';
      case MainJourneyState.noPlan:
        return '进入规划页生成计划';
      case MainJourneyState.hasPlan:
        return '查看今日 Todo 并继续执行';
    }
  }
}
