/*
 *  Copyright (c) 2024 Aerospace DPP Demo
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Digital Product Passport for Trent XWB High-Pressure Turbine Blade
const digitalProductPassport = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/aerospace/dpp/v1"
  ],
  "id": "did:web:rolls-royce.com:parts:serial:98765-XYZ-123",
  "type": ["VerifiableCredential", "AerospacePartPassport"],
  "issuer": "did:web:rolls-royce.com",
  "issuanceDate": "2025-10-27T10:00:00Z",
  "credentialSubject": {
    "id": "did:web:rolls-royce.com:parts:serial:98765-XYZ-123",
    "partType": "HighPressureTurbineBlade",
    "sku": "RR-TrentXWB-HPT-Blade-001",
    "identityNode": {
      "manufacturerName": "Rolls-Royce plc",
      "cageCode": "K1039",
      "partNumber": "FW12345",
      "serialNumber": "HPT998877",
      "batchNumber": "BATCH-2025-001",
      "manufacturingDate": "2025-09-15",
      "manufacturingLocation": "Derby, United Kingdom"
    },
    "airworthinessNode": {
      "formType": "EASA_FORM_1",
      "formTrackingNumber": "RR-DERBY-2025-00451",
      "status": "NEW",
      "certificationAuthority": "EASA",
      "approvalDate": "2025-10-01",
      "expiryDate": "2030-10-01",
      "qualityStandards": ["AS9100D", "ISO9001:2015"]
    },
    "sustainabilityNode": {
      "pcfValue": 45.2,
      "pcfUnit": "kgCO2e",
      "scope": "Cradle-to-Gate",
      "recyclableContent": 15,
      "recyclableContentUnit": "%",
      "materialComposition": [
        { "material": "Nickel Superalloy", "percentage": 85 },
        { "material": "Thermal Barrier Coating", "percentage": 10 },
        { "material": "Other", "percentage": 5 }
      ],
      "energyConsumption": {
        "value": 1250,
        "unit": "kWh"
      }
    },
    "operationalNode": {
      "timeSinceNew": 0,
      "cyclesSinceNew": 0,
      "timeSinceOverhaul": 0,
      "cyclesSinceOverhaul": 0,
      "maximumOperatingHours": 25000,
      "maximumCycles": 15000,
      "maintenanceSchedule": "Per Rolls-Royce CMP"
    },
    "technicalSpecifications": {
      "engineModel": "Trent XWB-97",
      "stage": "HP Turbine Stage 1",
      "weight": {
        "value": 0.85,
        "unit": "kg"
      },
      "dimensions": {
        "length": 120,
        "width": 45,
        "height": 8,
        "unit": "mm"
      },
      "operatingTemperature": {
        "max": 1700,
        "unit": "°C"
      }
    }
  }
};

// Additional DPP parts in the catalog
const additionalParts = [
  {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/aerospace/dpp/v1"
    ],
    "id": "did:web:rolls-royce.com:parts:serial:98766-ABC-456",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:rolls-royce.com",
    "issuanceDate": "2025-10-28T14:30:00Z",
    "credentialSubject": {
      "id": "did:web:rolls-royce.com:parts:serial:98766-ABC-456",
      "partType": "CompressorBlade",
      "sku": "RR-TrentXWB-HPC-Blade-002",
      "identityNode": {
        "manufacturerName": "Rolls-Royce plc",
        "cageCode": "K1039",
        "partNumber": "FW12346",
        "serialNumber": "HPC112233"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "RR-DERBY-2025-00452",
        "status": "NEW"
      },
      "sustainabilityNode": {
        "pcfValue": 32.1,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate"
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0
      }
    }
  },
  {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/aerospace/dpp/v1"
    ],
    "id": "did:web:rolls-royce.com:parts:serial:98767-DEF-789",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:rolls-royce.com",
    "issuanceDate": "2025-10-29T09:15:00Z",
    "credentialSubject": {
      "id": "did:web:rolls-royce.com:parts:serial:98767-DEF-789",
      "partType": "CombustorLiner",
      "sku": "RR-TrentXWB-COMB-001",
      "identityNode": {
        "manufacturerName": "Rolls-Royce plc",
        "cageCode": "K1039",
        "partNumber": "FW12347",
        "serialNumber": "COMB445566"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "RR-DERBY-2025-00453",
        "status": "OVERHAULED"
      },
      "sustainabilityNode": {
        "pcfValue": 78.5,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate"
      },
      "operationalNode": {
        "timeSinceNew": 5000,
        "cyclesSinceNew": 2500,
        "timeSinceOverhaul": 0,
        "cyclesSinceOverhaul": 0
      }
    }
  }
];

// Main DPP endpoint - serves the HPT Blade data
app.get('/api/parts/98765', (req: Request, res: Response) => {
  console.log(`[${new Date().toISOString()}] GET /api/parts/98765 - Serving HPT Blade DPP`);
  res.json(digitalProductPassport);
});

// Additional parts endpoints
app.get('/api/parts/98766', (req: Request, res: Response) => {
  console.log(`[${new Date().toISOString()}] GET /api/parts/98766 - Serving Compressor Blade DPP`);
  res.json(additionalParts[0]);
});

app.get('/api/parts/98767', (req: Request, res: Response) => {
  console.log(`[${new Date().toISOString()}] GET /api/parts/98767 - Serving Combustor Liner DPP`);
  res.json(additionalParts[1]);
});

// List all available DPPs
app.get('/api/parts', (req: Request, res: Response) => {
  console.log(`[${new Date().toISOString()}] GET /api/parts - Listing all DPPs`);
  res.json({
    totalCount: 3,
    parts: [
      {
        id: "98765",
        partType: "HighPressureTurbineBlade",
        serialNumber: "HPT998877",
        status: "NEW"
      },
      {
        id: "98766",
        partType: "CompressorBlade", 
        serialNumber: "HPC112233",
        status: "NEW"
      },
      {
        id: "98767",
        partType: "CombustorLiner",
        serialNumber: "COMB445566",
        status: "OVERHAULED"
      }
    ]
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'aerospace-dpp-backend' });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║     Aerospace Digital Product Passport Backend Service        ║
║                                                               ║
║  Rolls-Royce DPP Mock Server                                  ║
║  Serving Trent XWB Engine Component Data                      ║
║                                                               ║
║  Endpoints:                                                   ║
║    GET /api/parts          - List all DPPs                    ║
║    GET /api/parts/98765    - HPT Blade DPP                    ║
║    GET /api/parts/98766    - Compressor Blade DPP             ║
║    GET /api/parts/98767    - Combustor Liner DPP              ║
║    GET /health             - Health check                     ║
║                                                               ║
║  Server running on port ${PORT}                                 ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});
