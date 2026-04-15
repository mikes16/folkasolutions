export interface LegalSection {
  heading?: string;
  paragraphs: string[];
}

export interface LegalDocument {
  updated: string;
  intro?: string;
  sections: LegalSection[];
}

export type LegalContent = Record<"es" | "en", LegalDocument>;
