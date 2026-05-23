class ResourceDetailRouteArgs {
  const ResourceDetailRouteArgs({
    required this.resourceId,
    this.resourceTitle,
  });

  final String resourceId;
  final String? resourceTitle;
}
