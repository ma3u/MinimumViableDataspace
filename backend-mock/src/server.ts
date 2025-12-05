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

// 20 ApexPropulsion Systems Trent XWB Engine Spare Parts
const spareParts: Record<string, any> = {
  // 1. HP Turbine Blade
  "RR001": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR001",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR001",
      "partType": "HighPressureTurbineBlade",
      "sku": "APEX-TXWB-HPT-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "HPT-BLD-001",
        "serialNumber": "SN-HPT-78001",
        "batchNumber": "BATCH-2025-HPT-01",
        "manufacturingDate": "2025-09-15",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-HPT-001",
        "status": "NEW",
        "certificationAuthority": "EASA",
        "qualityStandards": ["AS9100D", "ISO9001:2015"]
      },
      "sustainabilityNode": {
        "pcfValue": 45.2,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate",
        "recyclableContent": 15,
        "materialComposition": [
          { "material": "Nickel Superalloy", "percentage": 85 },
          { "material": "Thermal Barrier Coating", "percentage": 15 }
        ]
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0,
        "maximumOperatingHours": 25000,
        "maximumCycles": 15000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "HP Turbine Stage 1",
        "weight": { "value": 0.85, "unit": "kg" },
        "operatingTemperature": { "max": 1700, "unit": "°C" }
      }
    }
  },
  // 2. HP Compressor Blade
  "RR002": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR002",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-02T11:00:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR002",
      "partType": "HighPressureCompressorBlade",
      "sku": "APEX-TXWB-HPC-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "HPC-BLD-001",
        "serialNumber": "SN-HPC-78002",
        "manufacturingDate": "2025-09-16",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-HPC-001",
        "status": "NEW",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 32.1,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate",
        "materialComposition": [
          { "material": "Titanium Alloy", "percentage": 95 },
          { "material": "Coating", "percentage": 5 }
        ]
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0,
        "maximumOperatingHours": 30000,
        "maximumCycles": 20000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "HP Compressor Stage 6",
        "weight": { "value": 0.45, "unit": "kg" }
      }
    }
  },
  // 3. Combustor Liner
  "RR003": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR003",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-03T09:00:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR003",
      "partType": "CombustorLiner",
      "sku": "APEX-TXWB-CMB-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "CMB-LNR-001",
        "serialNumber": "SN-CMB-78003",
        "manufacturingDate": "2025-08-20",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-CMB-001",
        "status": "OVERHAULED",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 78.5,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate",
        "materialComposition": [
          { "material": "Hastelloy X", "percentage": 90 },
          { "material": "Thermal Coating", "percentage": 10 }
        ]
      },
      "operationalNode": {
        "timeSinceNew": 5000,
        "cyclesSinceNew": 2500,
        "timeSinceOverhaul": 0,
        "cyclesSinceOverhaul": 0,
        "maximumOperatingHours": 20000,
        "maximumCycles": 10000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "Combustor",
        "weight": { "value": 12.5, "unit": "kg" },
        "operatingTemperature": { "max": 2000, "unit": "°C" }
      }
    }
  },
  // 4. Fan Blade
  "RR004": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR004",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-04T08:00:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR004",
      "partType": "FanBlade",
      "sku": "APEX-TXWB-FAN-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "FAN-BLD-001",
        "serialNumber": "SN-FAN-78004",
        "manufacturingDate": "2025-09-01",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-FAN-001",
        "status": "NEW",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 125.0,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate",
        "materialComposition": [
          { "material": "Carbon Fiber Composite", "percentage": 70 },
          { "material": "Titanium Leading Edge", "percentage": 30 }
        ]
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0,
        "maximumOperatingHours": 40000,
        "maximumCycles": 25000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "Fan",
        "weight": { "value": 22.0, "unit": "kg" },
        "dimensions": { "length": 1500, "unit": "mm" }
      }
    }
  },
  // 5. LP Turbine Blade
  "RR005": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR005",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-05T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR005",
      "partType": "LowPressureTurbineBlade",
      "sku": "APEX-TXWB-LPT-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "LPT-BLD-001",
        "serialNumber": "SN-LPT-78005",
        "manufacturingDate": "2025-09-10",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-LPT-001",
        "status": "NEW",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 28.3,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate"
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0,
        "maximumOperatingHours": 35000,
        "maximumCycles": 22000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "LP Turbine Stage 3",
        "weight": { "value": 1.2, "unit": "kg" }
      }
    }
  },
  // 6. HP Turbine Disk
  "RR006": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR006",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-06T11:00:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR006",
      "partType": "HighPressureTurbineDisk",
      "sku": "APEX-TXWB-HPTD-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "HPT-DSK-001",
        "serialNumber": "SN-HPTD-78006",
        "manufacturingDate": "2025-08-15",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-HPTD-001",
        "status": "NEW",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 350.0,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate",
        "materialComposition": [
          { "material": "Nickel Superalloy", "percentage": 100 }
        ]
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0,
        "maximumOperatingHours": 20000,
        "maximumCycles": 12000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "HP Turbine",
        "weight": { "value": 85.0, "unit": "kg" }
      }
    }
  },
  // 7. Fuel Nozzle
  "RR007": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR007",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-07T09:30:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR007",
      "partType": "FuelNozzle",
      "sku": "APEX-TXWB-FN-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "FN-001",
        "serialNumber": "SN-FN-78007",
        "manufacturingDate": "2025-09-05",
        "manufacturingLocation": "Indianapolis, USA"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-FN-001",
        "status": "NEW",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 18.5,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate"
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0,
        "maximumOperatingHours": 15000,
        "maximumCycles": 10000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "Combustor",
        "weight": { "value": 2.5, "unit": "kg" }
      }
    }
  },
  // 8. Bearing Assembly
  "RR008": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR008",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-08T14:00:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR008",
      "partType": "MainShaftBearing",
      "sku": "APEX-TXWB-BRG-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "BRG-MSB-001",
        "serialNumber": "SN-BRG-78008",
        "manufacturingDate": "2025-09-12",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-BRG-001",
        "status": "SERVICEABLE",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 55.0,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate"
      },
      "operationalNode": {
        "timeSinceNew": 2500,
        "cyclesSinceNew": 1200,
        "maximumOperatingHours": 25000,
        "maximumCycles": 15000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "Main Shaft",
        "weight": { "value": 8.0, "unit": "kg" }
      }
    }
  },
  // 9. Nozzle Guide Vane
  "RR009": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR009",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-09T10:30:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR009",
      "partType": "NozzleGuideVane",
      "sku": "APEX-TXWB-NGV-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "NGV-001",
        "serialNumber": "SN-NGV-78009",
        "manufacturingDate": "2025-09-18",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-NGV-001",
        "status": "NEW",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 42.0,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate"
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0,
        "maximumOperatingHours": 22000,
        "maximumCycles": 14000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "HP Turbine",
        "weight": { "value": 3.5, "unit": "kg" },
        "operatingTemperature": { "max": 1650, "unit": "°C" }
      }
    }
  },
  // 10. Compressor Stator Vane
  "RR010": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR010",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-10T11:00:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR010",
      "partType": "CompressorStatorVane",
      "sku": "APEX-TXWB-CSV-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "CSV-001",
        "serialNumber": "SN-CSV-78010",
        "manufacturingDate": "2025-09-20",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-CSV-001",
        "status": "NEW",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 15.0,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate"
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0,
        "maximumOperatingHours": 35000,
        "maximumCycles": 22000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "HP Compressor",
        "weight": { "value": 0.8, "unit": "kg" }
      }
    }
  },
  // 11. Oil Pump
  "RR011": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR011",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-11T09:00:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR011",
      "partType": "OilPump",
      "sku": "APEX-TXWB-OLP-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "OLP-001",
        "serialNumber": "SN-OLP-78011",
        "manufacturingDate": "2025-09-22",
        "manufacturingLocation": "Bristol, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-OLP-001",
        "status": "NEW",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 22.0,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate"
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0,
        "maximumOperatingHours": 30000,
        "maximumCycles": 18000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "Accessory Gearbox",
        "weight": { "value": 5.5, "unit": "kg" }
      }
    }
  },
  // 12. Starter Generator
  "RR012": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR012",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-12T13:00:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR012",
      "partType": "StarterGenerator",
      "sku": "APEX-TXWB-SG-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "SG-001",
        "serialNumber": "SN-SG-78012",
        "manufacturingDate": "2025-09-25",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-SG-001",
        "status": "OVERHAULED",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 85.0,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate"
      },
      "operationalNode": {
        "timeSinceNew": 8000,
        "cyclesSinceNew": 4000,
        "timeSinceOverhaul": 0,
        "cyclesSinceOverhaul": 0,
        "maximumOperatingHours": 20000,
        "maximumCycles": 12000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "Accessory",
        "weight": { "value": 25.0, "unit": "kg" }
      }
    }
  },
  // 13. Thrust Reverser Actuator
  "RR013": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR013",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-13T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR013",
      "partType": "ThrustReverserActuator",
      "sku": "APEX-TXWB-TRA-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "TRA-001",
        "serialNumber": "SN-TRA-78013",
        "manufacturingDate": "2025-09-28",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-TRA-001",
        "status": "NEW",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 45.0,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate"
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0,
        "maximumOperatingHours": 25000,
        "maximumCycles": 15000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "Thrust Reverser",
        "weight": { "value": 12.0, "unit": "kg" }
      }
    }
  },
  // 14. FADEC Controller
  "RR014": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR014",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-14T11:30:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR014",
      "partType": "FADECController",
      "sku": "APEX-TXWB-FADEC-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "FADEC-001",
        "serialNumber": "SN-FADEC-78014",
        "manufacturingDate": "2025-09-30",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-FADEC-001",
        "status": "NEW",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 35.0,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate"
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0,
        "maximumOperatingHours": 40000,
        "maximumCycles": 25000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "Control System",
        "weight": { "value": 8.5, "unit": "kg" }
      }
    }
  },
  // 15. Exhaust Mixer
  "RR015": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR015",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-15T09:00:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR015",
      "partType": "ExhaustMixer",
      "sku": "APEX-TXWB-EXM-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "EXM-001",
        "serialNumber": "SN-EXM-78015",
        "manufacturingDate": "2025-10-01",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-EXM-001",
        "status": "NEW",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 180.0,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate"
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0,
        "maximumOperatingHours": 30000,
        "maximumCycles": 18000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "Exhaust",
        "weight": { "value": 45.0, "unit": "kg" }
      }
    }
  },
  // 16. Intermediate Pressure Compressor Disk
  "RR016": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR016",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-16T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR016",
      "partType": "IPCompressorDisk",
      "sku": "APEX-TXWB-IPCD-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "IPCD-001",
        "serialNumber": "SN-IPCD-78016",
        "manufacturingDate": "2025-10-02",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-IPCD-001",
        "status": "NEW",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 220.0,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate"
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0,
        "maximumOperatingHours": 25000,
        "maximumCycles": 15000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "IP Compressor",
        "weight": { "value": 55.0, "unit": "kg" }
      }
    }
  },
  // 17. Gearbox Assembly
  "RR017": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR017",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-17T14:00:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR017",
      "partType": "AccessoryGearbox",
      "sku": "APEX-TXWB-AGB-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "AGB-001",
        "serialNumber": "SN-AGB-78017",
        "manufacturingDate": "2025-10-03",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-AGB-001",
        "status": "SERVICEABLE",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 150.0,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate"
      },
      "operationalNode": {
        "timeSinceNew": 3500,
        "cyclesSinceNew": 1800,
        "maximumOperatingHours": 30000,
        "maximumCycles": 18000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "Accessory",
        "weight": { "value": 35.0, "unit": "kg" }
      }
    }
  },
  // 18. Turbine Shroud Segment
  "RR018": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR018",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-18T11:00:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR018",
      "partType": "TurbineShroudSegment",
      "sku": "APEX-TXWB-TSS-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "TSS-001",
        "serialNumber": "SN-TSS-78018",
        "manufacturingDate": "2025-10-04",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-TSS-001",
        "status": "NEW",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 28.0,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate"
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0,
        "maximumOperatingHours": 18000,
        "maximumCycles": 10000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "HP Turbine",
        "weight": { "value": 2.2, "unit": "kg" },
        "operatingTemperature": { "max": 1600, "unit": "°C" }
      }
    }
  },
  // 19. Bleed Valve
  "RR019": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR019",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-19T09:30:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR019",
      "partType": "CompressorBleedValve",
      "sku": "APEX-TXWB-CBV-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "CBV-001",
        "serialNumber": "SN-CBV-78019",
        "manufacturingDate": "2025-10-05",
        "manufacturingLocation": "Bristol, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-CBV-001",
        "status": "NEW",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 12.0,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate"
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0,
        "maximumOperatingHours": 35000,
        "maximumCycles": 20000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "HP Compressor",
        "weight": { "value": 3.8, "unit": "kg" }
      }
    }
  },
  // 20. Fan Case
  "RR020": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/aerospace/dpp/v1"],
    "id": "did:web:apexpropulsion.com:parts:RR020",
    "type": ["VerifiableCredential", "AerospacePartPassport"],
    "issuer": "did:web:apexpropulsion.com",
    "issuanceDate": "2025-10-20T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:apexpropulsion.com:parts:RR020",
      "partType": "FanContainmentCase",
      "sku": "APEX-TXWB-FCC-001",
      "identityNode": {
        "manufacturerName": "ApexPropulsion Systems",
        "cageCode": "K1039",
        "partNumber": "FCC-001",
        "serialNumber": "SN-FCC-78020",
        "manufacturingDate": "2025-10-06",
        "manufacturingLocation": "Derby, United Kingdom"
      },
      "airworthinessNode": {
        "formType": "EASA_FORM_1",
        "formTrackingNumber": "APEX-2025-FCC-001",
        "status": "NEW",
        "certificationAuthority": "EASA"
      },
      "sustainabilityNode": {
        "pcfValue": 850.0,
        "pcfUnit": "kgCO2e",
        "scope": "Cradle-to-Gate",
        "materialComposition": [
          { "material": "Carbon Fiber Composite", "percentage": 60 },
          { "material": "Kevlar", "percentage": 30 },
          { "material": "Aluminum", "percentage": 10 }
        ]
      },
      "operationalNode": {
        "timeSinceNew": 0,
        "cyclesSinceNew": 0,
        "maximumOperatingHours": 60000,
        "maximumCycles": 40000
      },
      "technicalSpecifications": {
        "engineModel": "Trent XWB-97",
        "stage": "Fan",
        "weight": { "value": 320.0, "unit": "kg" },
        "dimensions": { "diameter": 3000, "unit": "mm" }
      }
    }
  }
};

// Part catalog summary
const partsCatalog = Object.entries(spareParts).map(([id, part]) => ({
  id,
  partType: part.credentialSubject.partType,
  serialNumber: part.credentialSubject.identityNode.serialNumber,
  partNumber: part.credentialSubject.identityNode.partNumber,
  status: part.credentialSubject.airworthinessNode.status,
  pcfValue: part.credentialSubject.sustainabilityNode.pcfValue,
  sku: part.credentialSubject.sku
}));

// Dynamic endpoint for any part
app.get('/api/parts/:id', (req: Request, res: Response) => {
  const partId = req.params.id;
  const part = spareParts[partId];
  
  if (part) {
    console.log(`[${new Date().toISOString()}] GET /api/parts/${partId} - Serving ${part.credentialSubject.partType} DPP`);
    res.json(part);
  } else {
    res.status(404).json({ error: 'Part not found', partId });
  }
});

// List all available DPPs
app.get('/api/parts', (req: Request, res: Response) => {
  console.log(`[${new Date().toISOString()}] GET /api/parts - Listing all ${partsCatalog.length} DPPs`);
  res.json({
    totalCount: partsCatalog.length,
    parts: partsCatalog
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'aerospace-dpp-backend', partsCount: partsCatalog.length });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║     Aerospace Digital Product Passport Backend Service             ║
║                                                                    ║
║  ApexPropulsion Systems Trent XWB Engine - DPP Mock Server                    ║
║  Serving ${partsCatalog.length} spare parts with full DPP data                       ║
║                                                                    ║
║  Endpoints:                                                        ║
║    GET /api/parts           - List all ${partsCatalog.length} DPPs                       ║
║    GET /api/parts/:id       - Get specific DPP (RR001-RR020)       ║
║    GET /health              - Health check                         ║
║                                                                    ║
║  Server running on port ${PORT}                                      ║
╚════════════════════════════════════════════════════════════════════╝
  `);
});
