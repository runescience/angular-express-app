// src/app/teams/team.interface.ts
export interface Team {
  id: string;
  teamName: string;
  author: string;
  createdOn: Date;
  updatedOn: Date;
  isActive: boolean;
}
