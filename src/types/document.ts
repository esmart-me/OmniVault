export type LifeAdminCategory =
  | "Identity"
  | "Insurance"
  | "Credit Card Bill"
  | "Birthday/Event"
  | "Warranty"
  | "Vehicle";

export type EntryType = "Scanned Document" | "Manual Entry";

export type StatusFlag = "Active" | "Expired" | "Overdue" | "Upcoming";

export type RecurrenceFrequency = "none" | "weekly" | "monthly" | "quarterly" | "yearly";

export interface PaymentRecord {
  id: string;
  paid_date: string;
  amount: string;
  utr?: string;
  cycle_due_date: string;
}

export interface RecurringConfig {
  frequency: RecurrenceFrequency;
  auto_schedule_next?: boolean;
  last_paid_date?: string;
  payment_history?: PaymentRecord[];
}

export interface IdentificationNumbers {
  primary_id: string | null;
  secondary_id: string | null;
}

export interface FinancialDetails {
  total_amount_due: string | null;
  minimum_amount_due: string | null;
  recurring?: RecurringConfig;
}

export interface ImportantDates {
  issue_date_or_dob: string | null;
  expiry_date_or_due_date: string | null;
}

export interface CountdownCalculations {
  days_remaining_countdown: number | null;
  status_flag: StatusFlag;
}

/**
 * Strict JSON schema for Smart Life-Admin, Document, and Reminder Assistant
 */
export interface LifeAdminExtractionResult {
  entry_type: EntryType;
  category: LifeAdminCategory;
  document_or_event_name: string;
  holder_or_person_name: string | null;
  identification_numbers: IdentificationNumbers;
  financial_details: FinancialDetails;
  important_dates: ImportantDates;
  countdown_calculations: CountdownCalculations;
  user_friendly_summary: string;
  action_required: string;
  recurring?: RecurringConfig;
}

export interface LifeAdminItem extends LifeAdminExtractionResult {
  id: string;
  created_at: string;
  updated_at: string;
  file_name?: string;
  file_data_url?: string;
  file_type?: "image" | "pdf" | "text";
  raw_input_text?: string;
  notes?: string;
  verified_by_user?: boolean;
}

export interface SampleLifeAdminPreset {
  id: string;
  category: LifeAdminCategory;
  title: string;
  description: string;
  entry_type: EntryType;
  preview_badge: string;
  raw_text: string;
  expected_extraction: LifeAdminExtractionResult;
}
