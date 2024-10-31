export interface Constraint {
  id: string;
  lhs: string;
  operator: string;
  rhs: string;
}

export interface Solution {
  feasible: boolean;
  result: number;
  bounded?: boolean;
  [key: string]: any;
}

export interface Variable {
  name: string;
  isInteger: boolean;
}