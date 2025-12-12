#!/bin/bash

#
#  Copyright (c) 2025 Health Dataspace Demo
#
#  This program and the accompanying materials are made available under the
#  terms of the Apache License, Version 2.0 which is available at
#  https://www.apache.org/licenses/LICENSE-2.0
#
#  SPDX-License-Identifier: Apache-2.0
#

## This script seeds the EHR2EDC Health Dataspace demo data
## Run this AFTER running the standard seed.sh script
## Seeds 20 Rheinland Universitätsklinikum anonymized EHR records

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║     EHR2EDC Health Dataspace - Data Seeding                        ║"
echo "║                                                                    ║"
echo "║  Provider: Rheinland Universitätsklinikum (Hospital)               ║"
echo "║  Consumer: Nordstein Research Institute (CRO)                      ║"
echo "║                                                                    ║"
echo "║  Seeding 20 Anonymized Electronic Health Records                   ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Provider QNA endpoint (where we'll seed the health assets)
PROVIDER_HOST="http://127.0.0.1:8191"
# Backend mock service URL (inside docker network or localhost)
BACKEND_URL="${EHR_BACKEND_URL:-http://host.docker.internal:3001}"

echo "Provider Host: $PROVIDER_HOST"
echo "EHR Backend URL: $BACKEND_URL"
echo ""

# Function to create a health record asset
create_ehr_asset() {
    local ID=$1
    local NAME=$2
    local DESC=$3
    local ICD_CODE=$4
    local DIAGNOSIS=$5
    local AGE_BAND=$6
    local SEX=$7
    local CONSENT_PURPOSES=$8
    local MEDDRA_VERSION=$9
    local STUDY_PHASE=${10}
    local EU_CT_NUMBER=${11}
    local SPONSOR_NAME=${12}
    local SPONSOR_TYPE=${13}
    local THERAPEUTIC_AREA=${14}
    local MEMBER_STATES=${15}
    
    echo "Creating EHR Asset: $NAME ($ID)..."
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
            "dct:type": "ehds:ElectronicHealthRecord",
            "version": "1.0",
            "health:icdCode": "'"$ICD_CODE"'",
            "health:diagnosis": "'"$DIAGNOSIS"'",
            "health:ageBand": "'"$AGE_BAND"'",
            "health:biologicalSex": "'"$SEX"'",
            "health:consentPurposes": "'"$CONSENT_PURPOSES"'",
            "health:meddraVersion": "'"$MEDDRA_VERSION"'",
            "health:studyPhase": "'"$STUDY_PHASE"'",
            "health:euCtNumber": "'"$EU_CT_NUMBER"'",
            "health:sponsorName": "'"$SPONSOR_NAME"'",
            "health:sponsorType": "'"$SPONSOR_TYPE"'",
            "health:therapeuticArea": "'"$THERAPEUTIC_AREA"'",
            "health:memberStatesConcerned": "'"$MEMBER_STATES"'",
            "health:deIdentificationMethod": "k-anonymity-k5",
            "health:jurisdiction": "DE-NW",
            "health:provider": "Rheinland Universitätsklinikum"
        },
        "dataAddress": {
            "@type": "DataAddress",
            "type": "HttpData",
            "baseUrl": "'"$BACKEND_URL"'/api/ehr/'"${ID##*:}"'",
            "proxyPath": "false",
            "proxyQueryParams": "false"
        }
    }' > /dev/null && echo "  ✓ Created"
}

# Create consent-based access policy
echo "Creating Health Research Access Policy..."
curl -s --location "$PROVIDER_HOST/api/management/v3/policydefinitions" \
--header 'Content-Type: application/json' \
--data '{
    "@context": [
        "https://w3id.org/edc/connector/management/v0.0.1",
        "http://www.w3.org/ns/odrl.jsonld"
    ],
    "@id": "health-research-access-policy",
    "@type": "PolicyDefinition",
    "policy": {
        "@type": "Set",
        "permission": [{
            "action": "use",
            "constraint": {
                "leftOperand": "MembershipCredential",
                "operator": "eq",
                "rightOperand": "active"
            }
        }]
    }
}' > /dev/null && echo "  ✓ Health Research Access Policy created"

# Create consent-required contract policy
echo "Creating Consent-Required Contract Policy..."
curl -s --location "$PROVIDER_HOST/api/management/v3/policydefinitions" \
--header 'Content-Type: application/json' \
--data '{
    "@context": [
        "https://w3id.org/edc/connector/management/v0.0.1",
        "http://www.w3.org/ns/odrl.jsonld"
    ],
    "@id": "health-consent-contract-policy",
    "@type": "PolicyDefinition",
    "policy": {
        "@type": "Set",
        "obligation": [{
            "action": "use",
            "constraint": {
                "leftOperand": "DataAccess.level",
                "operator": "eq",
                "rightOperand": "processing"
            }
        }],
        "prohibition": [{
            "action": "use",
            "constraint": {
                "leftOperand": "DataAccess.reidentification",
                "operator": "eq",
                "rightOperand": "true"
            }
        }]
    }
}' > /dev/null && echo "  ✓ Consent-Required Contract Policy created"

# Create sensitive data policy (for mental health, HIV records)
echo "Creating Sensitive Data Contract Policy..."
curl -s --location "$PROVIDER_HOST/api/management/v3/policydefinitions" \
--header 'Content-Type: application/json' \
--data '{
    "@context": [
        "https://w3id.org/edc/connector/management/v0.0.1",
        "http://www.w3.org/ns/odrl.jsonld"
    ],
    "@id": "health-sensitive-contract-policy",
    "@type": "PolicyDefinition",
    "policy": {
        "@type": "Set",
        "obligation": [{
            "action": "use",
            "constraint": {
                "leftOperand": "DataAccess.level",
                "operator": "eq",
                "rightOperand": "sensitive"
            }
        }],
        "prohibition": [{
            "action": "use",
            "constraint": {
                "leftOperand": "DataAccess.reidentification",
                "operator": "eq",
                "rightOperand": "true"
            }
        }]
    }
}' > /dev/null && echo "  ✓ Sensitive Data Contract Policy created"

echo ""
echo "Creating 20 Anonymized EHR Assets..."
echo ""

# 1. Diabetes Type 2
create_ehr_asset "asset:ehr:EHR001" \
    "EHR - Type 2 Diabetes with CV Risk" \
    "Anonymized EHR: Type 2 diabetes mellitus with cardiovascular comorbidities" \
    "E11.9" \
    "Type 2 diabetes mellitus" \
    "55-64" \
    "male" \
    "clinical-research,registry-participation" \
    "27.0" \
    "Phase III" \
    "2024-501234-12-DE" \
    "NordPharma AG" \
    "commercial" \
    "Endocrinology/Diabetology" \
    "DE,FR,NL,ES"

# 2. Heart Failure
create_ehr_asset "asset:ehr:EHR002" \
    "EHR - Chronic Heart Failure" \
    "Anonymized EHR: Heart failure with reduced ejection fraction" \
    "I50.9" \
    "Heart failure" \
    "65-74" \
    "female" \
    "clinical-research" \
    "27.0" \
    "Phase IV" \
    "2023-487652-41-DE" \
    "Rhenus Therapeutics GmbH" \
    "commercial" \
    "Cardiovascular" \
    "DE,AT,NL"

# 3. Breast Cancer
create_ehr_asset "asset:ehr:EHR003" \
    "EHR - Breast Cancer Survivor" \
    "Anonymized EHR: Breast cancer in remission post-treatment" \
    "C50.9" \
    "Malignant neoplasm of breast" \
    "45-54" \
    "female" \
    "clinical-research,cancer-registry" \
    "27.0" \
    "Phase II" \
    "2024-512876-23-DE" \
    "DKFZ Heidelberg" \
    "academic" \
    "Antineoplastic and Immunomodulating Agents" \
    "DE"

# 4. COPD
create_ehr_asset "asset:ehr:EHR004" \
    "EHR - COPD with Exacerbations" \
    "Anonymized EHR: Chronic obstructive pulmonary disease" \
    "J44.1" \
    "COPD with acute exacerbation" \
    "65-74" \
    "male" \
    "clinical-research" \
    "27.0" \
    "Phase III" \
    "2024-503987-18-DE" \
    "BioMedTech Europa SE" \
    "commercial" \
    "Pulmonology" \
    "DE,FR,NL,ES"

# 5. Rheumatoid Arthritis
create_ehr_asset "asset:ehr:EHR005" \
    "EHR - Rheumatoid Arthritis" \
    "Anonymized EHR: RA on biologic therapy" \
    "M06.9" \
    "Rheumatoid arthritis" \
    "35-44" \
    "female" \
    "clinical-research,registry-participation" \
    "27.0" \
    "Phase III" \
    "2024-505612-34-DE" \
    "NordPharma AG" \
    "commercial" \
    "Rheumatology" \
    "DE,FR,NL,ES"

# 6. Multiple Sclerosis
create_ehr_asset "asset:ehr:EHR006" \
    "EHR - Multiple Sclerosis (RRMS)" \
    "Anonymized EHR: Relapsing-remitting multiple sclerosis" \
    "G35" \
    "Multiple sclerosis" \
    "25-34" \
    "female" \
    "clinical-research" \
    "27.0" \
    "Phase II" \
    "2024-518234-67-DE" \
    "Charité Forschung GmbH" \
    "academic" \
    "Nervous System" \
    "DE"

# 7. Chronic Kidney Disease
create_ehr_asset "asset:ehr:EHR007" \
    "EHR - CKD Stage 4" \
    "Anonymized EHR: Chronic kidney disease stage 4 with diabetes" \
    "N18.4" \
    "Chronic kidney disease stage 4" \
    "55-64" \
    "male" \
    "clinical-research" \
    "27.0" \
    "Phase IV" \
    "2023-492145-78-DE" \
    "Universitätsklinikum Köln" \
    "academic" \
    "Nephrology" \
    "DE,AT"

# 8. Major Depression (Sensitive)
create_ehr_asset "asset:ehr:EHR008" \
    "EHR - Major Depressive Disorder" \
    "Anonymized EHR: Recurrent MDD (SENSITIVE - Mental Health)" \
    "F33.1" \
    "Major depressive disorder recurrent" \
    "25-34" \
    "male" \
    "clinical-research" \
    "27.0" \
    "Phase II/III" \
    "2024-509876-45-DE" \
    "Charité Forschung GmbH" \
    "academic" \
    "Psychiatry" \
    "DE,FR,NL"

# 9. Parkinson's Disease
create_ehr_asset "asset:ehr:EHR009" \
    "EHR - Parkinson's Disease" \
    "Anonymized EHR: Parkinson's disease on combination therapy" \
    "G20" \
    "Parkinson's disease" \
    "65-74" \
    "male" \
    "clinical-research" \
    "27.0" \
    "Phase I/II" \
    "2024-521345-89-DE" \
    "Helmholtz-Institut für Arzneimittelforschung" \
    "academic" \
    "Nervous System" \
    "DE"

# 10. Crohn's Disease
create_ehr_asset "asset:ehr:EHR010" \
    "EHR - Crohn's Disease" \
    "Anonymized EHR: Inflammatory bowel disease on biologics" \
    "K50.9" \
    "Crohn's disease" \
    "25-34" \
    "female" \
    "clinical-research,registry-participation" \
    "27.0" \
    "Phase III" \
    "2024-506789-12-DE" \
    "BioMedTech Europa SE" \
    "commercial" \
    "Gastroenterology" \
    "DE,FR,NL,ES"

# 11. Epilepsy
create_ehr_asset "asset:ehr:EHR011" \
    "EHR - Generalized Epilepsy" \
    "Anonymized EHR: Well-controlled epilepsy on dual therapy" \
    "G40.3" \
    "Generalized idiopathic epilepsy" \
    "18-24" \
    "male" \
    "clinical-research" \
    "27.0" \
    "Phase II" \
    "2024-514567-23-DE" \
    "Charité Forschung GmbH" \
    "academic" \
    "Nervous System" \
    "DE"

# 12. Systemic Lupus
create_ehr_asset "asset:ehr:EHR012" \
    "EHR - Systemic Lupus Erythematosus" \
    "Anonymized EHR: SLE with nephritis" \
    "M32.9" \
    "Systemic lupus erythematosus" \
    "35-44" \
    "female" \
    "clinical-research,registry-participation" \
    "27.0" \
    "Phase II" \
    "2024-517890-56-DE" \
    "Rhenus Therapeutics GmbH" \
    "commercial" \
    "Rheumatology" \
    "DE"

# 13. Atrial Fibrillation
create_ehr_asset "asset:ehr:EHR013" \
    "EHR - Atrial Fibrillation" \
    "Anonymized EHR: AFib with high stroke risk on anticoagulation" \
    "I48.91" \
    "Atrial fibrillation" \
    "75-84" \
    "male" \
    "clinical-research" \
    "27.0" \
    "Phase IV" \
    "2023-489234-67-DE" \
    "NordPharma AG" \
    "commercial" \
    "Cardiovascular" \
    "DE,FR,IT,ES"

# 14. Severe Asthma
create_ehr_asset "asset:ehr:EHR014" \
    "EHR - Severe Persistent Asthma" \
    "Anonymized EHR: Severe asthma on biologic therapy" \
    "J45.50" \
    "Severe persistent asthma" \
    "35-44" \
    "female" \
    "clinical-research" \
    "27.0" \
    "Phase III" \
    "2024-508234-78-DE" \
    "NordPharma AG" \
    "commercial" \
    "Pulmonology" \
    "DE,FR,NL,ES"

# 15. Prostate Cancer
create_ehr_asset "asset:ehr:EHR015" \
    "EHR - Prostate Cancer Post-Surgery" \
    "Anonymized EHR: Prostate cancer post radical prostatectomy" \
    "C61" \
    "Malignant neoplasm of prostate" \
    "65-74" \
    "male" \
    "clinical-research,cancer-registry" \
    "27.0" \
    "Not Applicable" \
    "2023-498123-55-DE" \
    "EU Oncology Consortium" \
    "non-profit" \
    "Antineoplastic and Immunomodulating Agents" \
    "DE,BE,NL"

# 16. Osteoporosis
create_ehr_asset "asset:ehr:EHR016" \
    "EHR - Osteoporosis with Fractures" \
    "Anonymized EHR: Severe osteoporosis with vertebral fractures" \
    "M81.0" \
    "Postmenopausal osteoporosis" \
    "75-84" \
    "female" \
    "clinical-research" \
    "27.0" \
    "Phase IV" \
    "2023-496543-21-DE" \
    "Universitätsklinikum Köln" \
    "academic" \
    "Musculo-Skeletal System" \
    "DE,AT,BE"

# 17. Type 1 Diabetes
create_ehr_asset "asset:ehr:EHR017" \
    "EHR - Type 1 Diabetes with Pump" \
    "Anonymized EHR: T1D on insulin pump and CGM" \
    "E10.9" \
    "Type 1 diabetes mellitus" \
    "25-34" \
    "female" \
    "clinical-research,device-registry" \
    "27.0" \
    "Phase II" \
    "2024-519876-34-DE" \
    "Helmholtz-Institut für Arzneimittelforschung" \
    "academic" \
    "Endocrinology/Diabetology" \
    "DE"

# 18. Hepatitis C (Cured)
create_ehr_asset "asset:ehr:EHR018" \
    "EHR - Hepatitis C SVR" \
    "Anonymized EHR: HCV cured with residual fibrosis" \
    "B18.2" \
    "Chronic viral hepatitis C" \
    "55-64" \
    "male" \
    "clinical-research" \
    "27.0" \
    "Phase IV" \
    "2023-491234-56-DE" \
    "BioMedTech Europa SE" \
    "commercial" \
    "Antiinfectives for Systemic Use" \
    "DE,NL,BE"

# 19. Chronic Migraine
create_ehr_asset "asset:ehr:EHR019" \
    "EHR - Chronic Migraine" \
    "Anonymized EHR: Chronic migraine on CGRP inhibitor" \
    "G43.909" \
    "Migraine chronic" \
    "35-44" \
    "female" \
    "clinical-research" \
    "27.0" \
    "Phase III" \
    "2024-507654-89-DE" \
    "Rhenus Therapeutics GmbH" \
    "commercial" \
    "Nervous System" \
    "DE,FR,NL,ES"

# 20. HIV (Sensitive)
create_ehr_asset "asset:ehr:EHR020" \
    "EHR - HIV Well-Controlled" \
    "Anonymized EHR: HIV on ART undetectable (SENSITIVE)" \
    "B20" \
    "HIV disease" \
    "45-54" \
    "male" \
    "clinical-research" \
    "27.0" \
    "Phase IV" \
    "2023-494567-12-DE" \
    "EU Oncology Consortium" \
    "non-profit" \
    "Antiinfectives for Systemic Use" \
    "DE,FR,BE,NL"

echo ""
echo "Creating Contract Definitions..."

# Standard clinical research contract (for most records)
echo "Creating Standard Clinical Research Contract..."
curl -s --location "$PROVIDER_HOST/api/management/v3/contractdefinitions" \
--header 'Content-Type: application/json' \
--data '{
    "@context": [
        "https://w3id.org/edc/connector/management/v0.0.1"
    ],
    "@id": "health-clinical-research-contract",
    "@type": "ContractDefinition",
    "accessPolicyId": "health-research-access-policy",
    "contractPolicyId": "health-consent-contract-policy",
    "assetsSelector": {
        "operandLeft": "dct:type",
        "operator": "=",
        "operandRight": "ehds:ElectronicHealthRecord"
    }
}' > /dev/null && echo "  ✓ Standard Clinical Research Contract created"

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║     EHR2EDC Health Dataspace - Seeding Complete!                   ║"
echo "║                                                                    ║"
echo "║  Created:                                                          ║"
echo "║    - 20 Anonymized EHR Assets (EU CTR 536/2014 compliant)          ║"
echo "║    - 3 Policy Definitions (access, consent, sensitive)             ║"
echo "║    - 1 Contract Definition                                         ║"
echo "║                                                                    ║"
echo "║  Participants:                                                     ║"
echo "║    Provider: did:web:rheinland-uklinikum.de                        ║"
echo "║    Consumer: did:web:nordstein-research.de                         ║"
echo "║                                                                    ║"
echo "║  Compliance: EU CTR 536/2014, GDPR Art. 89, EHDS, GDNG             ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
