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
## Seeds 20 ApexPropulsion Systems Trent XWB engine spare parts

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║     Aerospace Digital Product Passport - Data Seeding              ║"
echo "║                                                                    ║"
echo "║  Seeding 20 ApexPropulsion Systems Trent XWB Spare Parts                      ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Provider QNA endpoint (where we'll seed the aerospace assets)
PROVIDER_HOST="http://127.0.0.1:8191"
# Backend mock service URL (inside docker network or localhost)
BACKEND_URL="${DPP_BACKEND_URL:-http://host.docker.internal:3001}"

echo "Provider Host: $PROVIDER_HOST"
echo "DPP Backend URL: $BACKEND_URL"
echo ""

# Function to create an asset
create_asset() {
    local ID=$1
    local NAME=$2
    local DESC=$3
    local PART_TYPE=$4
    local SERIAL=$5
    local STATUS=${6:-NEW}
    
    echo "Creating Asset: $NAME ($ID)..."
    curl -s --location "$PROVIDER_HOST/api/management/v3/assets" \
    --header 'Content-Type: application/json' \
    --data '{
        "@context": [
            "https://w3id.org/edc/connector/management/v0.0.1"
        ],
        "@id": "'"$ID"'",
        "@type": "Asset",
        "properties": {
            "name": "'"$NAME"'",
            "description": "'"$DESC"'",
            "contenttype": "application/ld+json",
            "dct:type": "ids:DigitalProductPassport",
            "version": "1.0",
            "aerospace:partType": "'"$PART_TYPE"'",
            "aerospace:manufacturer": "ApexPropulsion Systems",
            "aerospace:serialNumber": "'"$SERIAL"'",
            "aerospace:status": "'"$STATUS"'"
        },
        "dataAddress": {
            "@type": "DataAddress",
            "type": "HttpData",
            "baseUrl": "'"$BACKEND_URL"'/api/parts/'"${ID##*:}"'",
            "proxyPath": "false",
            "proxyQueryParams": "false"
        }
    }' > /dev/null && echo "  ✓ Created"
}

echo "Creating 20 Trent XWB Spare Part Assets..."
echo ""

# 1. HP Turbine Blade
create_asset "asset:dpp:RR001" \
    "HP Turbine Blade DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB High-Pressure Turbine Blade" \
    "HighPressureTurbineBlade" \
    "SN-HPT-78001" \
    "NEW"

# 2. HP Compressor Blade
create_asset "asset:dpp:RR002" \
    "HP Compressor Blade DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB High-Pressure Compressor Blade" \
    "HighPressureCompressorBlade" \
    "SN-HPC-78002" \
    "NEW"

# 3. Combustor Liner
create_asset "asset:dpp:RR003" \
    "Combustor Liner DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB Combustor Liner" \
    "CombustorLiner" \
    "SN-CMB-78003" \
    "OVERHAULED"

# 4. Fan Blade
create_asset "asset:dpp:RR004" \
    "Fan Blade DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB Carbon Fiber Fan Blade" \
    "FanBlade" \
    "SN-FAN-78004" \
    "NEW"

# 5. LP Turbine Blade
create_asset "asset:dpp:RR005" \
    "LP Turbine Blade DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB Low-Pressure Turbine Blade" \
    "LowPressureTurbineBlade" \
    "SN-LPT-78005" \
    "NEW"

# 6. HP Turbine Disk
create_asset "asset:dpp:RR006" \
    "HP Turbine Disk DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB High-Pressure Turbine Disk" \
    "HighPressureTurbineDisk" \
    "SN-HPTD-78006" \
    "NEW"

# 7. Fuel Nozzle
create_asset "asset:dpp:RR007" \
    "Fuel Nozzle DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB Fuel Nozzle" \
    "FuelNozzle" \
    "SN-FN-78007" \
    "NEW"

# 8. Main Shaft Bearing
create_asset "asset:dpp:RR008" \
    "Main Shaft Bearing DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB Main Shaft Bearing Assembly" \
    "MainShaftBearing" \
    "SN-BRG-78008" \
    "SERVICEABLE"

# 9. Nozzle Guide Vane
create_asset "asset:dpp:RR009" \
    "Nozzle Guide Vane DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB HP Turbine Nozzle Guide Vane" \
    "NozzleGuideVane" \
    "SN-NGV-78009" \
    "NEW"

# 10. Compressor Stator Vane
create_asset "asset:dpp:RR010" \
    "Compressor Stator Vane DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB HP Compressor Stator Vane" \
    "CompressorStatorVane" \
    "SN-CSV-78010" \
    "NEW"

# 11. Oil Pump
create_asset "asset:dpp:RR011" \
    "Oil Pump DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB Oil Pump Assembly" \
    "OilPump" \
    "SN-OLP-78011" \
    "NEW"

# 12. Starter Generator
create_asset "asset:dpp:RR012" \
    "Starter Generator DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB Starter Generator" \
    "StarterGenerator" \
    "SN-SG-78012" \
    "OVERHAULED"

# 13. Thrust Reverser Actuator
create_asset "asset:dpp:RR013" \
    "Thrust Reverser Actuator DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB Thrust Reverser Actuator" \
    "ThrustReverserActuator" \
    "SN-TRA-78013" \
    "NEW"

# 14. FADEC Controller
create_asset "asset:dpp:RR014" \
    "FADEC Controller DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB Full Authority Digital Engine Control" \
    "FADECController" \
    "SN-FADEC-78014" \
    "NEW"

# 15. Exhaust Mixer
create_asset "asset:dpp:RR015" \
    "Exhaust Mixer DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB Exhaust Mixer" \
    "ExhaustMixer" \
    "SN-EXM-78015" \
    "NEW"

# 16. IP Compressor Disk
create_asset "asset:dpp:RR016" \
    "IP Compressor Disk DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB Intermediate Pressure Compressor Disk" \
    "IPCompressorDisk" \
    "SN-IPCD-78016" \
    "NEW"

# 17. Accessory Gearbox
create_asset "asset:dpp:RR017" \
    "Accessory Gearbox DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB Accessory Gearbox Assembly" \
    "AccessoryGearbox" \
    "SN-AGB-78017" \
    "SERVICEABLE"

# 18. Turbine Shroud Segment
create_asset "asset:dpp:RR018" \
    "Turbine Shroud Segment DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB HP Turbine Shroud Segment" \
    "TurbineShroudSegment" \
    "SN-TSS-78018" \
    "NEW"

# 19. Compressor Bleed Valve
create_asset "asset:dpp:RR019" \
    "Compressor Bleed Valve DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB HP Compressor Bleed Valve" \
    "CompressorBleedValve" \
    "SN-CBV-78019" \
    "NEW"

# 20. Fan Containment Case
create_asset "asset:dpp:RR020" \
    "Fan Containment Case DPP" \
    "Digital Product Passport for ApexPropulsion Systems Trent XWB Fan Containment Case" \
    "FanContainmentCase" \
    "SN-FCC-78020" \
    "NEW"

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

# Create Contract Definition for all DPP assets (using wildcard pattern)
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
            "asset:dpp:RR001",
            "asset:dpp:RR002",
            "asset:dpp:RR003",
            "asset:dpp:RR004",
            "asset:dpp:RR005",
            "asset:dpp:RR006",
            "asset:dpp:RR007",
            "asset:dpp:RR008",
            "asset:dpp:RR009",
            "asset:dpp:RR010",
            "asset:dpp:RR011",
            "asset:dpp:RR012",
            "asset:dpp:RR013",
            "asset:dpp:RR014",
            "asset:dpp:RR015",
            "asset:dpp:RR016",
            "asset:dpp:RR017",
            "asset:dpp:RR018",
            "asset:dpp:RR019",
            "asset:dpp:RR020"
        ]
    }
}' > /dev/null && echo "  ✓ Contract definition created"

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                      Seeding Complete!                             ║"
echo "║                                                                    ║"
echo "║  Assets Created: 20 Trent XWB Spare Parts                          ║"
echo "║    RR001: HP Turbine Blade        RR011: Oil Pump                  ║"
echo "║    RR002: HP Compressor Blade     RR012: Starter Generator         ║"
echo "║    RR003: Combustor Liner         RR013: Thrust Reverser Actuator  ║"
echo "║    RR004: Fan Blade               RR014: FADEC Controller          ║"
echo "║    RR005: LP Turbine Blade        RR015: Exhaust Mixer             ║"
echo "║    RR006: HP Turbine Disk         RR016: IP Compressor Disk        ║"
echo "║    RR007: Fuel Nozzle             RR017: Accessory Gearbox         ║"
echo "║    RR008: Main Shaft Bearing      RR018: Turbine Shroud Segment    ║"
echo "║    RR009: Nozzle Guide Vane       RR019: Compressor Bleed Valve    ║"
echo "║    RR010: Compressor Stator Vane  RR020: Fan Containment Case      ║"
echo "║                                                                    ║"
echo "║  Policies Created:                                                 ║"
echo "║    - aerospace-membership-required                                 ║"
echo "║    - aerospace-dpp-access                                          ║"
echo "║                                                                    ║"
echo "║  Contract Definitions Created:                                     ║"
echo "║    - aerospace-dpp-contract (covers all 20 assets)                 ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
