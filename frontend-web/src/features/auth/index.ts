// API
export { authApi } from './api';

// Components
export { LoginForm, PermissionGuard, RegisterForm } from './components';
export { ResetDemoDataButton } from './components/ResetDemoDataButton';

// Context
export { ViewModeProvider, useViewMode } from './context/ViewModeContext';
export type { ViewRole } from './context/ViewModeContext';

// Hooks / Presenters
export {
  useAuthPresenter,
  useRegisterPresenter,
  useLogout,
  useDeleteAccount,
  useAuthMe,
  useEffectiveRole,
  useForgotPassword,
  useResetPassword,
  useUpdateProfile,
  useChangePassword,
  useTabSync,
} from './hooks';
export type { IAuthPresenter, IRegisterPresenter } from './hooks';

// Lib
export { activateDemoMode, deactivateDemoMode, isDemoActive } from './lib/demoMode';

// Models / Types
export type {
  LoginRequest,
  RegisterRequest,
  UserResponse,
  LoginResponse,
  UserRole,
  RegisterRole,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from './models';

// Constants
export { AUTH_VALIDATION_RULES } from './models/auth.constants';

// Services
export { AuthService } from './services/authService';
export type { IAuthService } from './services/IAuthService';
