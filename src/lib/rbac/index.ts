// Shared (client + server safe)
export {
  type CampaignRole,
  type Permission,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getPermissions,
  isValidRole,
  outranks,
  ROLE_LABELS,
  ROUTE_PERMISSIONS,
} from './permissions';

// Client-side hooks and components
export { RoleProvider, useRole, RoleGate } from './use-role';

// NOTE: authorize() and getUserRole() are server-only.
// Import them directly: import { authorize } from '@/lib/rbac/authorize';
