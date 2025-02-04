// src/app/role/role.interface.ts
export interface Role {
  role_id: string;
  role_name: string;
  description?: string;
  created_on: Date;
  updated_at: Date;
  is_active: boolean;
}