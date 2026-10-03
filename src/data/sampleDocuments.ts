import { SampleLifeAdminPreset } from '../types/document';

export const SAMPLE_LIFE_ADMIN_PRESETS: SampleLifeAdminPreset[] = [
  {
    id: 'sample-electricity-bill',
    category: 'Credit Card Bill',
    title: 'Electricity Utility Bill (Due in 4 Days)',
    entry_type: 'Scanned Document',
    description: 'Monthly electricity utility bill with consumer number, due date, and payment amount.',
    preview_badge: 'Consumer 1154 • Due Oct 07 • ₹2,450',
    raw_text: `KERALA STATE ELECTRICITY BOARD (KSEB) - ELECTRICITY BILL
Consumer No: 11540294812
Consumer Name: SAKEER HUSSAIN
Billing Date: 23/09/2026
Due Date: 07/10/2026
Disconnection Date: 22/10/2026

BILL DETAILS:
Units Consumed: 340 kWh
Energy Charges: ₹1,980.00
Fuel Surcharge & Duty: ₹470.00
Total Amount Payable: ₹2,450.00
Prompt Payment Discount available if paid on or before 07-Oct-2026.`,
    expected_extraction: {
      entry_type: 'Scanned Document',
      category: 'Credit Card Bill',
      document_or_event_name: 'Electricity Utility Bill',
      holder_or_person_name: 'SAKEER HUSSAIN',
      identification_numbers: {
        primary_id: '11540294812',
        secondary_id: 'KSEB Section 04'
      },
      financial_details: {
        total_amount_due: '₹2,450.00',
        minimum_amount_due: null,
        recurring: {
          frequency: 'monthly',
          auto_schedule_next: true
        }
      },
      important_dates: {
        issue_date_or_dob: '2026-09-23',
        expiry_date_or_due_date: '2026-10-07'
      },
      countdown_calculations: {
        days_remaining_countdown: 4,
        status_flag: 'Upcoming'
      },
      user_friendly_summary: 'Your Electricity bill of ₹2,450.00 is due in 4 days on 7th Oct 2026.',
      action_required: 'Pay Bill',
      recurring: {
        frequency: 'monthly',
        auto_schedule_next: true
      }
    }
  },
  {
    id: 'sample-credit-card-bill',
    category: 'Credit Card Bill',
    title: 'HDFC Regalia Credit Card Statement',
    entry_type: 'Scanned Document',
    description: 'Monthly credit card e-statement with Total Due, Minimum Due, and payment due date.',
    preview_badge: 'Card ending 4921 • Due Oct 18 • ₹38,450',
    raw_text: `HDFC BANK LIMITED - CREDIT CARD STATEMENT
Cardholder Name: SAKEER HUSSAIN
Card Number: 4528-XXXX-XXXX-4921
Card Type: Regalia Gold Visa Signature
Statement Date: 28/09/2026
Payment Due Date: 18/10/2026

ACCOUNT SUMMARY:
Total Amount Due: ₹38,450.00
Minimum Amount Due: ₹2,500.00
Credit Limit: ₹5,00,000.00
Available Credit Limit: ₹4,61,550.00
Reward Points Balance: 18,450 pts

Pay online before 18-Oct-2026 to avoid late payment charges of ₹1,300 and finance charges of 3.6% per month.`,
    expected_extraction: {
      entry_type: 'Scanned Document',
      category: 'Credit Card Bill',
      document_or_event_name: 'HDFC Credit Card Bill',
      holder_or_person_name: 'SAKEER HUSSAIN',
      identification_numbers: {
        primary_id: '4921',
        secondary_id: 'Regalia Gold Visa'
      },
      financial_details: {
        total_amount_due: '₹38,450.00',
        minimum_amount_due: '₹2,500.00',
        recurring: {
          frequency: 'monthly',
          auto_schedule_next: true
        }
      },
      important_dates: {
        issue_date_or_dob: '2026-09-28',
        expiry_date_or_due_date: '2026-10-18'
      },
      countdown_calculations: {
        days_remaining_countdown: 15,
        status_flag: 'Upcoming'
      },
      user_friendly_summary: 'Your HDFC credit card bill of ₹38,450.00 (min ₹2,500.00) is due on 18th Oct 2026 (15 days remaining).',
      action_required: 'Pay Bill',
      recurring: {
        frequency: 'monthly',
        auto_schedule_next: true
      }
    }
  },
  {
    id: 'sample-birthday-rahul',
    category: 'Birthday/Event',
    title: "Rahul's 11th Birthday (Manual Note)",
    entry_type: 'Manual Entry',
    description: 'Natural language manual entry calculating exact upcoming date, age, and days remaining.',
    preview_badge: 'Son Rahul • Born Oct 12 2015 • Turns 11',
    raw_text: `My son Rahul's birthday is on Oct 12 2015. Need to plan a superhero party and order a chocolate cake.`,
    expected_extraction: {
      entry_type: 'Manual Entry',
      category: 'Birthday/Event',
      document_or_event_name: "Rahul's Birthday",
      holder_or_person_name: 'Rahul',
      identification_numbers: {
        primary_id: null,
        secondary_id: null
      },
      financial_details: {
        total_amount_due: null,
        minimum_amount_due: null
      },
      important_dates: {
        issue_date_or_dob: '2015-10-12',
        expiry_date_or_due_date: '2026-10-12'
      },
      countdown_calculations: {
        days_remaining_countdown: 9,
        status_flag: 'Upcoming'
      },
      user_friendly_summary: "Rahul is turning 11 on 12th October 2026! His birthday is coming up in 9 days.",
      action_required: 'Buy Gift'
    }
  },
  {
    id: 'sample-passport-identity',
    category: 'Identity',
    title: "John's Passport",
    entry_type: 'Scanned Document',
    description: 'Government photo passport identity and travel document with expiry date.',
    preview_badge: 'Passport No: Z5892104 • John Doe',
    raw_text: `REPUBLIC OF INDIA - PASSPORT
Type: P, Country Code: IND, Passport No: Z5892104
Surname: DOE
Given Names: JOHN
Nationality: INDIAN, Sex: M
Date of Birth: 14/08/1990
Place of Birth: KOCHI, KERALA
Date of Issue: 16/04/2017
Date of Expiry: 15/04/2027
Place of Issue: COCHIN`,
    expected_extraction: {
      entry_type: 'Scanned Document',
      category: 'Identity',
      document_or_event_name: "John's Passport",
      holder_or_person_name: 'JOHN DOE',
      identification_numbers: {
        primary_id: 'Z5892104',
        secondary_id: 'IND-COCHIN'
      },
      financial_details: {
        total_amount_due: null,
        minimum_amount_due: null
      },
      important_dates: {
        issue_date_or_dob: '1990-08-14',
        expiry_date_or_due_date: '2027-04-15'
      },
      countdown_calculations: {
        days_remaining_countdown: 194,
        status_flag: 'Active'
      },
      user_friendly_summary: "John's Passport (Z5892104) is valid until 15th April 2027.",
      action_required: 'Renew Passport'
    }
  },
  {
    id: 'sample-vehicle-puc',
    category: 'Vehicle',
    title: 'KL-07 Honda City PUC Certificate',
    entry_type: 'Scanned Document',
    description: 'Pollution Under Control emission test certificate with calculated 6-month validity.',
    preview_badge: 'KL-07-CB-4521 • Emission Test • BS-IV',
    raw_text: `GOVERNMENT OF KERALA - MOTOR VEHICLES DEPARTMENT
POLLUTION UNDER CONTROL (PUC) CERTIFICATE
Vehicle Reg No: KL-07-CB-4521
Chassis No: MAKGM4570K1049214
Vehicle Make: Honda City 1.5 i-VTEC Petrol
Emission Norm: Bharat Stage IV (BS-IV)
Test Date: 2026-05-10
Valid Until: 2026-11-09 (Validity: 6 Months)
Fee Paid: ₹100.00`,
    expected_extraction: {
      entry_type: 'Scanned Document',
      category: 'Vehicle',
      document_or_event_name: 'KL-07 Honda City PUC Certificate',
      holder_or_person_name: null,
      identification_numbers: {
        primary_id: 'KL-07-CB-4521',
        secondary_id: 'MAKGM4570K1049214'
      },
      financial_details: {
        total_amount_due: null,
        minimum_amount_due: null
      },
      important_dates: {
        issue_date_or_dob: '2026-05-10',
        expiry_date_or_due_date: '2026-11-09'
      },
      countdown_calculations: {
        days_remaining_countdown: 37,
        status_flag: 'Active'
      },
      user_friendly_summary: 'Vehicle pollution certificate for KL-07-CB-4521 expires on 9th Nov 2026 (in 37 days).',
      action_required: 'Get Emission Test Done'
    }
  },
  {
    id: 'sample-insurance-health',
    category: 'Insurance',
    title: 'Star Health Family Health Insurance',
    entry_type: 'Scanned Document',
    description: 'Annual health insurance policy with sum insured and annual renewal premium due date.',
    preview_badge: 'Policy: P/120938/01 • ₹10 Lakhs Cover',
    raw_text: `STAR HEALTH & ALLIED INSURANCE CO. LTD.
POLICY SCHEDULE - FAMILY HEALTH OPTIMA INSURANCE
Policy Number: P/120938/01/2026
Proposer Name: SAKEER HUSSAIN
Cover Type: 2 Adults + 1 Child Floater
Sum Insured: ₹10,00,000.00
Period of Insurance: From 21/11/2025 to 20/11/2026
Gross Renewal Premium: ₹18,450.00 (Inclusive of GST)`,
    expected_extraction: {
      entry_type: 'Scanned Document',
      category: 'Insurance',
      document_or_event_name: 'Family Health Insurance Policy',
      holder_or_person_name: 'SAKEER HUSSAIN',
      identification_numbers: {
        primary_id: 'P/120938/01/2026',
        secondary_id: '₹10,00,000 Sum Insured'
      },
      financial_details: {
        total_amount_due: '₹18,450.00',
        minimum_amount_due: null
      },
      important_dates: {
        issue_date_or_dob: '2025-11-21',
        expiry_date_or_due_date: '2026-11-20'
      },
      countdown_calculations: {
        days_remaining_countdown: 48,
        status_flag: 'Active'
      },
      user_friendly_summary: 'Your Star Health insurance policy renewal premium of ₹18,450.00 is due on 20th Nov 2026.',
      action_required: 'Pay Renewal Premium'
    }
  },
  {
    id: 'sample-warranty-ac',
    category: 'Warranty',
    title: 'LG 1.5 Ton Dual Inverter AC Warranty',
    entry_type: 'Scanned Document',
    description: 'Retail invoice and manufacturer 2-year comprehensive warranty card.',
    preview_badge: 'Model: RS-Q19ENZE • 2-Yr Comprehensive',
    raw_text: `RELIANCE DIGITAL - RETAIL TAX INVOICE
Invoice No: RD-KOC-2024-99412
Invoice Date: 2024-11-15
Customer: SAKEER HUSSAIN
Item: LG Dual Inverter Split AC 1.5 Ton 5-Star (Copper)
Model: RS-Q19ENZE
Serial: 404KNYG019842
Total Paid: ₹48,990.00
Warranty: 2 Years Comprehensive Warranty from Invoice Date (Expires 15/11/2026)`,
    expected_extraction: {
      entry_type: 'Scanned Document',
      category: 'Warranty',
      document_or_event_name: 'LG AC Warranty Card',
      holder_or_person_name: 'SAKEER HUSSAIN',
      identification_numbers: {
        primary_id: 'RD-KOC-2024-99412',
        secondary_id: 'Serial: 404KNYG019842'
      },
      financial_details: {
        total_amount_due: null,
        minimum_amount_due: null
      },
      important_dates: {
        issue_date_or_dob: '2024-11-15',
        expiry_date_or_due_date: '2026-11-15'
      },
      countdown_calculations: {
        days_remaining_countdown: 43,
        status_flag: 'Active'
      },
      user_friendly_summary: '2-year comprehensive warranty for LG AC expires on 15th Nov 2026 (in 43 days).',
      action_required: 'Schedule Free Service'
    }
  }
];
