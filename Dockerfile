FROM oven/bun:1-debian AS builder
WORKDIR /app

# Copy dependency files first for better layer caching
COPY package.json bun.lock tsconfig.json  ./

# Install dependencies
RUN bun install

# Copy all source files needed for build
COPY . .

# Build the application
RUN bun run build

# Runtime stage
FROM oven/bun:1-debian AS runner
WORKDIR /app

# Don't run under root
RUN groupadd --system --gid 1001 user && \
    useradd --system --uid 1001 --gid user user

# Copy the built output folder
COPY --from=builder --chown=user:user /app/.output .output

# Copy migration files for auto-migration
COPY --from=builder --chown=user:user /app/drizzle drizzle

# Switch to non-root user
USER user

# Expose port 3000
EXPOSE 3000

# # Health check - use a simple check that allows for redirects
# HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
#   CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || wget --no-verbose --tries=1 -O /dev/null http://localhost:3000/ || exit 1

# Run the application
CMD ["bun", ".output/server/index.mjs"]
