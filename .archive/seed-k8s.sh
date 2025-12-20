#!/bin/bash
#
# DEPRECATED: This script is deprecated. Use seed-dataspace.sh instead.
#
# For Kubernetes deployment:
#   ./seed-dataspace.sh --mode=k8s
#
# This wrapper maintains backward compatibility.

echo "⚠️  NOTICE: seed-k8s.sh is deprecated. Use seed-dataspace.sh instead."
echo ""
echo "Running: ./seed-dataspace.sh --mode=k8s"
echo ""

exec "$(dirname "$0")/seed-dataspace.sh" --mode=k8s
