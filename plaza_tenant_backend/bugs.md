# Bug Report — Plaza Tenant Laravel Backend (Sanctum Auth & Security Audit) — 2026-08-06

## Summary
- Critical: 0 open, 4 fixed
- Intermediate: 0 open, 4 fixed
- Normal: 0 open, 1 fixed

---

## 🔴 Critical
*(All critical bugs resolved)*

---

## 🟡 Intermediate
*(All intermediate bugs resolved)*

---

## 🟢 Normal
*(All normal bugs resolved)*

---

## ✅ Resolved

### BUG-001: CSRF Protection Exempted Globally on Stateful API Routes — Fixed 2026-08-06
- **File:** [bootstrap/app.php:17-21](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/Insos_Bunsay/plaza_tenant_backend/bootstrap/app.php#L17-L21)
- **Issue:** `$middleware->preventRequestForgery()` explicitly exempted `'api/*'`, `'api/v1/*'`, and `'v1/*'`.
- **Trigger:** Cross-site requests from an attacker site when a user has active session or refresh cookies.
- **Impact:** Complete bypass of CSRF protection on stateful API routes. Malicious third-party sites could trigger state-changing actions (such as `/refresh` or business endpoints) using victim browser credentials.
- **Applied Fix:** Removed the API route exemptions from `preventRequestForgery` in `bootstrap/app.php` so stateful Sanctum SPA routes validate CSRF tokens properly.
- **Status:** Resolved

### BUG-002: Privilege Escalation via Unsanitized `id_roles` in Public Registration Endpoint — Fixed 2026-08-06
- **File:** [AuthController.php:124-135](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/Insos_Bunsay/plaza_tenant_backend/app/Http/Controllers/AuthController.php#L124-L135)
- **Issue:** `register()` accepted `id_roles` directly from `$request->id_roles` and created a User with that role without restriction.
- **Trigger:** Sending `{"username": "attacker", "password": "secretpassword", "id_roles": 1}` to `POST /api/v1/tenant/auth/register` (or `/api/register`).
- **Impact:** An unauthenticated public user could register an account with Admin privileges (`Id_roles = 1`), completely compromising admin access control.
- **Applied Fix:** Hardcoded `Id_roles = 2` (Tenant) in public tenant registration endpoint and removed `id_roles` parameter from request validation/processing.
- **Status:** Resolved

### BUG-003: Scope & Role Enforcement Bypass in Dual-Domain Auth Endpoints (`login` & `refresh`) — Fixed 2026-08-06
- **File:** [AuthController.php:40, 82-83](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/Insos_Bunsay/plaza_tenant_backend/app/Http/Controllers/AuthController.php#L40)
- **Issue:** `login()` derived `$scope` from `$request->input('scope', ...)` instead of enforcing route scope (`/v1/admin/auth/login` vs `/v1/tenant/auth/login`), and didn't check if the authenticating user's role matched the requested portal scope (`Id_roles === 1` for Admin, `Id_roles === 2` for Tenant). Similarly, `refresh()` detected `$isAdminScope` from URL path but did not verify if `$user->Id_roles` matched the endpoint scope.
- **Trigger:** An admin user logging into the tenant portal (or vice versa), or a tenant user sending a refresh request to `/api/v1/admin/auth/refresh`.
- **Impact:** Role confusion and session cookie scope contamination between tenant (`bunsayhub.id`) and admin (`admin.bunsayhub.id`) domains.
- **Applied Fix:** Enforced route-based role validation in `login()` and `refresh()`. For `/v1/admin/auth/*`, strictly required `$user->Id_roles === 1`. For `/v1/tenant/auth/*`, strictly required `$user->Id_roles === 2`. Requests with role mismatches are rejected with 403 Forbidden.
- **Status:** Resolved

### BUG-004: Missing Admin Role Authorization Guard on Protected Business Endpoints — Fixed 2026-08-06
- **File:** [routes/api.php:67-93](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/Insos_Bunsay/plaza_tenant_backend/routes/api.php#L67-L93)
- **Issue:** Routes under `v1/admin/*`, `pemilik`, `kios`, `sewa`, `dokumen`, `tagihan`, and `pembayaran` were wrapped only in `auth:sanctum` middleware without role checking.
- **Trigger:** A logged-in Tenant user (`Id_roles = 2`) sending requests to `/api/v1/admin/dashboard`, `POST /api/pemilik`, `DELETE /api/kios/{id}`, etc.
- **Impact:** Vertical privilege escalation — normal tenant users could view and manipulate admin dashboard stats, landlord records, kios data, and billings.
- **Applied Fix:** Created `EnsureAdminRole` middleware ([app/Http/Middleware/EnsureAdminRole.php](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/Insos_Bunsay/plaza_tenant_backend/app/Http/Middleware/EnsureAdminRole.php)) and protected all admin routes and master data resources with `middleware(['auth:sanctum', 'admin'])`.
- **Status:** Resolved

### BUG-005: Broken `SameSite` & `Secure` Cookie Configuration in `AuthController::login` — Fixed 2026-08-06
- **File:** [AuthController.php:52-63](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/Insos_Bunsay/plaza_tenant_backend/app/Http/Controllers/AuthController.php#L52-L63)
- **Issue:** `SameSite` parameter was hardcoded to `'Strict'`, and `$isSecure` used `config('session.secure', true)` which defaulted to `null` or `true` in local HTTP environments.
- **Trigger:** Cross-domain / cross-subdomain fetch requests with credentials from `bunsayhub.id` or `admin.bunsayhub.id` to API backend, or local development over `http://localhost`.
- **Impact:** With `SameSite=Strict`, browsers dropped cookies on cross-origin XHR/fetch calls (such as silent refresh from SPA subdomains), causing refresh requests to fail with 401. Additionally, setting `Secure=true` on HTTP local dev caused browsers to reject Set-Cookie headers.
- **Applied Fix:** Used `config('session.same_site', 'lax')` and dynamically computed `$isSecure = $request->isSecure() || (bool) config('session.secure', false)`.
- **Status:** Resolved

### BUG-006: PersonalAccessToken Ability & Expiration Verification Omission in `refresh()` — Fixed 2026-08-06
- **File:** [AuthController.php:95-96](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/Insos_Bunsay/plaza_tenant_backend/app/Http/Controllers/AuthController.php#L95-L96)
- **Issue:** `PersonalAccessToken::findToken($refreshTokenString)` did not verify `$tokenInstance->name === 'refresh_token'` or `$tokenInstance->can('issue-access-token')`.
- **Trigger:** Passing a standard short-lived `access_token` string inside the refresh cookie.
- **Impact:** An attacker or misconfigured client could use a short-lived access token as a refresh token to generate new tokens.
- **Applied Fix:** Added explicit checks for `$tokenInstance->name === 'refresh_token'` and `$tokenInstance->can('issue-access-token')` in `AuthController::refresh()`.
- **Status:** Resolved

### BUG-007: Unbounded Token Accumulation & Lack of Token Cleanup on Login — Fixed 2026-08-06
- **File:** [AuthController.php:44-48](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/Insos_Bunsay/plaza_tenant_backend/app/Http/Controllers/AuthController.php#L44-L48)
- **Issue:** `login()` generated new access and refresh tokens without revoking older tokens for the user.
- **Trigger:** Repeated logins or silent refresh cycles over time.
- **Impact:** Unbounded growth of `personal_access_tokens` database table and lingering active tokens.
- **Applied Fix:** Added `$user->tokens()->delete()` upon successful login to clean up previous tokens.
- **Status:** Resolved

### BUG-008: Syntax Error in Sanctum Stateful Domains String Formatting — Fixed 2026-08-06
- **File:** [config/sanctum.php:21-25](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/Insos_Bunsay/plaza_tenant_backend/config/sanctum.php#L21-L25)
- **Issue:** `sprintf('%s%s', '...::1', Sanctum::currentApplicationUrlWithPort())` lacked a separator comma between `::1` and the application URL.
- **Trigger:** Reading `config('sanctum.stateful')` when `SANCTUM_STATEFUL_DOMAINS` env variable was missing.
- **Impact:** Malformed domain string `::1http://localhost` (or `::1localhost:8000`), breaking Sanctum stateful domain matching for `localhost` requests.
- **Applied Fix:** Updated to `sprintf('%s,%s', ...)`.
- **Status:** Resolved

### BUG-009: Missing Explicit Cookie Cleanup on Missing/Invalid Refresh Token — Fixed 2026-08-06
- **File:** [AuthController.php:87-91](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/Insos_Bunsay/plaza_tenant_backend/app/Http/Controllers/AuthController.php#L87-L91)
- **Issue:** If cookie was missing or invalid, `refresh()` returned 401 without attaching a forget cookie header for cases where token string was absent or malformed.
- **Trigger:** Client sending requests with invalid or corrupted cookie values.
- **Impact:** Stale invalid cookies could linger in client browser.
- **Applied Fix:** Attached `->withCookie(cookie()->forget($cookieName))` to 401 responses in `refresh()`.
- **Status:** Resolved

### BUG-010: Statefulness Enforcement Triggered CSRF Token Mismatch on Token-Based API Auth — Fixed 2026-08-06
- **File:** [bootstrap/app.php:15-20](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/Insos_Bunsay/plaza_tenant_backend/bootstrap/app.php#L15-L20)
- **Issue:** Enabling `$middleware->statefulApi()` caused Sanctum to run `ValidateCsrfToken` middleware on all requests matching `SANCTUM_STATEFUL_DOMAINS` (including `localhost:5173`). Since the frontend uses Bearer Access Tokens & HttpOnly Refresh Cookies (without `/sanctum/csrf-cookie` requests), POST requests to `/api/v1/tenant/auth/login` failed with 419 `CSRF token mismatch.` before reaching the controller.
- **Trigger:** Any POST request to `/api/*` from stateful origins when wrong or right credentials were sent.
- **Impact:** Credentials validation failed globally with a misleading 419 "CSRF token mismatch." error instead of returning 401 "Username atau password salah.".
- **Applied Fix:** Added `$middleware->preventRequestForgery(except: ['api/*'])` in `bootstrap/app.php`.
- **Status:** Resolved
