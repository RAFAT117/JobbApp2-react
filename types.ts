export interface JobAd {
  id: string;
  headline: string;
  description: {
    text: string;
    text_formatted: string;
  };
  employer: {
    name: string;
    website?: string;
  };
  workplace_address: {
    municipality: string;
    street_address?: string;
    postcode?: string;
    city?: string;
  };
  employment_type: {
    label: string;
  };
  salary_type?: {
    label: string;
  };
  salary_description?: string;
  application_deadline: string;
  working_hours_type?: {
    label: string;
  };
  must_have?: {
    skills?: Array<{ label: string }>;
    experience?: Array<{ label: string }>;
  };
  application_details: {
    url?: string;
    email?: string;
    reference?: string;
    information?: string;
  };
}

export interface UserDocuments {
  cv?: {
    uri: string;
    name: string;
  };
  personalLetter?: {
    uri: string;
    name: string;
  };
} 