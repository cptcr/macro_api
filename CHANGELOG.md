# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.html).

## [3.0.0] - 2025-06-10

This is a major feature release, introducing several new service integrations and a complete overhaul of the core architecture to improve performance, developer experience, and reliability.

### Added

#### New API Integrations

- **Stripe:** Added a comprehensive module for the Stripe API.
  - Includes methods for creating payment intents, managing customers, and handling subscriptions.

- **Slack:** Added support for the Slack API.
  - Includes methods for sending messages to channels and users, creating rich message blocks, and managing conversations.

- **SendGrid:** Added a module for the SendGrid API.
  - Includes methods for sending transactional emails using dynamic templates and managing contact lists.

- **Vercel:** Added support for the Vercel API to enable CI/CD and deployment workflows.
  - Includes methods for triggering deployments, listing projects, and managing deployment domains.

- **AWS S3:** Added a powerful module for Amazon S3.
  - Includes methods for uploading, downloading, and deleting objects, as well as listing bucket contents.

- **Docker Hub:** Added support for the Docker Hub API.
  - Includes methods for inspecting repository details, listing image tags, and checking image metadata.

#### Architectural & DevOps Enhancements

- **Intelligent Caching System:**
  - Implemented a new caching layer to reduce redundant API calls and improve performance.
  - Supports a default in-memory cache for ease of use.
  - Supports optional integration with external Redis instances for distributed applications.

- **Standardized Error Framework:**
  - Introduced a hierarchy of custom error classes (`AuthenticationError`, `RateLimitError`, `NotFoundError`, `ServiceUnreachableError`) that extends a base `MacroApiError`. This provides consistent and predictable error handling across all integrations.

- **Enterprise-Grade Request Management:**
  - Implemented an automatic retry mechanism with exponential backoff for handling transient network errors.
  - Added request batching capabilities for select APIs (e.g., AWS S3 object deletion) to improve bulk operation performance.

- **CI/CD & Quality Assurance:**
  - Integrated a full CI/CD pipeline using GitHub Actions to automate testing, linting, and package publishing, ensuring higher code quality and reliability.

### Changed

- **BREAKING CHANGE:** The initialization process for all API clients has been standardized to accommodate new features like caching and request management. Please consult the documentation for updated configuration options.

# [ READ WHOLE CHANGELOG ](https://www.cptcr.dev/blog/macro-api-v3-update)