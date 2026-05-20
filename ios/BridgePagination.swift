import Foundation

/// Shared bridge pagination defaults (limit 25, offset 0).
struct BridgePagination {
  let limit: Int
  let offset: Int

  init(from dictionary: NSDictionary) {
    limit = dictionary["limit"] as? Int ?? 25
    offset = dictionary["offset"] as? Int ?? 0
  }

  init(limit: Int, offset: Int) {
    self.limit = limit
    self.offset = offset
  }
}
