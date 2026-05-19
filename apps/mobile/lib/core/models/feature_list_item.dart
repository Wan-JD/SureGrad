class FeatureListItem {
  const FeatureListItem({
    required this.id,
    required this.title,
    required this.subtitle,
    this.footnote,
  });

  final String id;
  final String title;
  final String subtitle;
  final String? footnote;
}
