FROM python:3.12-slim

ARG TARGETARCH

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Hadolint publishes per-arch Linux binaries; map Docker's TARGETARCH to its naming.
RUN case "${TARGETARCH}" in \
      amd64) HADOLINT_ARCH="x86_64" ;; \
      arm64) HADOLINT_ARCH="arm64" ;; \
      *) echo "Unsupported architecture: ${TARGETARCH}" >&2; exit 1 ;; \
    esac \
    && curl -sL -o /usr/local/bin/hadolint "https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-${HADOLINT_ARCH}" \
    && chmod +x /usr/local/bin/hadolint

# Trivy's install script already resolves the correct release asset per architecture.
RUN curl -sfL https://raw.githubusercontent.com/aquasec/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir .

WORKDIR /workspace

ENTRYPOINT ["docksec"]
CMD ["--help"]
