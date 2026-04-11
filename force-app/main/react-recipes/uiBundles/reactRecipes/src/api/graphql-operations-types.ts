export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Base64: { input: string; output: string; }
  Currency: { input: number | string; output: number; }
  Date: { input: string; output: string; }
  DateTime: { input: string; output: string; }
  Double: { input: number | string; output: number; }
  Email: { input: string; output: string; }
  EncryptedString: { input: string; output: string; }
  /** Can be set to an ID or a Reference to the result of another mutation operation. */
  IdOrRef: { input: string; output: string; }
  Latitude: { input: number | string; output: number; }
  /** A 64-bit signed integer */
  Long: { input: number; output: number; }
  LongTextArea: { input: string; output: string; }
  Longitude: { input: number | string; output: number; }
  MultiPicklist: { input: string; output: string; }
  Percent: { input: number | string; output: number; }
  PhoneNumber: { input: string; output: string; }
  Picklist: { input: string; output: string; }
  RichTextArea: { input: string; output: string; }
  TextArea: { input: string; output: string; }
  Time: { input: string; output: string; }
  Url: { input: string; output: string; }
};

export type AccountCreateInput = {
  Account: AccountCreateRepresentation;
};

export type AccountCreateRepresentation = {
  AccountNumber?: InputMaybe<Scalars['String']['input']>;
  AccountSource?: InputMaybe<Scalars['Picklist']['input']>;
  AnnualRevenue?: InputMaybe<Scalars['Currency']['input']>;
  BillingCity?: InputMaybe<Scalars['String']['input']>;
  BillingCountry?: InputMaybe<Scalars['String']['input']>;
  BillingGeocodeAccuracy?: InputMaybe<Scalars['Picklist']['input']>;
  BillingLatitude?: InputMaybe<Scalars['Latitude']['input']>;
  BillingLongitude?: InputMaybe<Scalars['Longitude']['input']>;
  BillingPostalCode?: InputMaybe<Scalars['String']['input']>;
  BillingState?: InputMaybe<Scalars['String']['input']>;
  BillingStreet?: InputMaybe<Scalars['TextArea']['input']>;
  CleanStatus?: InputMaybe<Scalars['Picklist']['input']>;
  DandbCompanyId?: InputMaybe<Scalars['IdOrRef']['input']>;
  Description?: InputMaybe<Scalars['LongTextArea']['input']>;
  DunsNumber?: InputMaybe<Scalars['String']['input']>;
  Fax?: InputMaybe<Scalars['PhoneNumber']['input']>;
  Industry?: InputMaybe<Scalars['Picklist']['input']>;
  Jigsaw?: InputMaybe<Scalars['String']['input']>;
  NaicsCode?: InputMaybe<Scalars['String']['input']>;
  NaicsDesc?: InputMaybe<Scalars['String']['input']>;
  Name?: InputMaybe<Scalars['String']['input']>;
  NumberOfEmployees?: InputMaybe<Scalars['Int']['input']>;
  OperatingHoursId?: InputMaybe<Scalars['IdOrRef']['input']>;
  OwnerId?: InputMaybe<Scalars['IdOrRef']['input']>;
  Ownership?: InputMaybe<Scalars['Picklist']['input']>;
  ParentId?: InputMaybe<Scalars['IdOrRef']['input']>;
  Phone?: InputMaybe<Scalars['PhoneNumber']['input']>;
  Rating?: InputMaybe<Scalars['Picklist']['input']>;
  ShippingCity?: InputMaybe<Scalars['String']['input']>;
  ShippingCountry?: InputMaybe<Scalars['String']['input']>;
  ShippingGeocodeAccuracy?: InputMaybe<Scalars['Picklist']['input']>;
  ShippingLatitude?: InputMaybe<Scalars['Latitude']['input']>;
  ShippingLongitude?: InputMaybe<Scalars['Longitude']['input']>;
  ShippingPostalCode?: InputMaybe<Scalars['String']['input']>;
  ShippingState?: InputMaybe<Scalars['String']['input']>;
  ShippingStreet?: InputMaybe<Scalars['TextArea']['input']>;
  Sic?: InputMaybe<Scalars['String']['input']>;
  SicDesc?: InputMaybe<Scalars['String']['input']>;
  Site?: InputMaybe<Scalars['String']['input']>;
  TickerSymbol?: InputMaybe<Scalars['String']['input']>;
  Tradestyle?: InputMaybe<Scalars['String']['input']>;
  Type?: InputMaybe<Scalars['Picklist']['input']>;
  Website?: InputMaybe<Scalars['Url']['input']>;
  YearStarted?: InputMaybe<Scalars['String']['input']>;
};

export type AccountUpdateInput = {
  Account: AccountUpdateRepresentation;
  Id: Scalars['IdOrRef']['input'];
};

export type AccountUpdateRepresentation = {
  AccountNumber?: InputMaybe<Scalars['String']['input']>;
  AccountSource?: InputMaybe<Scalars['Picklist']['input']>;
  AnnualRevenue?: InputMaybe<Scalars['Currency']['input']>;
  BillingCity?: InputMaybe<Scalars['String']['input']>;
  BillingCountry?: InputMaybe<Scalars['String']['input']>;
  BillingGeocodeAccuracy?: InputMaybe<Scalars['Picklist']['input']>;
  BillingLatitude?: InputMaybe<Scalars['Latitude']['input']>;
  BillingLongitude?: InputMaybe<Scalars['Longitude']['input']>;
  BillingPostalCode?: InputMaybe<Scalars['String']['input']>;
  BillingState?: InputMaybe<Scalars['String']['input']>;
  BillingStreet?: InputMaybe<Scalars['TextArea']['input']>;
  CleanStatus?: InputMaybe<Scalars['Picklist']['input']>;
  DandbCompanyId?: InputMaybe<Scalars['IdOrRef']['input']>;
  Description?: InputMaybe<Scalars['LongTextArea']['input']>;
  DunsNumber?: InputMaybe<Scalars['String']['input']>;
  Fax?: InputMaybe<Scalars['PhoneNumber']['input']>;
  Industry?: InputMaybe<Scalars['Picklist']['input']>;
  Jigsaw?: InputMaybe<Scalars['String']['input']>;
  NaicsCode?: InputMaybe<Scalars['String']['input']>;
  NaicsDesc?: InputMaybe<Scalars['String']['input']>;
  Name?: InputMaybe<Scalars['String']['input']>;
  NumberOfEmployees?: InputMaybe<Scalars['Int']['input']>;
  OperatingHoursId?: InputMaybe<Scalars['IdOrRef']['input']>;
  OwnerId?: InputMaybe<Scalars['IdOrRef']['input']>;
  Ownership?: InputMaybe<Scalars['Picklist']['input']>;
  ParentId?: InputMaybe<Scalars['IdOrRef']['input']>;
  Phone?: InputMaybe<Scalars['PhoneNumber']['input']>;
  Rating?: InputMaybe<Scalars['Picklist']['input']>;
  ShippingCity?: InputMaybe<Scalars['String']['input']>;
  ShippingCountry?: InputMaybe<Scalars['String']['input']>;
  ShippingGeocodeAccuracy?: InputMaybe<Scalars['Picklist']['input']>;
  ShippingLatitude?: InputMaybe<Scalars['Latitude']['input']>;
  ShippingLongitude?: InputMaybe<Scalars['Longitude']['input']>;
  ShippingPostalCode?: InputMaybe<Scalars['String']['input']>;
  ShippingState?: InputMaybe<Scalars['String']['input']>;
  ShippingStreet?: InputMaybe<Scalars['TextArea']['input']>;
  Sic?: InputMaybe<Scalars['String']['input']>;
  SicDesc?: InputMaybe<Scalars['String']['input']>;
  Site?: InputMaybe<Scalars['String']['input']>;
  TickerSymbol?: InputMaybe<Scalars['String']['input']>;
  Tradestyle?: InputMaybe<Scalars['String']['input']>;
  Type?: InputMaybe<Scalars['Picklist']['input']>;
  Website?: InputMaybe<Scalars['Url']['input']>;
  YearStarted?: InputMaybe<Scalars['String']['input']>;
};

export type ContactCreateInput = {
  Contact: ContactCreateRepresentation;
};

export type ContactCreateRepresentation = {
  AccountId?: InputMaybe<Scalars['IdOrRef']['input']>;
  AssistantName?: InputMaybe<Scalars['String']['input']>;
  AssistantPhone?: InputMaybe<Scalars['PhoneNumber']['input']>;
  Birthdate?: InputMaybe<Scalars['Date']['input']>;
  BuyerAttributes?: InputMaybe<Scalars['MultiPicklist']['input']>;
  CleanStatus?: InputMaybe<Scalars['Picklist']['input']>;
  ContactSource?: InputMaybe<Scalars['Picklist']['input']>;
  Department?: InputMaybe<Scalars['String']['input']>;
  Description?: InputMaybe<Scalars['LongTextArea']['input']>;
  DoNotCall?: InputMaybe<Scalars['Boolean']['input']>;
  Email?: InputMaybe<Scalars['Email']['input']>;
  EmailBouncedDate?: InputMaybe<Scalars['DateTime']['input']>;
  EmailBouncedReason?: InputMaybe<Scalars['String']['input']>;
  Fax?: InputMaybe<Scalars['PhoneNumber']['input']>;
  FirstName?: InputMaybe<Scalars['String']['input']>;
  GenderIdentity?: InputMaybe<Scalars['Picklist']['input']>;
  HasOptedOutOfEmail?: InputMaybe<Scalars['Boolean']['input']>;
  HasOptedOutOfFax?: InputMaybe<Scalars['Boolean']['input']>;
  HomePhone?: InputMaybe<Scalars['PhoneNumber']['input']>;
  IndividualId?: InputMaybe<Scalars['IdOrRef']['input']>;
  Jigsaw?: InputMaybe<Scalars['String']['input']>;
  LastName?: InputMaybe<Scalars['String']['input']>;
  LeadSource?: InputMaybe<Scalars['Picklist']['input']>;
  MailingCity?: InputMaybe<Scalars['String']['input']>;
  MailingCountry?: InputMaybe<Scalars['String']['input']>;
  MailingGeocodeAccuracy?: InputMaybe<Scalars['Picklist']['input']>;
  MailingLatitude?: InputMaybe<Scalars['Latitude']['input']>;
  MailingLongitude?: InputMaybe<Scalars['Longitude']['input']>;
  MailingPostalCode?: InputMaybe<Scalars['String']['input']>;
  MailingState?: InputMaybe<Scalars['String']['input']>;
  MailingStreet?: InputMaybe<Scalars['TextArea']['input']>;
  MobilePhone?: InputMaybe<Scalars['PhoneNumber']['input']>;
  OtherCity?: InputMaybe<Scalars['String']['input']>;
  OtherCountry?: InputMaybe<Scalars['String']['input']>;
  OtherGeocodeAccuracy?: InputMaybe<Scalars['Picklist']['input']>;
  OtherLatitude?: InputMaybe<Scalars['Latitude']['input']>;
  OtherLongitude?: InputMaybe<Scalars['Longitude']['input']>;
  OtherPhone?: InputMaybe<Scalars['PhoneNumber']['input']>;
  OtherPostalCode?: InputMaybe<Scalars['String']['input']>;
  OtherState?: InputMaybe<Scalars['String']['input']>;
  OtherStreet?: InputMaybe<Scalars['TextArea']['input']>;
  OwnerId?: InputMaybe<Scalars['IdOrRef']['input']>;
  Phone?: InputMaybe<Scalars['PhoneNumber']['input']>;
  Picture__c?: InputMaybe<Scalars['Url']['input']>;
  Pronouns?: InputMaybe<Scalars['Picklist']['input']>;
  ReportsToId?: InputMaybe<Scalars['IdOrRef']['input']>;
  Salutation?: InputMaybe<Scalars['Picklist']['input']>;
  Title?: InputMaybe<Scalars['String']['input']>;
};

export enum DataType {
  Address = 'ADDRESS',
  Anytype = 'ANYTYPE',
  Base64 = 'BASE64',
  Boolean = 'BOOLEAN',
  Combobox = 'COMBOBOX',
  Complexvalue = 'COMPLEXVALUE',
  Currency = 'CURRENCY',
  Date = 'DATE',
  Datetime = 'DATETIME',
  Double = 'DOUBLE',
  Email = 'EMAIL',
  Encryptedstring = 'ENCRYPTEDSTRING',
  Int = 'INT',
  Json = 'JSON',
  Junctionidlist = 'JUNCTIONIDLIST',
  Location = 'LOCATION',
  Long = 'LONG',
  Multipicklist = 'MULTIPICKLIST',
  Percent = 'PERCENT',
  Phone = 'PHONE',
  Picklist = 'PICKLIST',
  Reference = 'REFERENCE',
  String = 'STRING',
  Textarea = 'TEXTAREA',
  Time = 'TIME',
  Url = 'URL'
}

export enum FieldExtraTypeInfo {
  ExternalLookup = 'EXTERNAL_LOOKUP',
  ImageUrl = 'IMAGE_URL',
  IndirectLookup = 'INDIRECT_LOOKUP',
  Personname = 'PERSONNAME',
  Plaintextarea = 'PLAINTEXTAREA',
  Richtextarea = 'RICHTEXTAREA',
  SwitchablePersonname = 'SWITCHABLE_PERSONNAME'
}

export enum LayoutComponentType {
  Canvas = 'CANVAS',
  CustomLink = 'CUSTOM_LINK',
  EmptySpace = 'EMPTY_SPACE',
  Field = 'FIELD',
  ReportChart = 'REPORT_CHART',
  VisualforcePage = 'VISUALFORCE_PAGE'
}

export enum LayoutMode {
  Create = 'CREATE',
  Edit = 'EDIT',
  View = 'VIEW'
}

export enum LayoutType {
  Compact = 'COMPACT',
  Full = 'FULL'
}

/** Input to the mutation to delete a Record */
export type RecordDeleteInput = {
  /** The ID of the Record to delete */
  Id: Scalars['IdOrRef']['input'];
};

export enum ResultOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

export enum TabOrder {
  LeftRight = 'LEFT_RIGHT',
  TopDown = 'TOP_DOWN'
}

export enum UiBehavior {
  Edit = 'EDIT',
  Readonly = 'READONLY',
  Required = 'REQUIRED'
}

export type GetFirstAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFirstAccountQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Industry?: { value?: string | null } | null, AnnualRevenue?: { value?: number | null } | null } | null } | null> | null } | null } } };

export type GetAccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAccountsQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Industry?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type GetAccountsWithContactsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAccountsWithContactsQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Industry?: { value?: string | null } | null, Contacts?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Title?: { value?: string | null } | null, Phone?: { value?: string | null } | null, Picture__c?: { value?: string | null } | null } | null } | null> | null } | null } | null } | null> | null } | null } } };

export type GetContactsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetContactsQuery = { uiapi: { query: { Contact?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Phone?: { value?: string | null } | null, Picture__c?: { value?: string | null } | null, Title?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type GoodAccountQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type GoodAccountQueryQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type ContactsWithPictureQueryVariables = Exact<{ [key: string]: never; }>;


export type ContactsWithPictureQuery = { uiapi: { query: { Contact?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Phone?: { value?: string | null } | null, Picture__c?: { value?: string | null } | null, Title?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type FirstAccountNameQueryVariables = Exact<{ [key: string]: never; }>;


export type FirstAccountNameQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type AccountsByIndustryQueryVariables = Exact<{
  industry?: InputMaybe<Scalars['Picklist']['input']>;
}>;


export type AccountsByIndustryQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type AccountIndustryQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountIndustryQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Industry?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type FirstContactQueryVariables = Exact<{ [key: string]: never; }>;


export type FirstContactQuery = { uiapi: { query: { Contact?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Title?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type AccountListQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountListQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Industry?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type TwoAccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type TwoAccountsQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Industry?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type AccountsForSelectionQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountsForSelectionQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Industry?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type DashboardCountsQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardCountsQuery = { uiapi: { query: { accounts?: { edges?: Array<{ node?: { Id: string } | null } | null> | null } | null, contacts?: { edges?: Array<{ node?: { Id: string } | null } | null> | null } | null, opportunities?: { edges?: Array<{ node?: { Id: string } | null } | null> | null } | null } } };

export type SearchAccountsQueryVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
}>;


export type SearchAccountsQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Industry?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type CreateAccountMutationVariables = Exact<{
  input: AccountCreateInput;
}>;


export type CreateAccountMutation = { uiapi: { AccountCreate?: { Record?: { Id: string, Name?: { value?: string | null } | null } | null } | null } };

export type AccountsForDeleteQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountsForDeleteQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Industry?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type DeleteAccountMutationVariables = Exact<{
  input: RecordDeleteInput;
}>;


export type DeleteAccountMutation = { uiapi: { AccountDelete?: { Id?: string | null } | null } };

export type AccountsForEditingQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountsForEditingQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Industry?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type UpdateAccountMutationVariables = Exact<{
  input: AccountUpdateInput;
}>;


export type UpdateAccountMutation = { uiapi: { AccountUpdate?: { Record?: { Id: string, Name?: { value?: string | null } | null, Industry?: { value?: string | null } | null } | null } | null } };

export type CreateContactMutationVariables = Exact<{
  input: ContactCreateInput;
}>;


export type CreateContactMutation = { uiapi: { ContactCreate?: { Record?: { Id: string, Name?: { value?: string | null } | null } | null } | null } };

export type FirstAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type FirstAccountQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Industry?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type MultiObjectCountsQueryVariables = Exact<{ [key: string]: never; }>;


export type MultiObjectCountsQuery = { uiapi: { query: { accounts?: { edges?: Array<{ node?: { Id: string } | null } | null> | null } | null, contacts?: { edges?: Array<{ node?: { Id: string } | null } | null> | null } | null } } };

export type FilteredContactsQueryVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
}>;


export type FilteredContactsQuery = { uiapi: { query: { Contact?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Title?: { value?: string | null } | null, Phone?: { value?: string | null } | null, Picture__c?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type RefetchContactsQueryVariables = Exact<{ [key: string]: never; }>;


export type RefetchContactsQuery = { uiapi: { query: { Contact?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Title?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type ListContactsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListContactsQuery = { uiapi: { query: { Contact?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Title?: { value?: string | null } | null, Phone?: { value?: string | null } | null, Picture__c?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type PaginatedContactsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type PaginatedContactsQuery = { uiapi: { query: { Contact?: { pageInfo: { hasNextPage: boolean, endCursor?: string | null }, edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Title?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type ContactsWithAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type ContactsWithAccountQuery = { uiapi: { query: { Contact?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Title?: { value?: string | null } | null, Account?: { Name?: { value?: string | null } | null } | null } | null } | null> | null } | null } } };

export type SingleContactQueryVariables = Exact<{ [key: string]: never; }>;


export type SingleContactQuery = { uiapi: { query: { Contact?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Title?: { value?: string | null } | null, Phone?: { value?: string | null } | null, Picture__c?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type AccountsForNestingQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountsForNestingQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Industry?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type AccountsForRoutingQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountsForRoutingQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Industry?: { value?: string | null } | null } | null } | null> | null } | null } } };

export type AccountByIdQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
}>;


export type AccountByIdQuery = { uiapi: { query: { Account?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Industry?: { value?: string | null } | null, Phone?: { value?: string | null } | null, Website?: { value?: string | null } | null } | null } | null> | null } | null } } };
