export type AccountType = "NGO" | "Delivery"

export interface Applicant {
  id: string
  name: string
  userId: string
  accountType: AccountType
  date: string
  email: string
  status: "Pending Review" | "Approved" | "Rejected"
  reviewer: string
  reviewDate: string
  phone: string
  address: string
  bank: {
    accountName: string
    accountNumber: string
    bankName: string
  }
  documents: {
    label: string
    url: string
  }[]
  avatarUrl?: string
}

