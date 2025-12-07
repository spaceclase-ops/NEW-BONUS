export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  financial_target: number;
  quantity_target: number;
  branch?: string;
}

export interface Sale {
  id: string;
  user_id: string;
  created_by: string;
  sale_date: string;
  client_name: string;
  subscription_type: string;
  customer_type: string;
  amount: number;
  commission: number;
  is_split: boolean;
  partner_name?: string;
}