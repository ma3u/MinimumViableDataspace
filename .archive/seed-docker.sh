#!/bin/bash
#
# DEPRECATED: This script is deprecated. Use seed-dataspace.sh instead.
#
# For Docker development:
#   ./seed-dataspace.sh --mode=docker
#
# This wrapper maintains backward compatibility.

echo "⚠️  NOTICE: seed-docker.sh is deprecated. Use seed-dataspace.sh instead."
echo ""
echo "Running: ./seed-dataspace.sh --mode=docker --skip-health"
echo ""

exec "$(dirname "$0")/seed-dataspace.sh" --mode=docker --skip-health
