#!/usr/bin/env bash
# Scan every container file a pull request touches and write one JSON document.
#
# Runs in the untrusted stage: no secrets, no write permissions, no commenting.
# Output is data only, consumed later by render_pr_comment.py in the trusted
# stage.
set -uo pipefail

base_ref="${1:?base ref required}"
out_dir="${2:?output directory required}"

mkdir -p "${out_dir}"

changed="$(git diff --name-only "origin/${base_ref}...HEAD" -- \
  '*Dockerfile*' '*docker-compose*.yml' '*docker-compose*.yaml' \
  '*compose*.yml' '*compose*.yaml' 2>/dev/null || true)"

if [ -z "${changed}" ]; then
  echo "no container files changed"
  printf '{"files": []}\n' > "${out_dir}/results.json"
  exit 0
fi

echo "changed files:"
echo "${changed}"

tmp="$(mktemp -d)"
trap 'rm -rf "${tmp}"' EXIT
index=0

while IFS= read -r file; do
  [ -n "${file}" ] || continue
  [ -f "${file}" ] || continue

  case "${file}" in
    *compose*) args=(--compose "${file}") ;;
    *)         args=("${file}") ;;
  esac

  # A scan that finds problems exits non-zero by design. That is a result,
  # not a workflow failure, so the exit code is deliberately ignored here.
  if docksec "${args[@]}" --scan-only --no-config --json \
      > "${tmp}/scan.json" 2>/dev/null || true; then :; fi

  if [ -s "${tmp}/scan.json" ]; then
    index=$((index + 1))
    cp "${tmp}/scan.json" "${tmp}/entry-${index}.json"
    printf '%s\n' "${file}" > "${tmp}/entry-${index}.path"
  fi
done <<< "${changed}"

python3 "$(dirname "$0")/merge_pr_scan.py" "${tmp}" "${out_dir}/results.json"
