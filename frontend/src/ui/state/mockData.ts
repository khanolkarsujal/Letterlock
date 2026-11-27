// src/ui/state/mockData.ts

export type Entity = {
  id: number;
  text: string;
  category: string;
  token: string;
  locked: boolean;
};

export const defaultEntities: Entity[] = [
  { id: 1, text: "Priya Sharma", category: "Tenant / Full Name", token: "{Person A}", locked: true },
  { id: 2, text: "14 Oak Street", category: "Rental Property Address", token: "{Address 1}", locked: true },
  { id: 3, text: "Mr Rao", category: "Landlord Name", token: "{Person B}", locked: true },
  { id: 4, text: "3 June", category: "Dispute Date", token: "{Date 1}", locked: true },
  { id: 5, text: "£1,200", category: "Withheld Bond Amount", token: "{Amount 1}", locked: true },
  { id: 6, text: "LS-20418", category: "Lease Ref #", token: "{Lease 1}", locked: true },
  { id: 7, text: "98765 43210", category: "Private Contact Phone", token: "{Phone 1}", locked: true },
];

export const defaultStory = "I moved out of 14 Oak Street on 3 June. My landlord, Mr Rao, has kept my deposit of 1,200 and has stopped replying. My name is Priya Sharma, lease ref LS-20418. You can call me on 98765 43210.";

export const exampleSalaryStory = `Subject: Request for Salary Payment Correction

Hello,

My name is Arjun Mehta, and I worked at BrightTech Solutions as a software developer from 12 January 2024 to 30 September 2025.

My employee ID is EMP-78291. My salary for October, amounting to ₹45,800, has not been credited to my bank account.

My registered email is arjun.mehta@gmail.com, and my contact number is 91234 56789.

My bank account number is 123456789012, and my IFSC code is SBIN0001234.

Please contact my manager, Neha Kapoor, at 98765 12340, and resolve this issue by 5 December 2026.

Regards,
Arjun Mehta`;
