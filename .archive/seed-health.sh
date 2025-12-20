#!/bin/bash
#
# DEPRECATED: This script is deprecated. Use seed-dataspace.sh instead.
#
# For health data seeding (after identity is seeded):
#   ./seed-dataspace.sh --mode=docker --skip-identity
#
# For full seeding (identity + health):
#   ./seed-dataspace.sh --mode=docker
#
# This wrapper maintains backward compatibility.

echo "⚠️  NOTICE: seed-health.sh is deprecated. Use seed-dataspace.sh instead."
echo ""
echo "Running: ./seed-dataspace.sh --mode=docker --skip-identity"
echo ""

exec "$(dirname "$0")/seed-dataspace.sh" --mode=docker --skip-identity
