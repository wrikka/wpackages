# Stage 1: Build the application
FROM rust:1.75 as builder

# Install build dependencies
WORKDIR /usr/src/browser-use
COPY . .

# Install browser dependencies
RUN apt-get update && apt-get install -y libatk1.0-0 libatk-bridge2.0-0 libcups2 libxkbcommon-x11-0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2

# Build the daemon
RUN cargo build --release --bin browser-use-daemon

# Stage 2: Create the final image
FROM debian:bullseye-slim

# Install browser dependencies
RUN apt-get update && apt-get install -y libatk1.0-0 libatk-bridge2.0-0 libcups2 libxkbcommon-x11-0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2 && rm -rf /var/lib/apt/lists/*

# Copy the built binary from the builder stage
COPY --from=builder /usr/src/browser-use/target/release/browser-use-daemon /usr/local/bin/browser-use-daemon

# Expose the port the daemon listens on
EXPOSE 8080
EXPOSE 9090

# Run the daemon
ENTRYPOINT ["browser-use-daemon"]
CMD ["--addr", "0.0.0.0:8080"]
