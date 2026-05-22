import 'package:flutter/material.dart';

/// Layout size classes aligned with Material breakpoints.
enum ResponsiveSizeClass {
  /// Width &lt; 600 — phone portrait, narrow Web.
  compact,

  /// 600 ≤ width &lt; 900 — tablet portrait, medium Web.
  medium,

  /// Width ≥ 900 — tablet landscape, wide Web.
  expanded,
}

/// Canonical width thresholds and content limits.
abstract final class ResponsiveBreakpoints {
  static const double compactMax = 600;
  static const double mediumMax = 900;

  static const double maxContentWidthMedium = 720;
  static const double maxContentWidthExpanded = 840;

  static const double pagePaddingCompact = 16;
  static const double pagePaddingMedium = 24;
  static const double pagePaddingExpanded = 32;
}

extension ResponsiveContext on BuildContext {
  double get screenWidth => MediaQuery.sizeOf(this).width;

  ResponsiveSizeClass get sizeClass {
    final width = screenWidth;
    if (width < ResponsiveBreakpoints.compactMax) {
      return ResponsiveSizeClass.compact;
    }
    if (width < ResponsiveBreakpoints.mediumMax) {
      return ResponsiveSizeClass.medium;
    }
    return ResponsiveSizeClass.expanded;
  }

  bool get isCompact => sizeClass == ResponsiveSizeClass.compact;

  bool get isMedium => sizeClass == ResponsiveSizeClass.medium;

  bool get isExpanded => sizeClass == ResponsiveSizeClass.expanded;

  bool get isMediumOrWider => !isCompact;

  bool get useNavigationRail => isMediumOrWider;

  double maxContentWidth() {
    switch (sizeClass) {
      case ResponsiveSizeClass.compact:
        return screenWidth;
      case ResponsiveSizeClass.medium:
        return ResponsiveBreakpoints.maxContentWidthMedium;
      case ResponsiveSizeClass.expanded:
        return ResponsiveBreakpoints.maxContentWidthExpanded;
    }
  }

  EdgeInsets contentPadding() {
    final horizontal = switch (sizeClass) {
      ResponsiveSizeClass.compact => ResponsiveBreakpoints.pagePaddingCompact,
      ResponsiveSizeClass.medium => ResponsiveBreakpoints.pagePaddingMedium,
      ResponsiveSizeClass.expanded => ResponsiveBreakpoints.pagePaddingExpanded,
    };
    return EdgeInsets.fromLTRB(horizontal, 8, horizontal, 24);
  }

  EdgeInsets pagePadding() => contentPadding();

  int responsiveColumnCount({int compact = 1, int medium = 2, int expanded = 2}) {
    switch (sizeClass) {
      case ResponsiveSizeClass.compact:
        return compact;
      case ResponsiveSizeClass.medium:
        return medium;
      case ResponsiveSizeClass.expanded:
        return expanded;
    }
  }
}

/// Centers scrollable page content and caps width on medium+ viewports.
class ResponsivePageBody extends StatelessWidget {
  const ResponsivePageBody({
    super.key,
    required this.child,
    this.applyWidthConstraint = true,
  });

  final Widget child;
  final bool applyWidthConstraint;

  @override
  Widget build(BuildContext context) {
    if (!applyWidthConstraint || context.isCompact) {
      return child;
    }

    return Align(
      alignment: Alignment.topCenter,
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: context.maxContentWidth()),
        child: child,
      ),
    );
  }
}

/// Lays out children in one or two columns depending on viewport width.
class ResponsiveColumns extends StatelessWidget {
  const ResponsiveColumns({
    super.key,
    required this.children,
    this.spacing = 14,
    this.runSpacing = 14,
    this.compactColumns = 1,
    this.wideColumns = 2,
  });

  final List<Widget> children;
  final double spacing;
  final double runSpacing;
  final int compactColumns;
  final int wideColumns;

  @override
  Widget build(BuildContext context) {
    final columnCount = context.isCompact ? compactColumns : wideColumns;
    if (columnCount <= 1 || children.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: _spaced(children, spacing),
      );
    }

    final rows = <Widget>[];
    for (var i = 0; i < children.length; i += columnCount) {
      final rowChildren = <Widget>[];
      for (var j = 0; j < columnCount; j++) {
        final index = i + j;
        if (index >= children.length) {
          if (j == 0) {
            break;
          }
          rowChildren.add(const Expanded(child: SizedBox.shrink()));
          continue;
        }
        rowChildren.add(Expanded(child: children[index]));
        if (j < columnCount - 1) {
          rowChildren.add(SizedBox(width: spacing));
        }
      }
      rows.add(
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: rowChildren,
        ),
      );
      if (i + columnCount < children.length) {
        rows.add(SizedBox(height: runSpacing));
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: rows,
    );
  }

  List<Widget> _spaced(List<Widget> items, double gap) {
    if (items.isEmpty) {
      return const [];
    }
    final result = <Widget>[items.first];
    for (var i = 1; i < items.length; i++) {
      result
        ..add(SizedBox(height: gap))
        ..add(items[i]);
    }
    return result;
  }
}
