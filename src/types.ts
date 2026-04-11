export interface Incident {
  id: string;
  region: string;
  station: string;
  equipment: string;
  eqNumber: string;
  voltage: string;
  disconnectTime: string;
  connectTime: string;
  reason: string;
  notes: string;
  status: 'مُرجع' | 'مفصول' | string;
  date: string;
  employeeName: string;
}

export interface Sources {
  regions: string[];
  stations: string[];
  equipments: string[];
  voltages: string[];
  reasons: string[];
  employees: string[];
  timeFormat?: '12h' | '24h';
  printSettings?: {
    headerImage?: string | null;
    coverImage?: string | null;
    pdfMargin?: number;
    pdfScale?: number;
    pdfFontSize?: number;
    printFontSize?: number;
    preparedBy?: string;
    approvedBy?: string;
  };
}
