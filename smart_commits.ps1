# Smart commit script - commits files group by group with meaningful messages
# based on actual project file content and structure

$remoteUrl = "https://github.com/Poorna-danushka/fitness_app.git"

# Remove existing local git history
if (Test-Path ".git") {
    cmd /c rmdir /s /q .git
    Write-Host "Removed old git history."
}

git init
git branch -M main
git remote add origin $remoteUrl
Write-Host "Initialized fresh Git repository."

function Make-Commit {
    param([string]$message, [string[]]$paths)
    foreach ($p in $paths) {
        if (Test-Path $p) {
            git add $p
        }
    }
    $status = git status --porcelain
    if ($status) {
        git commit -m $message
        Write-Host "[OK] $message"
    } else {
        Write-Host "[SKIP] Nothing to commit for: $message"
    }
}

# ─── COMMIT 1: Root config files ────────────────────────────────────────────
Make-Commit "chore: initialize project repository with .gitignore" @(".gitignore")

# ─── COMMIT 2: Root docs ─────────────────────────────────────────────────────
Make-Commit "docs: add root README with project overview" @("README.md")

# ─── COMMIT 3: Setup and migration docs ──────────────────────────────────────
Make-Commit "docs: add SETUP guide and MIGRATION_COMPLETE notes" @("SETUP.md", "MIGRATION_COMPLETE.md")

# ─── COMMIT 4: Postman collection ────────────────────────────────────────────
Make-Commit "docs: add Postman API collection for testing endpoints" @("POSTMAN_COLLECTION.json")

# ─── COMMIT 5: Backend package.json ──────────────────────────────────────────
Make-Commit "feat(backend): initialize Node.js backend with package.json" @("backend/package.json", "backend/package-lock.json")

# ─── COMMIT 6: Backend env and gitignore ─────────────────────────────────────
Make-Commit "chore(backend): add .env.example and backend .gitignore" @("backend/.env.example", "backend/.gitignore")

# ─── COMMIT 7: Backend README ────────────────────────────────────────────────
Make-Commit "docs(backend): add backend README with API documentation" @("backend/README.md")

# ─── COMMIT 8: Database config ───────────────────────────────────────────────
Make-Commit "feat(backend): configure MySQL database connection (config/db.js)" @("backend/config/db.js")

# ─── COMMIT 9: Constants ─────────────────────────────────────────────────────
Make-Commit "feat(backend): add application-wide constants" @("backend/constants/index.js")

# ─── COMMIT 10: Server entry point ───────────────────────────────────────────
Make-Commit "feat(backend): set up Express server with middleware and routing (server.js)" @("backend/server.js")

# ─── COMMIT 11: User model ───────────────────────────────────────────────────
Make-Commit "feat(backend): add User model with Sequelize schema and validations" @("backend/models/User.js")

# ─── COMMIT 12: Exercise model ───────────────────────────────────────────────
Make-Commit "feat(backend): add Exercise model with category and muscle group fields" @("backend/models/Exercise.js")

# ─── COMMIT 13: Workout model ────────────────────────────────────────────────
Make-Commit "feat(backend): add Workout model linked to User and Exercise" @("backend/models/Workout.js")

# ─── COMMIT 14: Package model ────────────────────────────────────────────────
Make-Commit "feat(backend): add Package model for subscription plan definitions" @("backend/models/Package.js")

# ─── COMMIT 15: PackageExercise model ────────────────────────────────────────
Make-Commit "feat(backend): add PackageExercise join table model" @("backend/models/PackageExercise.js")

# ─── COMMIT 16: Purchase model ───────────────────────────────────────────────
Make-Commit "feat(backend): add Purchase model to track user plan purchases" @("backend/models/Purchase.js")

# ─── COMMIT 17: Payment model ────────────────────────────────────────────────
Make-Commit "feat(backend): add Payment model with status tracking" @("backend/models/Payment.js")

# ─── COMMIT 18: Invoice model ────────────────────────────────────────────────
Make-Commit "feat(backend): add Invoice model for billing records" @("backend/models/Invoice.js")

# ─── COMMIT 19: Subscription model ───────────────────────────────────────────
Make-Commit "feat(backend): add Subscription model with start/end date tracking" @("backend/models/Subscription.js")

# ─── COMMIT 20: CompletedExercise model ──────────────────────────────────────
Make-Commit "feat(backend): add CompletedExercise model to track exercise completion" @("backend/models/CompletedExercise.js")

# ─── COMMIT 21: JWT utility ──────────────────────────────────────────────────
Make-Commit "feat(backend): implement JWT token generation and verification utility" @("backend/utils/jwt.js")

# ─── COMMIT 22: Error utility ────────────────────────────────────────────────
Make-Commit "feat(backend): add custom error classes for consistent API error handling" @("backend/utils/errors.js")

# ─── COMMIT 23: Async handler utility ────────────────────────────────────────
Make-Commit "feat(backend): add asyncHandler wrapper to eliminate try/catch boilerplate" @("backend/utils/asyncHandler.js")

# ─── COMMIT 24: Logger utility ───────────────────────────────────────────────
Make-Commit "feat(backend): add Winston-based logger utility for structured logging" @("backend/utils/logger.js")

# ─── COMMIT 25: Email utility ────────────────────────────────────────────────
Make-Commit "feat(backend): add email utility with Nodemailer for transactional emails" @("backend/utils/email.js")

# ─── COMMIT 26: Auth middleware ───────────────────────────────────────────────
Make-Commit "feat(backend): implement JWT authentication middleware (middleware/auth.js)" @("backend/middleware/auth.js")

# ─── COMMIT 27: Admin middleware ─────────────────────────────────────────────
Make-Commit "feat(backend): add admin role authorization middleware" @("backend/middleware/admin.js")

# ─── COMMIT 28: CORS middleware ──────────────────────────────────────────────
Make-Commit "feat(backend): configure CORS middleware for cross-origin requests" @("backend/middleware/cors.js")

# ─── COMMIT 29: Error handler middleware ─────────────────────────────────────
Make-Commit "feat(backend): add global error handler middleware for consistent responses" @("backend/middleware/errorHandler.js")

# ─── COMMIT 30: Rate limiter middleware ──────────────────────────────────────
Make-Commit "feat(backend): add rate limiter middleware to prevent API abuse" @("backend/middleware/rateLimiter.js")

# ─── COMMIT 31: Auth controller ──────────────────────────────────────────────
Make-Commit "feat(backend): implement auth controller (register, login, logout, refresh token)" @("backend/controllers/authController.js")

# ─── COMMIT 32: User controller ──────────────────────────────────────────────
Make-Commit "feat(backend): implement user controller for profile management" @("backend/controllers/userController.js")

# ─── COMMIT 33: Exercise controller ──────────────────────────────────────────
Make-Commit "feat(backend): implement exercise controller with CRUD operations" @("backend/controllers/exerciseController.js")

# ─── COMMIT 34: Workout controller ───────────────────────────────────────────
Make-Commit "feat(backend): implement workout controller to create and fetch workouts" @("backend/controllers/workoutController.js")

# ─── COMMIT 35: Package controller ───────────────────────────────────────────
Make-Commit "feat(backend): implement package controller for subscription plan management" @("backend/controllers/packageController.js")

# ─── COMMIT 36: Purchase controller ──────────────────────────────────────────
Make-Commit "feat(backend): implement purchase controller to handle plan purchases" @("backend/controllers/purchaseController.js")

# ─── COMMIT 37: Payment controller ───────────────────────────────────────────
Make-Commit "feat(backend): implement payment controller with payment gateway integration" @("backend/controllers/paymentController.js")

# ─── COMMIT 38: Completed exercise controller ────────────────────────────────
Make-Commit "feat(backend): implement completedExercise controller to log finished exercises" @("backend/controllers/completedExerciseController.js")

# ─── COMMIT 39: Routes ───────────────────────────────────────────────────────
Make-Commit "feat(backend): add auth, user, exercise, workout, package, purchase and payment routes" @(
    "backend/routes/authRoutes.js",
    "backend/routes/userRoutes.js",
    "backend/routes/exerciseRoutes.js",
    "backend/routes/workoutRoutes.js",
    "backend/routes/packageRoutes.js",
    "backend/routes/purchaseRoutes.js",
    "backend/routes/paymentRoutes.js",
    "backend/routes/completedExerciseRoutes.js"
)

# ─── COMMIT 40: Payment service ──────────────────────────────────────────────
Make-Commit "feat(backend): add payment service layer for gateway abstraction" @("backend/services/paymentService.js")

# ─── COMMIT 41: Validators ───────────────────────────────────────────────────
Make-Commit "feat(backend): add input validators for request body sanitization" @("backend/validators/index.js")

# ─── COMMIT 42: Seed files ───────────────────────────────────────────────────
Make-Commit "chore(backend): add seed scripts for exercises and admin user" @("backend/seed/seedExercises.js", "backend/seedAdmin.js")

# ─── COMMIT 43: Fix calories script ──────────────────────────────────────────
Make-Commit "fix(backend): add script to fix calorie data inconsistencies (fixCalories.js)" @("backend/fixCalories.js")

# ─── COMMIT 44: Frontend package.json ────────────────────────────────────────
Make-Commit "feat(frontend): initialize React + Vite + TypeScript frontend project" @(
    "frontend/package.json",
    "frontend/package-lock.json",
    "frontend/tsconfig.json",
    "frontend/tsconfig.node.json",
    "frontend/vite.config.ts"
)

# ─── COMMIT 45: Frontend config files ────────────────────────────────────────
Make-Commit "chore(frontend): add frontend .env.example, .gitignore and postcss config" @(
    "frontend/.env.example",
    "frontend/.gitignore",
    "frontend/postcss.config.mjs",
    "frontend/tailwind.config.js",
    "frontend/.vscode/settings.json"
)

# ─── COMMIT 46: Frontend HTML entry ──────────────────────────────────────────
Make-Commit "feat(frontend): add HTML entry point (index.html)" @("frontend/index.html")

# ─── COMMIT 47: Frontend main and CSS ────────────────────────────────────────
Make-Commit "feat(frontend): add React entry point (main.tsx) and global styles (index.css)" @(
    "frontend/src/main.tsx",
    "frontend/src/index.css",
    "frontend/src/vite-env.d.ts"
)

# ─── COMMIT 48: Frontend App.tsx and routing ─────────────────────────────────
Make-Commit "feat(frontend): set up App.tsx with React Router and application-level routing" @("frontend/src/App.tsx")

# ─── COMMIT 49: Auth context and stores ──────────────────────────────────────
Make-Commit "feat(frontend): add AuthContext and global auth/UI Zustand stores" @(
    "frontend/src/context/AuthContext.tsx",
    "frontend/src/stores/authStore.ts",
    "frontend/src/stores/uiStore.ts"
)

# ─── COMMIT 50: API client and services ──────────────────────────────────────
Make-Commit "feat(frontend): add Axios API client with interceptors and auth/payment services" @(
    "frontend/src/api/apiService.ts",
    "frontend/src/services/apiClient.ts",
    "frontend/src/services/authService.ts",
    "frontend/src/services/paymentService.ts"
)

# ─── COMMIT 51: Utility hooks ────────────────────────────────────────────────
Make-Commit "feat(frontend): add custom React hooks (useUI)" @("frontend/src/hooks/useUI.ts")

# ─── COMMIT 52: Security utilities ───────────────────────────────────────────
Make-Commit "feat(frontend): add client-side security utility functions" @("frontend/src/utils/security.ts")

# ─── COMMIT 53: ThemeProvider and layout components ──────────────────────────
Make-Commit "feat(frontend): add ThemeProvider for dark/light mode support" @("frontend/src/components/ThemeProvider.tsx")

# ─── COMMIT 54: Navbar component ─────────────────────────────────────────────
Make-Commit "feat(frontend): implement responsive Navbar component with auth state" @("frontend/src/components/Navbar.tsx")

# ─── COMMIT 55: Auth route guards ────────────────────────────────────────────
Make-Commit "feat(frontend): add ProtectedRoute and AdminRoute guard components" @(
    "frontend/src/components/ProtectedRoute.tsx",
    "frontend/src/components/AdminRoute.tsx"
)

# ─── COMMIT 56: Layout components ────────────────────────────────────────────
Make-Commit "feat(frontend): add UserLayout and AdminLayout wrapper components" @(
    "frontend/src/components/UserLayout.tsx",
    "frontend/src/components/AdminLayout.tsx"
)

# ─── COMMIT 57: Sidebar components ───────────────────────────────────────────
Make-Commit "feat(frontend): implement UserSidebar and AdminSidebar navigation components" @(
    "frontend/src/components/UserSidebar.tsx",
    "frontend/src/components/AdminSidebar.tsx"
)

# ─── COMMIT 58: Shared UI components ─────────────────────────────────────────
Make-Commit "feat(frontend): add LoadingSpinner, Notifications and ErrorBoundary components" @(
    "frontend/src/components/LoadingSpinner.tsx",
    "frontend/src/components/Notifications.tsx",
    "frontend/src/components/ErrorBoundary.tsx"
)

# ─── COMMIT 59: PackageForm and PaymentModal ──────────────────────────────────
Make-Commit "feat(frontend): add PackageForm for creating plans and PaymentModal for checkout" @(
    "frontend/src/components/PackageForm.tsx",
    "frontend/src/components/PaymentModal.tsx"
)

# ─── COMMIT 60: Home page ────────────────────────────────────────────────────
Make-Commit "feat(frontend): build Home landing page with hero section and feature highlights" @("frontend/src/pages/Home.tsx")

# ─── COMMIT 61: Login and Register pages ─────────────────────────────────────
Make-Commit "feat(frontend): implement Login and Register pages with form validation" @(
    "frontend/src/pages/Login.tsx",
    "frontend/src/pages/Register.tsx"
)

# ─── COMMIT 62: Dashboard page ───────────────────────────────────────────────
Make-Commit "feat(frontend): build user Dashboard with workout summary and progress stats" @("frontend/src/pages/Dashboard.tsx")

# ─── COMMIT 63: Exercises and ExerciseView pages ─────────────────────────────
Make-Commit "feat(frontend): add Exercises browse page and ExerciseView detail page" @(
    "frontend/src/pages/Exercises.tsx",
    "frontend/src/pages/ExerciseView.tsx"
)

# ─── COMMIT 64: Workouts page ────────────────────────────────────────────────
Make-Commit "feat(frontend): implement Workouts page for logging and tracking workout sessions" @("frontend/src/pages/Workouts.tsx")

# ─── COMMIT 65: Package and Pricing pages ────────────────────────────────────
Make-Commit "feat(frontend): add PackageList and Pricing pages for subscription plans" @(
    "frontend/src/pages/PackageList.tsx",
    "frontend/src/pages/Pricing.tsx"
)

# ─── COMMIT 66: MyPackage page ───────────────────────────────────────────────
Make-Commit "feat(frontend): build MyPackage page showing user's active subscription" @("frontend/src/pages/MyPackage.tsx")

# ─── COMMIT 67: Profile page ─────────────────────────────────────────────────
Make-Commit "feat(frontend): implement Profile page with editable user info and avatar upload" @("frontend/src/pages/Profile.tsx")

# ─── COMMIT 68: NotFound page ────────────────────────────────────────────────
Make-Commit "feat(frontend): add 404 NotFound page with redirect to home" @("frontend/src/pages/NotFound.tsx")

# ─── COMMIT 69: Admin Dashboard ──────────────────────────────────────────────
Make-Commit "feat(frontend): build Admin Dashboard with analytics and stats overview" @("frontend/src/pages/admin/AdminDashboard.tsx")

# ─── COMMIT 70: Admin Management pages ───────────────────────────────────────
Make-Commit "feat(frontend): add ManageUsers, ManageExercises, ManagePackages, ManagePurchases admin pages" @(
    "frontend/src/pages/admin/ManageUsers.tsx",
    "frontend/src/pages/admin/ManageExercises.tsx",
    "frontend/src/pages/admin/ManagePackages.tsx",
    "frontend/src/pages/admin/ManagePurchases.tsx"
)

# ─── COMMIT 71: Frontend README ──────────────────────────────────────────────
Make-Commit "docs(frontend): add frontend README with setup and development instructions" @("frontend/README.md")

# Push everything
Write-Host "`nPushing all commits to GitHub..."
git push -u origin main --force
Write-Host "`n[DONE] Successfully pushed all commits to GitHub!"

$totalCommits = [int](git rev-list --count HEAD)
Write-Host "Total commits: $totalCommits"
