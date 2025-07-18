export type RoleFormValues = {
  name: string;
  level: number;
  status: boolean;
  permissions: Record<string, number>;
};