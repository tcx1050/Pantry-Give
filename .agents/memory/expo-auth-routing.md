---
name: Expo auth routing
description: Route-group URL behavior for Pantry Give authentication in Expo web previews.
---

Expo Router route groups such as `(auth)` are organizational only in public web URLs. The working auth URLs are `/sign-in` and `/sign-up`; using `/(auth)/...` in redirects can produce a blank preview even though the grouped route file exists.

**Why:** The Expo web preview rendered the custom screen at `/sign-in` but not at the grouped URL, so root auth handling must use the public paths.

**How to apply:** Keep `(auth)` for file organization and use `/sign-in` or `/sign-up` for links and redirects. Let the root route render the signed-out screen while Clerk session state settles.