// AppleMusicBridgeError.swift
// Map native errors to Expo bridge Exception codes.

import ExpoModulesCore

@available(iOS 16.0, *)
enum AppleMusicBridgeError {
  /// Maps thrown errors to Expo `Exception` codes for async bridge methods.
  static func rethrow<T>(_ operation: () async throws -> T) async throws -> T {
    do {
      return try await operation()
    } catch let exception as Exception {
      throw exception
    } catch {
      throw exception(from: error)
    }
  }

  static func exception(from error: Error) -> Exception {
    if let rest = error as? AppleMusicRestClient.RestError {
      let code = rest.bridgeCode
      return Exception(
        name: code,
        description: rest.errorDescription ?? "Apple Music error",
        code: code
      )
    }

    if let catalog = error as? CatalogService.CatalogServiceError {
      switch catalog {
      case .configurationRequired(let message):
        return Exception(
          name: AppleMusicErrorCodes.permissionDenied,
          description: message,
          code: AppleMusicErrorCodes.permissionDenied
        )
      case .notFound, .unknownResourceType:
        let message = catalog.errorDescription ?? "Apple Music error"
        return Exception(name: AppleMusicErrorCodes.error, description: message, code: AppleMusicErrorCodes.error)
      }
    }

    if let subscription = error as? SubscriptionService.SubscriptionError {
      return Exception(
        name: subscription.code,
        description: subscription.errorDescription ?? "Apple Music error",
        code: subscription.code
      )
    }

    let message = error.localizedDescription
    let code =
      message.localizedCaseInsensitiveContains("403")
        || message.localizedCaseInsensitiveContains("authorization required")
        || message.localizedCaseInsensitiveContains("subscription needed")
      ? AppleMusicErrorCodes.permissionDenied
      : AppleMusicErrorCodes.error
    return Exception(name: code, description: message, code: code)
  }
}
