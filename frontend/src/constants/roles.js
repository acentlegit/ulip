/**
 * User Role Constants for Frontend
 * 
 * This file defines all available user roles in the system.
 * Matches the backend roles constants.
 */

export const UserRoles = {
  // Super Admin - Full system access across all organizations
  SUPER_ADMIN: "SUPER_ADMIN",
  
  // Organization Admin - Full access within their organization
  ORG_ADMIN: "ORG_ADMIN",
  
  // Lawyer - Case management, client interaction, document access
  LAWYER: "LAWYER",
  
  // Paralegal - Support tasks, document preparation, case assistance
  PARALEGAL: "PARALEGAL",
  
  // Finance User - Billing, invoicing, financial reports
  FINANCE: "FINANCE",
  
  // Client - Portal access to their own cases and documents
  CLIENT: "CLIENT"
};

/**
 * Display names for roles (for UI purposes)
 */
export const RoleDisplayNames = {
  [UserRoles.SUPER_ADMIN]: "Super Admin",
  [UserRoles.ORG_ADMIN]: "Organization Admin",
  [UserRoles.LAWYER]: "Lawyer",
  [UserRoles.PARALEGAL]: "Paralegal",
  [UserRoles.FINANCE]: "Finance User",
  [UserRoles.CLIENT]: "Client (Portal Access)"
};

/**
 * Role descriptions
 */
export const RoleDescriptions = {
  [UserRoles.SUPER_ADMIN]: "Full system access across all organizations",
  [UserRoles.ORG_ADMIN]: "Full access within their organization",
  [UserRoles.LAWYER]: "Case management, client interaction, document access",
  [UserRoles.PARALEGAL]: "Support tasks, document preparation, case assistance",
  [UserRoles.FINANCE]: "Billing, invoicing, financial reports",
  [UserRoles.CLIENT]: "Portal access to their own cases and documents"
};

/**
 * Get all roles as an array
 */
export const getAllRoles = () => Object.values(UserRoles);

/**
 * Get role display name
 */
export const getRoleDisplayName = (role) => RoleDisplayNames[role] || role;

/**
 * Get role description
 */
export const getRoleDescription = (role) => RoleDescriptions[role] || "";

/**
 * Check if a role is an admin role
 */
export const isAdminRole = (role) => {
  return role === UserRoles.SUPER_ADMIN || role === UserRoles.ORG_ADMIN;
};

/**
 * Check if a role can manage users
 */
export const canManageUsers = (role) => {
  return isAdminRole(role);
};

/**
 * Check if a role can access financial data
 */
export const canAccessFinance = (role) => {
  return role === UserRoles.SUPER_ADMIN || 
         role === UserRoles.ORG_ADMIN || 
         role === UserRoles.FINANCE;
};

/**
 * Check if a role can manage cases
 */
export const canManageCases = (role) => {
  return role !== UserRoles.CLIENT && role !== UserRoles.FINANCE;
};

/**
 * Format role for display (replaces underscores with spaces and capitalizes)
 */
export const formatRole = (role) => {
  if (!role) return "";
  return getRoleDisplayName(role);
};
