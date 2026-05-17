sealed class ApiResult<T> {
  const ApiResult();

  bool get isSuccess => this is ApiSuccess<T>;

  T? get data {
    final current = this;
    if (current is ApiSuccess<T>) {
      return current.data;
    }
    return null;
  }

  String? get errorMessage {
    final current = this;
    if (current is ApiFailure<T>) {
      return current.message;
    }
    return null;
  }
}

final class ApiSuccess<T> extends ApiResult<T> {
  const ApiSuccess(this.data);

  @override
  final T data;
}

final class ApiFailure<T> extends ApiResult<T> {
  const ApiFailure(this.message);

  final String message;
}
