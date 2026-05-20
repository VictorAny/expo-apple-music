package expo.modules.applemusic

internal object LibraryIds {
  fun isLibraryId(itemId: String): Boolean =
    itemId.startsWith("l.") || itemId.startsWith("i.") || itemId.startsWith("p.")
}
