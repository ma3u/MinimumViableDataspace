#!/bin/bash

#
#  Copyright (c) 2025 Aerospace DPP Demo
#
#  This program and the accompanying materials are made available under the
#  terms of the Apache License, Version 2.0 which is available at
#  https://www.apache.org/licenses/LICENSE-2.0
#
#  SPDX-License-Identifier: Apache-2.0
#

## This script seeds the Aerospace Digital Product Passport demo data
## Run this AFTER running the standard seed.sh script

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     Aerospace Digital Product Passport - Data Seeding         ║"
echo "║                                                               ║"
echo "║  Seeding Rolls-Royce DPP Assets to Provider                   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Provider QNA endpoint (where we'll seed the aerospace assets)
PROVIDER_HOST="http://127.0.0.1:8191"
# Backend mock service URL (inside docker network or localhost)
BACKEND_URL="${DPP_BACKEND_URL:-http://host.docker.internal:3001}"

echo "Provider Host: $PROVIDER_HOST"
echo "DPP Backend URL: $BACKEND_URL"
echo ""

# Create the HPT Blade DPP Asset
echo "Creating Asset: Trent XWB HPT Blade (asset:propulsion:blade:98765)..."
curl -s --location "$PROVIDER_HOST/api/management/v3/assets" \
--header 'Content-Type: application/json' \
--data '{
    "@context": [
        "https://w3id.org/edc/connector/management/v0.0.1"
    ],
    "@id": "asset:propulsion:blade:98765",
    "@type": "Asset",
    "properties": {
        "name": "Trent XWB HPT Blade - Digital Product Passport",
        "description": "Digital Product Passport for Rolls-Royce Trent XWB High-Pressure Turbine Blade SN:HPT998877",
        "contenttype": "application/ld+json",
        "dct:type": "ids:DigitalProductPassport",
        "version": "1.0",
        "aerospace:partType": "HighPressureTurbineBlade",
        "aerospace:manufacturer": "Rolls-Royce plc",
        "aerospace:serialNumber": "HPT998877"
    },
    "dataAddress": {
        "@type": "DataAddress",
        "type": "HttpData",
        "baseUrl": "'"$BACKEND_URL"'/api/parts/98765",
        "proxyPath": "false",
        "proxyQueryParams": "false"
    }
}' > /dev/null && echo "  ✓ HPT Blade asset created"

# Create the Compressor Blade DPP Asset
echo "Creating Asset: Compressor Blade (asset:propulsion:blade:98766)..."
curl -s --location "$PROVIDER_HOST/api/management/v3/assets" \
--header 'Content-Type: application/json' \
--data '{
    "@context": [
        "https://w3id.org/edc/connector/management/v0.0.1"
    ],
    "@id": "asset:propulsion:blade:98766",
    "@type": "Asset",
    "properties": {
        "name": "Trent XWB Compressor Blade - Digital Product Passport",
        "description": "Digital Product Passport for Rolls-Royce Trent XWB High-Pressure Compressor Blade SN:HPC112233",
        "contenttype": "application/ld+json",
        "dct:type": "ids:DigitalProductPassport",
        "version": "1.0",
        "aerospace:partType": "CompressorBlade",
        "aerospace:manufacturer": "Rolls-Royce plc",
        "aerospace:serialNumber": "HPC112233"
    },
    "dataAddress": {
        "@type": "DataAddress",
        "type": "HttpData",
        "baseUrl": "'"$BACKEND_URL"'/api/parts/98766",
        "proxyPath": "false",
        "proxyQueryParams": "false"
    }
}' > /dev/null && echo "  ✓ Compressor Blade asset created"

# Create the Combustor Liner DPP Asset
echo "Creating Asset: Combustor Liner (asset:propulsion:combustor:98767)..."
curl -s --location "$PROVIDER_HOST/api/management/v3/assets" \
--header 'Content-Type: application/json' \
--data '{
    "@context": [
        "https://w3id.org/edc/connector/management/v0.0.1"
    ],
    "@id": "asset:propulsion:combustor:98767",
    "@type": "Asset",
    "properties": {
        "name": "Trent XWB Combustor Liner - Digital Product Passport",
        "description": "Digital Product Passport for Rolls-Royce Trent XWB Combustor Liner SN:COMB445566 (Overhauled)",
        "contenttype": "application/ld+json",
        "dct:type": "ids:DigitalProductPassport",
        "version": "1.0",
        "aerospace:partType": "CombustorLiner",
        "aerospace:manufacturer": "Rolls-Royce plc",
        "aerospace:serialNumber": "COMB445566",
        "aerospace:status": "OVERHAULED"
    },
    "dataAddress": {
        "@type": "DataAddress",
        "type": "HttpData",
        "baseUrl": "'"$BACKEND_URL"'/api/parts/98767",
        "proxyPath": "false",
        "proxyQueryParams": "false"
    }
}' > /dev/null && echo "  ✓ Combustor Liner asset created"

echo ""
echo "Creating Aerospace-specific Policies..."

# Create Aerospace Membership Policy (requires membership credential)
echo "Creating Policy: aerospace-membership-required..."
curl -s --location "$PROVIDER_HOST/api/management/v3/policydefinitions" \
--header 'Content-Type: application/json' \
--data '{
    "@context": [
        "https://w3id.org/edc/connector/management/v0.0.1"
    ],
    "@type": "PolicyDefinition",
    "@id": "aerospace-membership-required",
    "policy": {
        "@type": "Set",
        "permission": [
            {
                "action": "use",
                "constraint": {
                    "leftOperand": "MembershipCredential",
                    "operator": "eq",
                    "rightOperand": "active"
                }
            }
        ]
    }
}' > /dev/null && echo "  ✓ Membership policy created"

# Create Aerospace Data Processing Policy (requires data processor credential)
echo "Creating Policy: aerospace-dpp-access..."
curl -s --location "$PROVIDER_HOST/api/management/v3/policydefinitions" \
--header 'Content-Type: application/json' \
--data '{
    "@context": [
        "https://w3id.org/edc/connector/management/v0.0.1"
    ],
    "@type": "PolicyDefinition",
    "@id": "aerospace-dpp-access",
    "policy": {
        "@type": "Set",
        "obligation": [
            {
                "action": "use",
                "constraint": {
                    "leftOperand": "DataAccess.level",
                    "operator": "eq",
                    "rightOperand": "processing"
                }
            }
        ]
    }
}' > /dev/null && echo "  ✓ DPP access policy created"

echo ""
echo "Creating Contract Definitions..."

# Create Contract Definition for DPP assets
echo "Creating Contract Definition: aerospace-dpp-contract..."
curl -s --location "$PROVIDER_HOST/api/management/v3/contractdefinitions" \
--header 'Content-Type: application/json' \
--data '{
    "@context": [
        "https://w3id.org/edc/connector/management/v0.0.1"
    ],
    "@id": "aerospace-dpp-contract",
    "@type": "ContractDefinition",
    "accessPolicyId": "aerospace-membership-required",
    "contractPolicyId": "aerospace-dpp-access",
    "assetsSelector": {
        "@type": "Criterion",
        "operandLeft": "https://w3id.org/edc/v0.0.1/ns/id",
        "operator": "in",
        "operandRight": [
            "asset:propulsion:blade:98765",
            "asset:propulsion:blade:98766",
            "asset:propulsion:combustor:98767"
        ]
    }
}' > /dev/null && echo "  ✓ Contract definition created"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    Seeding Complete!                          ║"
echo "║                                                               ║"
echo "║  Assets Created:                                              ║"
echo "║    - asset:propulsion:blade:98765 (HPT Blade)                 ║"
echo "║    - asset:propulsion:blade:98766 (Compressor Blade)          ║"
echo "║    - asset:propulsion:combustor:98767 (Combustor Liner)       ║"
echo "║                                                               ║"
echo "║  Policies Created:                                            ║"
echo "║    - aerospace-membership-required                            ║"
echo "║    - aerospace-dpp-access                                     ║"
echo "║                                                               ║"
echo "║  Contract Definitions Created:                                ║"
echo "║    - aerospace-dpp-contract                                   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
