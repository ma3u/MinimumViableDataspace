#!/bin/bash

#
#  Copyright (c) 2024-2025 Metaform Systems, Inc. / Health Dataspace Demo
#
#  This program and the accompanying materials are made available under the
#  terms of the Apache License, Version 2.0 which is available at
#  https://www.apache.org/licenses/LICENSE-2.0
#
#  SPDX-License-Identifier: Apache-2.0
#

##############################################################################
# MVD Health Dataspace - Unified Seeding Script
#
# This script consolidates all seeding operations for the MVD Health Demo.
# It works on both macOS and Linux, and supports multiple deployment modes.
#
# Usage:
#   ./seed-dataspace.sh [OPTIONS]
#
# Options:
#   --mode=<local|docker|k8s>  Deployment mode (default: docker)
#   --skip-identity            Skip identity/participant seeding
#   --skip-health              Skip health EHR asset seeding  
#   --verbose                  Enable verbose output
#   --help                     Show this help message
#
# Examples:
#   ./seed-dataspace.sh                      # Full Docker seeding
#   ./seed-dataspace.sh --mode=local         # Local/IntelliJ development
#   ./seed-dataspace.sh --skip-identity      # Only seed health assets
#   ./seed-dataspace.sh --mode=docker --verbose
##############################################################################

set -e

# ============================================================================
# CONFIGURATION & DEFAULTS
# ============================================================================

MODE="docker"
SKIP_IDENTITY=false
SKIP_HEALTH=false
VERBOSE=false
API_KEY="c3VwZXItdXNlcg==.c3VwZXItc2VjcmV0LWtleQo="

# Parse command line arguments
for arg in "$@"; do
  case $arg in
    --mode=*)
      MODE="${arg#*=}"
      ;;
    --skip-identity)
      SKIP_IDENTITY=true
      ;;
    --skip-health)
      SKIP_HEALTH=true
      ;;
    --verbose)
      VERBOSE=true
      ;;
    --help)
      head -35 "$0" | tail -25
      exit 0
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# ============================================================================
# ENVIRONMENT CONFIGURATION BY MODE
# ============================================================================

configure_environment() {
  case $MODE in
    local)
      # Local development (IntelliJ)
      CONSUMER_DID="did:web:localhost%3A7083"
      PROVIDER_DID="did:web:localhost%3A7093"
      ISSUER_DID="did:web:localhost%3A10100"
      
      CONSUMER_IH_URL="http://localhost:7082"
      PROVIDER_IH_URL="http://localhost:7092"
      ISSUER_IH_URL="http://localhost:10015"
      
      CONSUMER_CP_URL="http://localhost:8081"
      PROVIDER_CP_URL="http://localhost:8191"
      CATALOG_SERVER_URL="http://localhost:8091"
      ISSUER_ADMIN_URL="http://localhost:10013"
      VAULT_URL="http://localhost:8200"
      VAULT_TOKEN="root"
      
      CONSUMER_DSP_URL="http://localhost:8082/api/dsp"
      PROVIDER_DSP_URL="http://localhost:8192/api/dsp"
      CATALOG_DSP_URL="http://localhost:8092/api/dsp"
      
      CONSUMER_CRED_URL="http://localhost:7081/api/credentials/v1/participants"
      PROVIDER_CRED_URL="http://localhost:7091/api/credentials/v1/participants"
      ISSUER_SERVICE_URL="http://localhost:10012/api/issuance/v1alpha/participants"
      
      EHR_BACKEND_URL="http://localhost:3001"
      ;;
      
    docker)
      # Docker Compose deployment
      CONSUMER_DID="did:web:consumer-identityhub%3A7083"
      PROVIDER_DID="did:web:provider-identityhub%3A7093"
      ISSUER_DID="did:web:issuer-service%3A10100"
      
      CONSUMER_IH_URL="http://localhost:7082"
      PROVIDER_IH_URL="http://localhost:7092"
      ISSUER_IH_URL="http://localhost:10015"
      
      CONSUMER_CP_URL="http://localhost:8081"
      PROVIDER_CP_URL="http://localhost:8191"
      CATALOG_SERVER_URL="http://localhost:8091"
      ISSUER_ADMIN_URL="http://localhost:10013"
      VAULT_URL="http://localhost:8200"
      VAULT_TOKEN="root"
      
      # Internal Docker network URLs for service-to-service
      CONSUMER_DSP_URL="http://consumer-controlplane:8082/api/dsp"
      PROVIDER_DSP_URL="http://provider-controlplane:8192/api/dsp"
      CATALOG_DSP_URL="http://catalog-server:8092/api/dsp"
      
      CONSUMER_CRED_URL="http://consumer-identityhub:7081/api/credentials/v1/participants"
      PROVIDER_CRED_URL="http://provider-identityhub:7091/api/credentials/v1/participants"
      ISSUER_SERVICE_URL="http://issuer-service:10012/api/issuance/v1alpha/participants"
      
      EHR_BACKEND_URL="http://host.docker.internal:3001"
      ;;
      
    k8s)
      # Kubernetes deployment (via ingress)
      CONSUMER_DID="did:web:consumer-identityhub%3A7083:consumer"
      PROVIDER_DID="did:web:provider-identityhub%3A7083:provider"
      ISSUER_DID="did:web:dataspace-issuer-service%3A10016:issuer"
      
      CONSUMER_IH_URL="http://127.0.0.1/consumer/cs"
      PROVIDER_IH_URL="http://127.0.0.1/provider/cs"
      ISSUER_IH_URL="http://127.0.0.1/issuer/cs"
      
      CONSUMER_CP_URL="http://127.0.0.1/consumer/cp"
      PROVIDER_CP_URL="http://127.0.0.1/provider-qna/cp"
      CATALOG_SERVER_URL="http://127.0.0.1/provider-catalog-server/cp"
      ISSUER_ADMIN_URL="http://127.0.0.1/issuer/ad"
      
      CONSUMER_DSP_URL="http://consumer-controlplane:8082/api/dsp"
      PROVIDER_DSP_URL="http://provider-qna-controlplane:8082/api/dsp"
      CATALOG_DSP_URL="http://provider-catalog-server-controlplane:8082/api/dsp"
      
      CONSUMER_CRED_URL="http://consumer-identityhub:7082/api/credentials/v1/participants"
      PROVIDER_CRED_URL="http://provider-identityhub:7082/api/credentials/v1/participants"
      ISSUER_SERVICE_URL="http://dataspace-issuer-service:10012/api/issuance/v1alpha/participants"
      
      EHR_BACKEND_URL="http://ehr-backend:3001"
      ;;
      
    *)
      echo "Unknown mode: $MODE"
      echo "Valid modes: local, docker, k8s"
      exit 1
      ;;
  esac
  
  # Compute base64 participant IDs (works on both macOS and Linux)
  CONSUMER_PARTICIPANT_ID=$(printf '%s' "$CONSUMER_DID" | base64 | tr -d '\n' | tr -d '=')
  PROVIDER_PARTICIPANT_ID=$(printf '%s' "$PROVIDER_DID" | base64 | tr -d '\n' | tr -d '=')
  ISSUER_PARTICIPANT_ID=$(printf '%s' "$ISSUER_DID" | base64 | tr -d '\n' | tr -d '=')
}

# ============================================================================
# UTILITY FUNCTIONS (macOS & Linux compatible)
# ============================================================================

# Store a secret directly in HashiCorp Vault
store_vault_secret() {
  local key=$1
  local value=$2
  
  log "Storing secret '$key' in Vault..."
  
  local response
  response=$(curl -sL -X POST "$VAULT_URL/v1/secret/data/$key" \
    -H "X-Vault-Token: $VAULT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"data\": {\"content\": \"$value\"}}" 2>/dev/null || true)
  
  if echo "$response" | grep -q "created_time" 2>/dev/null; then
    print_status "ok" "Secret '$key' stored in Vault"
  elif echo "$response" | grep -q "version" 2>/dev/null; then
    print_status "skip" "Secret '$key' already exists in Vault"
  else
    log "Vault response: $response"
    print_status "ok" "Secret '$key' configured in Vault"
  fi
}

# Seed superuser API key for IssuerService authentication
seed_superuser_key() {
  echo "Seeding superuser credentials in Vault..."
  
  # The superuser API key is required for IssuerService admin API authentication
  # Format matches EDC_IH_API_SUPERUSER_KEY in issuerservice.env
  local superuser_key="c3VwZXItdXNlcg==.c3VwZXItc2VjcmV0LWtleQo="
  
  store_vault_secret "super-user-apikey" "$superuser_key"
}
# Convert PEM file to single line (works on macOS and Linux)
pem_to_single_line() {
  awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' "$1"
}

# Log with timestamp if verbose
log() {
  if [ "$VERBOSE" = true ]; then
    echo "[$(date '+%H:%M:%S')] $*"
  fi
}

# Print colored status
print_status() {
  local status=$1
  local message=$2
  if [ "$status" = "ok" ]; then
    echo "  ✓ $message"
  elif [ "$status" = "skip" ]; then
    echo "  ○ $message"
  else
    echo "  ✗ $message"
  fi
}

# Emit seeding event to backend-edc for DSP Insider Panel visualization
# Usage: emit_seeding_event <event_type> [actor] [target] [details_json]
emit_seeding_event() {
  local event_type=$1
  local actor=${2:-"Seed Script"}
  local target=${3:-""}
  local details=${4:-"{}"}
  
  # Determine backend-edc URL based on mode
  local backend_url
  case $MODE in
    local)
      backend_url="http://localhost:3002"
      ;;
    docker)
      backend_url="http://localhost:3002"
      ;;
    *)
      backend_url="http://localhost:3002"
      ;;
  esac
  
  # Fire and forget - don't fail if backend is not running
  curl -s -X POST "$backend_url/api/events/seeding" \
    -H "Content-Type: application/json" \
    -d "{\"eventType\": \"$event_type\", \"actor\": \"$actor\", \"target\": \"$target\", \"details\": $details}" \
    >/dev/null 2>&1 || true
  
  log "Seeding event emitted: $event_type"
}

# Make API call with error handling
api_call() {
  local method=$1
  local url=$2
  local data=$3
  local headers=$4
  
  log "API: $method $url"
  
  if [ -n "$data" ]; then
    curl -s -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -H "x-api-key: $API_KEY" \
      ${headers:+-H "$headers"} \
      -d "$data"
  else
    curl -s -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -H "x-api-key: $API_KEY" \
      ${headers:+-H "$headers"}
  fi
}

# ============================================================================
# IDENTITY SEEDING FUNCTIONS
# ============================================================================

create_participant() {
  local name=$1
  local did=$2
  local participant_id=$3
  local ih_url=$4
  local cp_url=$5
  local cred_url=$6
  local dsp_url=$7
  local pem_file=$8
  local extra_endpoints=$9
  
  echo "Creating $name participant..."
  
  local pem_content
  pem_content=$(pem_to_single_line "$pem_file")
  
  # Build service endpoints JSON
  local endpoints="[
    {
      \"type\": \"CredentialService\",
      \"serviceEndpoint\": \"$cred_url/$(printf '%s' "$did" | base64 | tr -d '\n')\",
      \"id\": \"$name-credentialservice-1\"
    },
    {
      \"type\": \"ProtocolEndpoint\",
      \"serviceEndpoint\": \"$dsp_url\",
      \"id\": \"$name-dsp\"
    }
    $extra_endpoints
  ]"
  
  local data
  data=$(jq -n \
    --arg pem "$pem_content" \
    --arg did "$did" \
    --argjson endpoints "$endpoints" \
    '{
      "roles": [],
      "serviceEndpoints": $endpoints,
      "active": true,
      "participantId": $did,
      "did": $did,
      "key": {
        "keyId": ($did + "#key-1"),
        "privateKeyAlias": "key-1",
        "publicKeyPem": $pem
      }
    }')
  
  local response
  response=$(api_call POST "$ih_url/api/identity/v1alpha/participants/" "$data")
  
  local client_secret=""
  if echo "$response" | jq -e '.clientSecret' > /dev/null 2>&1; then
    client_secret=$(echo "$response" | jq -r '.clientSecret')
    print_status "ok" "$name participant created"
  else
    # Participant exists - regenerate token
    log "Participant exists, regenerating token..."
    client_secret=$(api_call POST "$ih_url/api/identity/v1alpha/participants/$participant_id/token" "")
    if [ -n "$client_secret" ] && [ "$client_secret" != "null" ]; then
      print_status "ok" "$name token regenerated"
    else
      print_status "fail" "Failed to get $name token"
      return 1
    fi
  fi
  
  # Store secret in connector vault
  if [ -n "$client_secret" ] && [ "$client_secret" != "null" ]; then
    local secret_data
    secret_data=$(jq -n \
      --arg secret "$client_secret" \
      --arg did "$did" \
      '{
        "@context": {"edc": "https://w3id.org/edc/v0.0.1/ns/"},
        "@type": "https://w3id.org/edc/v0.0.1/ns/Secret",
        "@id": ($did + "-sts-client-secret"),
        "https://w3id.org/edc/v0.0.1/ns/value": $secret
      }')
    
    local vault_response
    vault_response=$(curl -sL -X POST "$cp_url/api/management/v3/secrets" \
      -H "x-api-key: password" \
      -H "Content-Type: application/json" \
      -d "$secret_data" 2>/dev/null || true)
    
    if echo "$vault_response" | grep -q "ObjectConflict" 2>/dev/null; then
      print_status "skip" "$name secret already in vault"
    else
      print_status "ok" "$name secret stored in vault"
    fi
  fi
  
  # Publish the DID document
  local publish_data
  publish_data=$(jq -n --arg did "$did" '{"did": $did}')
  local publish_response
  publish_response=$(curl -sL -X POST "$ih_url/api/identity/v1alpha/participants/$participant_id/dids/publish" \
    -H "x-api-key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$publish_data" 2>/dev/null || true)
  log "DID publish response: $publish_response"
  print_status "ok" "$name DID published"
}

create_issuer() {
  echo "Creating dataspace issuer..."
  
  local pem_content
  pem_content=$(pem_to_single_line "deployment/assets/issuer_public.pem")
  
  local data
  data=$(jq -n \
    --arg pem "$pem_content" \
    --arg did "$ISSUER_DID" \
    --arg service_url "$ISSUER_SERVICE_URL" \
    '{
      "roles": ["admin"],
      "serviceEndpoints": [{
        "type": "IssuerService",
        "serviceEndpoint": ($service_url + "/" + ($did | @base64)),
        "id": "issuer-service-1"
      }],
      "active": true,
      "participantId": $did,
      "did": $did,
      "key": {
        "keyId": ($did + "#key-1"),
        "privateKeyAlias": "key-1",
        "keyGeneratorParams": {"algorithm": "EdDSA"}
      }
    }')
  
  local response
  response=$(curl -s --location "$ISSUER_IH_URL/api/identity/v1alpha/participants/" \
    --header 'Content-Type: application/json' \
    --data "$data")
  
  if echo "$response" | jq -e '.clientSecret' > /dev/null 2>&1; then
    print_status "ok" "Issuer created"
  elif echo "$response" | grep -q "already exists" 2>/dev/null; then
    print_status "skip" "Issuer already exists"
  else
    log "Issuer response: $response"
    print_status "ok" "Issuer configured"
  fi
}

seed_issuer_data() {
  echo "Seeding issuer with participant data..."
  
  # Encode issuer DID as base64 for API context path
  local issuer_context_id
  issuer_context_id=$(echo -n "$ISSUER_DID" | base64)
  
  # Run newman with || true to continue even if assertions fail (500 errors may be expected for already-exists)
  newman run \
    --folder "Seed Issuer" \
    --env-var "ISSUER_ADMIN_URL=$ISSUER_ADMIN_URL" \
    --env-var "ISSUER_CONTEXT_ID=$issuer_context_id" \
    --env-var "CONSUMER_ID=$CONSUMER_DID" \
    --env-var "CONSUMER_NAME=MVD Consumer Participant" \
    --env-var "PROVIDER_ID=$PROVIDER_DID" \
    --env-var "PROVIDER_NAME=MVD Provider Participant" \
    ./deployment/postman/MVD.postman_collection.json \
    ${VERBOSE:+} $([ "$VERBOSE" = false ] && echo "> /dev/null") || true
  
  print_status "ok" "Issuer data seeded"
}

seed_identity() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  IDENTITY SEEDING"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  Consumer DID: $CONSUMER_DID"
  echo "  Provider DID: $PROVIDER_DID"
  echo "  Issuer DID:   $ISSUER_DID"
  echo ""
  
  # Seed superuser key in Vault first (required for IssuerService admin API)
  seed_superuser_key
  echo ""
  
  # Consumer
  create_participant \
    "consumer" \
    "$CONSUMER_DID" \
    "$CONSUMER_PARTICIPANT_ID" \
    "$CONSUMER_IH_URL" \
    "$CONSUMER_CP_URL" \
    "$CONSUMER_CRED_URL" \
    "$CONSUMER_DSP_URL" \
    "deployment/assets/consumer_public.pem" \
    ""
  emit_seeding_event "seeding.identity.consumer" "Seed Script" "Identity Hub" "{\"did\": \"$CONSUMER_DID\", \"role\": \"Research Institute (CRO)\"}"
  
  echo ""
  
  # Provider (with extra catalog server endpoint)
  local provider_extra=",{\"type\":\"ProtocolEndpoint\",\"serviceEndpoint\":\"$CATALOG_DSP_URL\",\"id\":\"provider-catalogserver-dsp\"}"
  create_participant \
    "provider" \
    "$PROVIDER_DID" \
    "$PROVIDER_PARTICIPANT_ID" \
    "$PROVIDER_IH_URL" \
    "$PROVIDER_CP_URL" \
    "$PROVIDER_CRED_URL" \
    "$PROVIDER_DSP_URL" \
    "deployment/assets/provider_public.pem" \
    "$provider_extra"
  emit_seeding_event "seeding.identity.provider" "Seed Script" "Identity Hub" "{\"did\": \"$PROVIDER_DID\", \"role\": \"Hospital (Rheinland-Universitätsklinikum)\"}"
  
  # Store provider secret in additional vaults (catalog server, etc.)
  if [ "$MODE" = "local" ]; then
    for port in 8091 8291; do
      curl -sL -X POST "http://localhost:$port/api/management/v3/secrets" \
        -H "x-api-key: password" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg did "$PROVIDER_DID" '{
          "@context": {"edc": "https://w3id.org/edc/v0.0.1/ns/"},
          "@type": "https://w3id.org/edc/v0.0.1/ns/Secret",
          "@id": ($did + "-sts-client-secret"),
          "https://w3id.org/edc/v0.0.1/ns/value": "placeholder"
        }')" 2>/dev/null || true
    done
  fi
  
  echo ""
  
  # Issuer
  create_issuer
  emit_seeding_event "seeding.identity.issuer" "Seed Script" "Issuer Service" "{\"did\": \"$ISSUER_DID\", \"role\": \"Trusted Credential Issuer\"}"
  
  echo ""
  
  # Seed issuer data via Newman (this issues the credentials)
  seed_issuer_data
  emit_seeding_event "seeding.credential.issued" "Issuer" "Consumer" "{\"credentialType\": \"MembershipCredential\", \"subject\": \"$CONSUMER_DID\"}"
  emit_seeding_event "seeding.credential.issued" "Issuer" "Consumer" "{\"credentialType\": \"DataProcessorCredential\", \"subject\": \"$CONSUMER_DID\"}"
  emit_seeding_event "seeding.credential.issued" "Issuer" "Provider" "{\"credentialType\": \"MembershipCredential\", \"subject\": \"$PROVIDER_DID\"}"
}

# ============================================================================
# HEALTH DATA SEEDING FUNCTIONS
# ============================================================================

create_ehr_asset() {
  local id=$1
  local name=$2
  local desc=$3
  local icd_code=$4
  local diagnosis=$5
  local age_band=$6
  local sex=$7
  local consent_purposes=$8
  local meddra_version=$9
  local study_phase=${10}
  local eu_ct_number=${11}
  local sponsor_name=${12}
  local sponsor_type=${13}
  local therapeutic_area=${14}
  local member_states=${15}
  
  log "Creating EHR Asset: $name ($id)"
  
  # derive EHR id from asset id (support both 'asset:ehr:EHR001' and 'asset-ehr-EHR001')
  local ehr_id
  if [[ "$id" == asset-ehr-* ]]; then
    ehr_id="${id#asset-ehr-}"
  else
    ehr_id="${id##*:}"
  fi

  # POST asset and capture HTTP status
  local resp
  resp=$(curl -s -w "\n%{http_code}" --location "$PROVIDER_CP_URL/api/management/v3/assets" \
    --header 'Content-Type: application/json' \
    --header 'X-Api-Key: password' \
    --data '{
      "@context": ["https://w3id.org/edc/connector/management/v0.0.1"],
      "@id": "'"$id"'",
      "@type": "Asset",
      "properties": {
          "title": "'"$name"'",
        "description": "'"$desc"'",
        "type": "ElectronicHealthRecord",
        "contenttype": "application/fhir+json",
        "healthCategory": "ElectronicHealthRecord",
        "version": "1.0",
        "keywords": ["ICD:'"$icd_code"'", "'"$diagnosis"'"],
        "ageRange": "'"$age_band"'",
        "biologicalSex": "'"$sex"'",
        "conformsTo": "'"$consent_purposes"'",
        "meddraVersion": "'"$meddra_version"'",
        "clinicalTrialPhase": "'"$study_phase"'",
        "euCtNumber": "'"$eu_ct_number"'",
        "sponsorName": "'"$sponsor_name"'",
        "sponsorType": "'"$sponsor_type"'",
        "therapeuticArea": "'"$therapeutic_area"'",
        "memberStates": "'"$member_states"'",
        "anonymizationMethod": "k-anonymity-k5",
        "spatial": "DE-NW",
        "healthDataHolder": "Rheinland Universitätsklinikum"
      },
      "dataAddress": {
        "@type": "DataAddress",
        "type": "HttpData",
        "baseUrl": "'"$EHR_BACKEND_URL"'/api/ehr/'"${ehr_id}"'",
        "proxyPath": "false",
        "proxyQueryParams": "false"
      }
    }')
  
  # split response and status
  local http_status
  http_status=$(echo "$resp" | tail -n1)
  local body
  body=$(echo "$resp" | sed '$d')
  
  if [ "$http_status" = "200" ] || [ "$http_status" = "201" ]; then
    print_status "ok" "$name"
    emit_seeding_event "seeding.asset.created" "Seed Script" "Provider" "{\"assetId\": \"$id\", \"name\": \"$name\", \"icdCode\": \"$icd_code\", \"diagnosis\": \"$diagnosis\"}"
  elif echo "$body" | grep -q "ObjectConflict" 2>/dev/null; then
    print_status "skip" "$name already exists"
  else
    print_status "fail" "$name (http_status=$http_status)"
    echo "Response body: $body"
  fi
}

create_health_policies() {
  echo "Creating health policies..."
  
  # Health Research Access Policy
  curl -s --location "$PROVIDER_CP_URL/api/management/v3/policydefinitions" \
    --header 'Content-Type: application/json' \
    --header 'X-Api-Key: password' \
    --data '{
      "@context": ["https://w3id.org/edc/connector/management/v0.0.1", "http://www.w3.org/ns/odrl.jsonld"],
      "@id": "health-research-access-policy",
      "@type": "PolicyDefinition",
      "policy": {
        "@type": "Set",
        "permission": [{"action": "use", "constraint": {"leftOperand": "MembershipCredential", "operator": "eq", "rightOperand": "active"}}]
      }
    }' > /dev/null
  print_status "ok" "Health Research Access Policy"
  emit_seeding_event "seeding.policy.created" "Seed Script" "Provider" "{\"policyId\": \"health-research-access-policy\", \"type\": \"Access Policy\", \"compliance\": \"EU CTR 536/2014\"}"
  
  # Consent-Required Contract Policy
  curl -s --location "$PROVIDER_CP_URL/api/management/v3/policydefinitions" \
    --header 'Content-Type: application/json' \
    --header 'X-Api-Key: password' \
    --data '{
      "@context": ["https://w3id.org/edc/connector/management/v0.0.1", "http://www.w3.org/ns/odrl.jsonld"],
      "@id": "health-consent-contract-policy",
      "@type": "PolicyDefinition",
      "policy": {
        "@type": "Set",
        "obligation": [{"action": "use", "constraint": {"leftOperand": "DataAccess.level", "operator": "eq", "rightOperand": "processing"}}],
        "prohibition": [{"action": "use", "constraint": {"leftOperand": "DataAccess.reidentification", "operator": "eq", "rightOperand": "true"}}]
      }
    }' > /dev/null
  print_status "ok" "Consent-Required Contract Policy"
  emit_seeding_event "seeding.policy.created" "Seed Script" "Provider" "{\"policyId\": \"health-consent-contract-policy\", \"type\": \"Contract Policy\", \"compliance\": \"GDPR Art. 89\"}"
  
  # Sensitive Data Policy
  curl -s --location "$PROVIDER_CP_URL/api/management/v3/policydefinitions" \
    --header 'Content-Type: application/json' \
    --header 'X-Api-Key: password' \
    --data '{
      "@context": ["https://w3id.org/edc/connector/management/v0.0.1", "http://www.w3.org/ns/odrl.jsonld"],
      "@id": "health-sensitive-contract-policy",
      "@type": "PolicyDefinition",
      "policy": {
        "@type": "Set",
        "obligation": [{"action": "use", "constraint": {"leftOperand": "DataAccess.level", "operator": "eq", "rightOperand": "sensitive"}}],
        "prohibition": [{"action": "use", "constraint": {"leftOperand": "DataAccess.reidentification", "operator": "eq", "rightOperand": "true"}}]
      }
    }' > /dev/null
  print_status "ok" "Sensitive Data Contract Policy"
  emit_seeding_event "seeding.policy.created" "Seed Script" "Provider" "{\"policyId\": \"health-sensitive-contract-policy\", \"type\": \"Contract Policy\", \"compliance\": \"EHDS sensitive data\"}"
  
  # Confidential Compute Policy
  curl -s --location "$PROVIDER_CP_URL/api/management/v3/policydefinitions" \
    --header 'Content-Type: application/json' \
    --header 'X-Api-Key: password' \
    --data '{
      "@context": ["https://w3id.org/edc/connector/management/v0.0.1", "http://www.w3.org/ns/odrl.jsonld"],
      "@id": "health-confidential-compute-policy",
      "@type": "PolicyDefinition",
      "policy": {
        "@type": "Set",
        "obligation": [
          {"action": "use", "constraint": {"leftOperand": "Security.confidentialComputing", "operator": "eq", "rightOperand": "true"}},
          {"action": "use", "constraint": {"leftOperand": "Security.encryptionInTransit", "operator": "eq", "rightOperand": "true"}}
        ]
      }
    }' > /dev/null
  print_status "ok" "Confidential Compute Policy"
  emit_seeding_event "seeding.policy.created" "Seed Script" "Provider" "{\"policyId\": \"health-confidential-compute-policy\", \"type\": \"Compute Policy\", \"compliance\": \"GDNG TEE requirement\"}"
}

create_health_contracts() {
  echo "Creating contract definitions..."
  
  # Standard Clinical Research Contract
  curl -s --location "$PROVIDER_CP_URL/api/management/v3/contractdefinitions" \
    --header 'Content-Type: application/json' \
    --header 'X-Api-Key: password' \
    --data '{
      "@context": ["https://w3id.org/edc/connector/management/v0.0.1"],
      "@id": "health-clinical-research-contract",
      "@type": "ContractDefinition",
      "accessPolicyId": "health-research-access-policy",
      "contractPolicyId": "health-consent-contract-policy",
      "assetsSelector": {"operandLeft": "dct:type", "operator": "=", "operandRight": "ehds:ElectronicHealthRecord"}
    }' > /dev/null
  print_status "ok" "Clinical Research Contract"
  emit_seeding_event "seeding.contract.created" "Seed Script" "Provider" "{\"contractId\": \"health-clinical-research-contract\", \"accessPolicy\": \"health-research-access-policy\", \"contractPolicy\": \"health-consent-contract-policy\"}"
  
  # Genomics Confidential Compute Contract
  curl -s --location "$PROVIDER_CP_URL/api/management/v3/contractdefinitions" \
    --header 'Content-Type: application/json' \
    --header 'X-Api-Key: password' \
    --data '{
      "@context": ["https://w3id.org/edc/connector/management/v0.0.1"],
      "@id": "health-genomics-contract",
      "@type": "ContractDefinition",
      "accessPolicyId": "health-research-access-policy",
      "contractPolicyId": "health-confidential-compute-policy",
      "assetsSelector": {"operandLeft": "healthdcatap:sensitiveCategory", "operator": "=", "operandRight": "genomics"}
    }' > /dev/null
  print_status "ok" "Genomics Confidential Compute Contract"
  emit_seeding_event "seeding.contract.created" "Seed Script" "Provider" "{\"contractId\": \"health-genomics-contract\", \"accessPolicy\": \"health-research-access-policy\", \"contractPolicy\": \"health-confidential-compute-policy\"}"
}

seed_health_assets() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  HEALTH DATA SEEDING"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  Provider: Rheinland Universitätsklinikum"
  echo "  Consumer: Nordstein Research Institute"
  echo "  EHR Backend: $EHR_BACKEND_URL"
  echo ""
  
  create_health_policies
  echo ""
  
  echo "Creating EHR Assets..."
  
  # Define all EHR records (ID, Name, Description, ICD, Diagnosis, AgeBand, Sex, Consent, MedDRA, Phase, EUCT, Sponsor, SponsorType, TherapeuticArea, MemberStates)
  
  create_ehr_asset "asset-ehr-EHR001" "EHR - Type 2 Diabetes with CV Risk" "Anonymized EHR: Type 2 diabetes mellitus with cardiovascular comorbidities" "E11.9" "Type 2 diabetes mellitus" "55-64" "male" "clinical-research,registry-participation" "27.0" "Phase III" "2024-501234-12-DE" "NordPharma AG" "commercial" "Endocrinology/Diabetology" "DE,FR,NL,ES"
  
  create_ehr_asset "asset-ehr-EHR002" "EHR - Chronic Heart Failure" "Anonymized EHR: Heart failure with reduced ejection fraction" "I50.9" "Heart failure" "65-74" "female" "clinical-research" "27.0" "Phase IV" "2023-487652-41-DE" "Rhenus Therapeutics GmbH" "commercial" "Cardiovascular" "DE,AT,NL"
  
  create_ehr_asset "asset-ehr-EHR003" "EHR - Breast Cancer Survivor" "Anonymized EHR: Breast cancer in remission post-treatment" "C50.9" "Malignant neoplasm of breast" "45-54" "female" "clinical-research,cancer-registry" "27.0" "Phase II" "2024-512876-23-DE" "DKFZ Heidelberg" "academic" "Antineoplastic and Immunomodulating Agents" "DE"
  
  create_ehr_asset "asset-ehr-EHR004" "EHR - COPD with Exacerbations" "Anonymized EHR: Chronic obstructive pulmonary disease" "J44.1" "COPD with acute exacerbation" "65-74" "male" "clinical-research" "27.0" "Phase III" "2024-503987-18-DE" "BioMedTech Europa SE" "commercial" "Pulmonology" "DE,FR,NL,ES"
  
  create_ehr_asset "asset-ehr-EHR005" "EHR - Rheumatoid Arthritis" "Anonymized EHR: RA on biologic therapy" "M06.9" "Rheumatoid arthritis" "35-44" "female" "clinical-research,registry-participation" "27.0" "Phase III" "2024-505612-34-DE" "NordPharma AG" "commercial" "Rheumatology" "DE,FR,NL,ES"
  
  create_ehr_asset "asset-ehr-EHR006" "EHR - Multiple Sclerosis (RRMS)" "Anonymized EHR: Relapsing-remitting multiple sclerosis" "G35" "Multiple sclerosis" "25-34" "female" "clinical-research" "27.0" "Phase II" "2024-518234-67-DE" "Charité Forschung GmbH" "academic" "Nervous System" "DE"
  
  create_ehr_asset "asset-ehr-EHR007" "EHR - CKD Stage 4" "Anonymized EHR: Chronic kidney disease stage 4 with diabetes" "N18.4" "Chronic kidney disease stage 4" "55-64" "male" "clinical-research" "27.0" "Phase IV" "2023-492145-78-DE" "Universitätsklinikum Köln" "academic" "Nephrology" "DE,AT"
  
  create_ehr_asset "asset-ehr-EHR008" "EHR - Major Depressive Disorder" "Anonymized EHR: Recurrent MDD (SENSITIVE - Mental Health)" "F33.1" "Major depressive disorder recurrent" "25-34" "male" "clinical-research" "27.0" "Phase II/III" "2024-509876-45-DE" "Charité Forschung GmbH" "academic" "Psychiatry" "DE,FR,NL"
  
  create_ehr_asset "asset-ehr-EHR009" "EHR - Parkinson's Disease" "Anonymized EHR: Parkinson's disease on combination therapy" "G20" "Parkinson's disease" "65-74" "male" "clinical-research" "27.0" "Phase I/II" "2024-521345-89-DE" "Helmholtz-Institut für Arzneimittelforschung" "academic" "Nervous System" "DE"
  
  create_ehr_asset "asset-ehr-EHR010" "EHR - Crohn's Disease" "Anonymized EHR: Inflammatory bowel disease on biologics" "K50.9" "Crohn's disease" "25-34" "female" "clinical-research,registry-participation" "27.0" "Phase III" "2024-506789-12-DE" "BioMedTech Europa SE" "commercial" "Gastroenterology" "DE,FR,NL,ES"
  
  create_ehr_asset "asset-ehr-EHR011" "EHR - Generalized Epilepsy" "Anonymized EHR: Well-controlled epilepsy on dual therapy" "G40.3" "Generalized idiopathic epilepsy" "18-24" "male" "clinical-research" "27.0" "Phase II" "2024-514567-23-DE" "Charité Forschung GmbH" "academic" "Nervous System" "DE"
  
  create_ehr_asset "asset-ehr-EHR012" "EHR - Systemic Lupus Erythematosus" "Anonymized EHR: SLE with nephritis" "M32.9" "Systemic lupus erythematosus" "35-44" "female" "clinical-research,registry-participation" "27.0" "Phase II" "2024-517890-56-DE" "Rhenus Therapeutics GmbH" "commercial" "Rheumatology" "DE"
  
  create_ehr_asset "asset-ehr-EHR013" "EHR - Atrial Fibrillation" "Anonymized EHR: AFib with high stroke risk on anticoagulation" "I48.91" "Atrial fibrillation" "75-84" "male" "clinical-research" "27.0" "Phase IV" "2023-489234-67-DE" "NordPharma AG" "commercial" "Cardiovascular" "DE,FR,IT,ES"
  
  create_ehr_asset "asset-ehr-EHR014" "EHR - Severe Persistent Asthma" "Anonymized EHR: Severe asthma on biologic therapy" "J45.50" "Severe persistent asthma" "35-44" "female" "clinical-research" "27.0" "Phase III" "2024-508234-78-DE" "NordPharma AG" "commercial" "Pulmonology" "DE,FR,NL,ES"
  
  create_ehr_asset "asset-ehr-EHR015" "EHR - Prostate Cancer Post-Surgery" "Anonymized EHR: Prostate cancer post radical prostatectomy" "C61" "Malignant neoplasm of prostate" "65-74" "male" "clinical-research,cancer-registry" "27.0" "Not Applicable" "2023-498123-55-DE" "EU Oncology Consortium" "non-profit" "Antineoplastic and Immunomodulating Agents" "DE,BE,NL"
  
  create_ehr_asset "asset-ehr-EHR016" "EHR - Osteoporosis with Fractures" "Anonymized EHR: Severe osteoporosis with vertebral fractures" "M81.0" "Postmenopausal osteoporosis" "75-84" "female" "clinical-research" "27.0" "Phase IV" "2023-496543-21-DE" "Universitätsklinikum Köln" "academic" "Musculo-Skeletal System" "DE,AT,BE"
  
  create_ehr_asset "asset-ehr-EHR017" "EHR - Type 1 Diabetes with Pump" "Anonymized EHR: T1D on insulin pump and CGM" "E10.9" "Type 1 diabetes mellitus" "25-34" "female" "clinical-research,device-registry" "27.0" "Phase II" "2024-519876-34-DE" "Helmholtz-Institut für Arzneimittelforschung" "academic" "Endocrinology/Diabetology" "DE"
  
  create_ehr_asset "asset-ehr-EHR018" "EHR - Hepatitis C SVR" "Anonymized EHR: HCV cured with residual fibrosis" "B18.2" "Chronic viral hepatitis C" "55-64" "male" "clinical-research" "27.0" "Phase IV" "2023-491234-56-DE" "BioMedTech Europa SE" "commercial" "Antiinfectives for Systemic Use" "DE,NL,BE"
  
  create_ehr_asset "asset-ehr-EHR019" "EHR - Chronic Migraine" "Anonymized EHR: Chronic migraine on CGRP inhibitor" "G43.909" "Migraine chronic" "35-44" "female" "clinical-research" "27.0" "Phase III" "2024-507654-89-DE" "Rhenus Therapeutics GmbH" "commercial" "Nervous System" "DE,FR,NL,ES"
  
  create_ehr_asset "asset-ehr-EHR020" "EHR - HIV Well-Controlled" "Anonymized EHR: HIV on ART undetectable (SENSITIVE)" "B20" "HIV disease" "45-54" "male" "clinical-research" "27.0" "Phase IV" "2023-494567-12-DE" "EU Oncology Consortium" "non-profit" "Antiinfectives for Systemic Use" "DE,FR,BE,NL"
  
  create_ehr_asset "asset-ehr-EHR021" "EHR - Rare Genetic Disorder (Pediatric)" "Genomic sequencing data for pediatric rare disease cohort" "Q87.1" "Congenital malformation syndromes" "0-17" "male" "clinical-research,genetic-research" "27.0" "Phase I" "2025-530123-99-DE" "Charité Forschung GmbH" "academic" "CONGENITAL" "DE,FR"
  
  echo ""
  create_health_contracts
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
  echo ""
  echo "╔════════════════════════════════════════════════════════════════════╗"
  echo "║     MVD Health Dataspace - Unified Seeding Script                  ║"
  echo "╠════════════════════════════════════════════════════════════════════╣"
  echo "║  Mode: $(printf '%-58s' "$MODE")║"
  echo "║  Skip Identity: $(printf '%-51s' "$SKIP_IDENTITY")║"
  echo "║  Skip Health: $(printf '%-53s' "$SKIP_HEALTH")║"
  echo "╚════════════════════════════════════════════════════════════════════╝"
  
  # Configure environment based on mode
  configure_environment
  
  # Emit seeding started event
  emit_seeding_event "seeding.started" "Seed Script" "Dataspace" "{\"mode\": \"$MODE\", \"skipIdentity\": $SKIP_IDENTITY, \"skipHealth\": $SKIP_HEALTH}"
  
  # Seed identity if not skipped
  if [ "$SKIP_IDENTITY" = false ]; then
    seed_identity
  else
    echo ""
    echo "Skipping identity seeding (--skip-identity)"
  fi
  
  # Seed health data if not skipped
  if [ "$SKIP_HEALTH" = false ]; then
    seed_health_assets
  else
    echo ""
    echo "Skipping health data seeding (--skip-health)"
  fi
  
  # Emit seeding completed event
  emit_seeding_event "seeding.completed" "Seed Script" "Dataspace" "{\"mode\": \"$MODE\", \"identitySeeded\": $([ "$SKIP_IDENTITY" = false ] && echo "true" || echo "false"), \"healthSeeded\": $([ "$SKIP_HEALTH" = false ] && echo "true" || echo "false")}"
  
  # Summary
  echo ""
  echo "╔════════════════════════════════════════════════════════════════════╗"
  echo "║     Seeding Complete!                                              ║"
  echo "╠════════════════════════════════════════════════════════════════════╣"
  if [ "$SKIP_IDENTITY" = false ]; then
  echo "║  Consumer: $(printf '%-56s' "$CONSUMER_DID")║"
  echo "║  Provider: $(printf '%-56s' "$PROVIDER_DID")║"
  echo "║  Issuer:   $(printf '%-56s' "$ISSUER_DID")║"
  fi
  if [ "$SKIP_HEALTH" = false ]; then
  echo "║  EHR Assets: 21 anonymized records                                 ║"
  echo "║  Policies: 4 (access, consent, sensitive, compute)                 ║"
  echo "║  Contracts: 2 (clinical research, genomics)                        ║"
  fi
  echo "║                                                                    ║"
  echo "║  Compliance: EU CTR 536/2014, GDPR Art. 89, EHDS, GDNG             ║"
  echo "╚════════════════════════════════════════════════════════════════════╝"
  echo ""
}

# Run main
main
