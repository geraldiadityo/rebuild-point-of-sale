# Authentication State Management Specification

## 1. Objective
Implement a robust authentication flow and state management system using Zustand and TanStack React Query. The implementation must seamlessly integrate with the existing Next.js App Router architecture.

## 2. Architecture & File Structure Rules
- **Domain-Driven Design:** Code MUST be grouped by domain/feature, NOT by technical type. Do not create global `/hooks` or `/stores` folders if a domain-specific folder (e.g., `src/features/auth/` or `src/modules/auth/`) exists or should exist.
- **File Crawling Requirement:** Always crawl the existing workspace to match naming conventions, file exports, and directory nesting before creating new files.

## 3. Technology Stack
- State Management: `zustand`
- Data Fetching/Mutations: `@tanstack/react-query`
- Storage: Browser Cookies (`js-cookie` or Next.js native utilities depending on whether it's Server Components or Client Components).

## 4. API & Cookie Specifications
- **Endpoint:** POST `api/auth/login`
- **Internal Routing:** Ensure API requests are correctly routed (backend services operate on port 8000 internally).
- **Success Response:** ```json
  {
    "data": "true",
    "message": "success message"
  }
  ```
- **Cookie Handling:**
  - **Set:** Upon successful login, set an HttpOnly cookie named `auth_token` with the received token.
  - **Get:** Use `js-cookie` (or Next.js equivalents) to read the cookie for subsequent requests.
  - **Delete:** Implement a logout function to remove this cookie.

## 5. Implementation Details

### 5.1. Zustand Store (`src/store/authStore.ts`)
- **State:**
  - `isAuthenticated: boolean` (derived from cookie presence or explicit state)
  - `user: User | null` (optional user profile data)
  - `token: string | null` (optional token storage)
- **Actions:**
  - `login(credentials: LoginCredentials) => Promise<void>`: Calls the API, handles success/error, updates state.
  - `logout() => void`: Clears state and removes the cookie.
  - `checkAuth() => void`: Validates current auth status on mount.

### 5.2. React Query Hooks
- **`useLogin`**: A mutation hook for the login API.
  - `mutationFn`: POST to `api/auth/login`.
  - `onSuccess`: Store the token in the cookie and update the Zustand store.
  - `onError`: Handle error display.
- **`useLogout`**: A mutation hook to clear auth state and remove the cookie.

### 5.3. UI Integration
- **Login Page**: A form that triggers `useLogin`.
- **Protected Routes**: Use `useAuth` to guard routes. If not authenticated, redirect to `/login`.
- **Layout**: Update the main layout to show/hide elements based on `isAuthenticated`.

## 6. Verification Checklist
- [ ] Can a user successfully log in via the API?
- [ ] Is the `auth_token` cookie set correctly (HttpOnly)?
- [ ] Does the Zustand store reflect the authenticated state?
- [ ] Can a user log out, and is the cookie removed?
- [ ] Are protected routes correctly redirecting unauthenticated users?
- [ ] Does the implementation follow the domain-driven folder structure?