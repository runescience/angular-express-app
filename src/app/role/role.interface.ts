// src/app/role/role.interface.ts
export interface Role {
  role_id: string;
  role_name: string;
  description?: string;
  author: string;
  created_on: Date;
  updated_on: Date;
  is_active: boolean;
}

