#!/bin/bash
# ============================================================================
# DCAT-AP for Health - SHACL Validation Script
# ============================================================================
# This script validates HealthDCAT-AP (DCAT-AP for Health) compliant RDF/TTL
# files against the official DCAT-AP 3.0.0 SHACL shapes from SEMICeu.
#
# Prerequisites:
#   - Apache Jena installed (brew install jena on macOS)
#   - shacl command available in PATH
#
# Usage:
#   ./validate-healthdcat.sh [input.ttl] [options]
#
# Options:
#   -s, --summary     Show summary only (default: full report)
#   -o, --output      Output file for validation report (default: stdout)
#   -v, --verbose     Verbose mode
#   -h, --help        Show this help
#
# Examples:
#   ./validate-healthdcat.sh health-catalog.ttl
#   ./validate-healthdcat.sh health-catalog.ttl --summary
#   ./validate-healthdcat.sh health-catalog.ttl -o report.ttl
#
# References:
#   - DCAT-AP 3.0.0: https://semiceu.github.io/DCAT-AP/releases/3.0.0/
#   - HealthDCAT-AP: https://healthdcat-ap.github.io/
#   - Apache Jena SHACL: https://jena.apache.org/documentation/shacl/
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHACL_DIR="${SCRIPT_DIR}/shacl"
SHAPES_FILE="${SHACL_DIR}/dcat-ap-shacl.ttl"
SHAPES_URL="https://raw.githubusercontent.com/SEMICeu/DCAT-AP/refs/heads/master/releases/3.0.0/shacl/dcat-ap-SHACL.ttl"

# Default values
INPUT_FILE="${1:-health-catalog.ttl}"
SUMMARY_ONLY=false
OUTPUT_FILE=""
VERBOSE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
shift || true
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--summary)
            SUMMARY_ONLY=true
            shift
            ;;
        -o|--output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            head -40 "$0" | tail -35
            exit 0
            ;;
        *)
            INPUT_FILE="$1"
            shift
            ;;
    esac
done

log() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}[INFO]${NC} $1" >&2
    fi
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[OK]${NC} $1" >&2
}

# Check prerequisites
if ! command -v shacl &> /dev/null; then
    error "Apache Jena SHACL validator not found. Install with: brew install jena"
fi

# Resolve input file path
if [[ ! "$INPUT_FILE" = /* ]]; then
    INPUT_FILE="${SCRIPT_DIR}/${INPUT_FILE}"
fi

if [[ ! -f "$INPUT_FILE" ]]; then
    error "Input file not found: $INPUT_FILE"
fi

# Ensure shapes file exists
if [[ ! -f "$SHAPES_FILE" ]]; then
    log "Downloading DCAT-AP 3.0.0 SHACL shapes..."
    mkdir -p "$SHACL_DIR"
    curl -sL -o "$SHAPES_FILE" "$SHAPES_URL"
    if [[ ! -f "$SHAPES_FILE" ]]; then
        error "Failed to download SHACL shapes from $SHAPES_URL"
    fi
    success "Downloaded SHACL shapes to $SHAPES_FILE"
fi

log "Validating: $INPUT_FILE"
log "Using shapes: $SHAPES_FILE"

# Run validation
TEMP_REPORT=$(mktemp)
trap "rm -f $TEMP_REPORT" EXIT

shacl validate --shapes "$SHAPES_FILE" --data "$INPUT_FILE" > "$TEMP_REPORT" 2>&1 || true

# Check if validation passed
if grep -q "sh:conforms  true" "$TEMP_REPORT"; then
    success "Validation PASSED - TTL is DCAT-AP 3.0.0 compliant!"
    if [[ -n "$OUTPUT_FILE" ]]; then
        cp "$TEMP_REPORT" "$OUTPUT_FILE"
        log "Report saved to: $OUTPUT_FILE"
    fi
    exit 0
fi

# Validation failed - analyze results
VIOLATION_COUNT=$(grep -c "sh:ValidationResult" "$TEMP_REPORT" || echo "0")
warn "Validation FAILED - Found $VIOLATION_COUNT violations"

if [ "$SUMMARY_ONLY" = true ]; then
    echo ""
    echo "=== VIOLATION SUMMARY ==="
    echo ""
    echo "Count | Violation Type"
    echo "------|----------------"
    grep "sh:resultMessage" "$TEMP_REPORT" | \
        sed 's/.*"ClassConstraint\[\([^]]*\)\].*/ClassConstraint: \1/' | \
        sed 's/.*"minCount\[\([0-9]*\)\].*/minCount: \1/' | \
        sed 's/.*"maxCount\[\([0-9]*\)\].*/maxCount: \1/' | \
        sed 's/.*"DatatypeConstraint\[\([^]]*\)\].*/DatatypeConstraint: \1/' | \
        sort | uniq -c | sort -rn
    echo ""
    echo "=== TOP 10 AFFECTED RESOURCES ==="
    echo ""
    grep "sh:focusNode" "$TEMP_REPORT" | \
        sed 's/.*<\([^>]*\)>.*/\1/' | \
        sort | uniq -c | sort -rn | head -10
else
    # Output full report
    if [[ -n "$OUTPUT_FILE" ]]; then
        cp "$TEMP_REPORT" "$OUTPUT_FILE"
        log "Full report saved to: $OUTPUT_FILE"
    else
        cat "$TEMP_REPORT"
    fi
fi

echo ""
echo "=== COMMON FIXES ==="
echo ""
echo "Most violations are ClassConstraint errors. To fix:"
echo ""
echo "1. Add explicit rdf:type declarations for resources:"
echo "   <uri> a skos:Concept .           # For themes, categories"
echo "   <uri> a dct:Standard .           # For conformsTo references"
echo "   <uri> a dct:LicenseDocument .    # For licenses"
echo "   <uri> a eli:LegalResource .      # For applicable legislation"
echo "   <uri> a dct:MediaType .          # For media types"
echo "   <uri> a foaf:Document .          # For documentation"
echo ""
echo "2. Use proper EU vocabulary URIs from:"
echo "   - https://op.europa.eu/en/web/eu-vocabularies"
echo ""
echo "For more info: https://healthdcat-ap.github.io/"

exit 1
