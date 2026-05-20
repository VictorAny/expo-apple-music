// AppleMusicBridgeError.swift
// Map native errors to Expo bridge Exception codes.

import ExpoModulesCore

@available(iOS 16.0, *)
enum AppleMusicBridgeError {
  static func exception(from error: Error) -> Exception {
    if let rest = error as? AppleMusicRestClient.RestError {
      let code = rest.bridgeCode
      return Exception(
        name: code,
        description: rest.errorDescription ?? "Apple Music error",
        code: code
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
