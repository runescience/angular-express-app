// src/app/teams/team.interface.ts
export interface Team {
  id: string;
  teamName: string;
  author: string;
  created_on: Date;
  updated_on: Date;
  is_active: boolean;
}
