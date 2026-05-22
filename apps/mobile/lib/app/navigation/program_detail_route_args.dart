class ProgramDetailRouteArgs {
  const ProgramDetailRouteArgs({
    required this.programId,
    this.programName,
  });

  final String programId;
  final String? programName;
}
