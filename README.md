# Playwright Automation Framework

[![Playwright Tests](https://github.com/AndrewDobbinsQA/playwright-automation/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/AndrewDobbinsQA/playwright-automation/actions/workflows/playwright.yml)

![Playwright](https://raw.githubusercontent.com/AndrewDobbinsQA/AndrewDobbinsQA/main/assets/badges/playwright.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=flat&logo=githubactions&logoColor=white)

## Overview

An independently developed test automation framework using Playwright and TypeScript, targeting the Practice Software Testing Toolshop application through browser-based UI and REST API testing.

The project builds upon commercial test automation experience and demonstrates a practical approach to designing, developing and maintaining reliable, scalable and maintainable automated test suites.

The framework is being developed incrementally, with an emphasis on test reliability, reusable components, cross-browser coverage, reproducible test environments and continuous integration.

### Project Objectives

- Develop a maintainable and extensible test automation framework.
- Implement meaningful UI and API test coverage.
- Validate application functionality across multiple browser engines.
- Establish a reproducible Docker-based test environment.
- Integrate automated testing into a continuous integration pipeline.
- Provide meaningful test reporting and failure diagnostics.
- Follow structured software development and version control practices.

## Application Under Test

The framework targets [Practice Software Testing – Toolshop](https://github.com/testsmith-io/practice-software-testing), an open-source e-commerce application designed for practising software testing.

The application provides functionality including:

- User authentication
- Product browsing
- Product search and filtering
- Shopping cart management
- Checkout
- REST API endpoints

The test environment uses a pinned revision of the Sprint 5 application to provide a consistent application baseline and reduce the risk of unexpected upstream changes.

## Technology Stack

| Technology | Purpose |
| --- | --- |
| Playwright Test | Test automation and execution |
| TypeScript | Strongly typed test and framework development |
| Node.js | JavaScript runtime |
| npm | Dependency management |
| dotenv | Environment variable configuration |
| Docker | Containerised application environment |
| Docker Compose | Application service orchestration |
| GitHub Actions | Continuous integration |
| Git | Version control |

## Framework Architecture

The framework uses the Page Object Model design pattern to separate page interactions from test scenarios.

Page objects encapsulate application locators and reusable interactions, allowing test specifications to focus on test intent, expected behaviour and assertions.

Reusable assertion helpers encapsulate common validation logic, reducing duplication across test specifications whilst keeping assertions separate from page interactions.

Parameterised test scenarios separate test data from execution logic, allowing multiple inputs and expected outcomes to be validated using a consistent test implementation.

### REST API Testing Architecture

The API layer uses Playwright's native `APIRequestContext` through a dedicated, browser-independent `api` project. API requests use a separate base URL and a centrally configured `Accept: application/json` header.

- `ProductsApi` encapsulates catalogue, detail, related product and search requests, including reusable pagination retrieval.
- TypeScript interfaces model endpoint-specific responses, shared product properties, generic pagination and nullable fields.
- Reusable assertions validate HTTP status codes, JSON content types, pagination metadata and product structures at runtime. TypeScript interfaces alone do not validate runtime responses.
- Product, category and brand identifiers are resolved dynamically from seeded data rather than hardcoded.
- Cross-endpoint comparisons validate product relationships, result completeness and uniqueness. Search validation includes both standard and rental catalogues.
- Focused spec files and parameterised scenarios keep functional coverage maintainable.

### Repository Structure

```text
playwright-automation/
├── .github/
│   └── workflows/
│       └── playwright.yml
├── api/
│   ├── assertions/
│   │   ├── api.assertions.ts
│   │   └── product.assertions.ts
│   ├── clients/
│   │   └── ProductsApi.ts
│   └── types/
│       └── product.types.ts
├── helpers/
│   └── assertions.ts
├── pages/
│   ├── LoginPage.ts
│   └── ProductsPage.ts
├── tests/
│   ├── api/
│   │   └── products/
│   │       ├── catalogue.spec.ts
│   │       ├── filtering.spec.ts
│   │       ├── price-filtering.spec.ts
│   │       ├── rental-filtering.spec.ts
│   │       ├── combined-filtering.spec.ts
│   │       ├── sorting.spec.ts
│   │       ├── details.spec.ts
│   │       ├── related.spec.ts
│   │       └── search.spec.ts
│   └── ui/
│       ├── auth.spec.ts
│       ├── homepage.spec.ts
│       └── products.spec.ts
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── playwright.config.ts
├── tsconfig.json
└── README.md
```

UI and API specifications are discovered independently by their respective Playwright projects.

### Design Principles

- Separation of test scenarios and reusable page interactions.
- Stable, meaningful element locators.
- Preference for semantic locators and dedicated test identifiers.
- Condition-based assertions using Playwright's auto-waiting capabilities.
- Explicit validation of positive and negative application behaviour.
- Parameterised testing to reduce duplication and improve coverage extensibility.
- Reusable assertion helpers for common validation requirements.
- Order-independent collection validation where result ordering is not a functional requirement.
- Environment-specific configuration separated from test logic.
- Strict TypeScript type checking.
- Runtime response validation and cross-endpoint data consistency checks.
- Explicit defect traceability for known expected failures.
- Incremental abstraction driven by genuine reuse requirements.

## Getting Started

### Prerequisites

- Git
- Node.js 24 (matching the CI environment)
- npm
- Docker and Docker Compose for local Toolshop provisioning

Ensure Docker is running before attempting to provision the local application environment.

### Installation

Clone the repository:

```bash
git clone https://github.com/AndrewDobbinsQA/playwright-automation.git
cd playwright-automation
```

Install the project dependencies:

```bash
npm ci
```

Install the supported Playwright browsers:

```bash
npx playwright install chromium firefox webkit
```

On supported Linux environments, browser system dependencies can also be installed using:

```bash
npx playwright install --with-deps chromium firefox webkit
```

## Environment Configuration

Create a local environment configuration file using the supplied template:

```bash
cp .env.example .env
```

Configure the following environment variables:

| Variable | Description |
| --- | --- |
| `BASE_URL` | Base URL of the Toolshop frontend. Optional; defaults to `http://localhost:4200`. |
| `API_BASE_URL` | Base URL of the Toolshop REST API. Optional; defaults to `http://localhost:8091`. |
| `TEST_USER_EMAIL` | Email address of a valid test user. |
| `TEST_USER_PASSWORD` | Password of the test user. |

Example configuration:

```dotenv
BASE_URL=http://localhost:4200
API_BASE_URL=http://localhost:8091
TEST_USER_EMAIL=your-test-email@example.com
TEST_USER_PASSWORD=your-test-password
```

### Test User Credentials

The Toolshop application provides predefined test user accounts.

Available test users and their credentials are documented in the [Practice Software Testing documentation](https://testsmith-io.github.io/practice-software-testing/#/).

Select a suitable test user and configure the corresponding email address and password in your local `.env` file.

The supplied credentials must correspond to a valid account in the target application environment. When using a locally provisioned Toolshop instance, ensure the database has been seeded before executing authentication tests.

### Credential Management

Local environment files are excluded from version control. CI credentials are supplied through GitHub Actions secrets.

Credentials should not be hardcoded in test specifications or committed to the repository.

## Test Environment

The framework targets a locally running Toolshop application by default.

A dedicated application environment provides a consistent application baseline, predictable seeded test data, reduced reliance on external services and isolation from other users of the publicly hosted application.

Both local development and continuous integration use the same pinned revision of the Sprint 5 application.

### Application Architecture

The Docker-based application environment consists of the following services:

| Service | Purpose |
| --- | --- |
| Angular | Application frontend |
| Laravel | Application REST API |
| MariaDB | Application database |
| Nginx | Web server and request routing |
| phpMyAdmin | Database administration interface |

Additional services provided by the upstream Toolshop repository, including Cron and Mailcatcher, are not required for the current automated test coverage.

### Initial Application Setup

The following provisioning sequence is intended for a fresh Toolshop installation and follows the implementation validated in GitHub Actions.

Clone the Toolshop repository into a separate directory alongside the automation repository:

```bash
cd ..
git clone https://github.com/testsmith-io/practice-software-testing.git
cd practice-software-testing
```

The resulting directory structure should resemble:

```text
Projects/
├── playwright-automation/
└── practice-software-testing/
```

Check out the pinned application revision:

```bash
git checkout ae7caecb811dd8952c09d997e69be7cb946ecd44
```

Configure the Sprint 5 application environment:

```bash
echo "SPRINT=sprint5" > .env
```

This configuration file belongs to the Toolshop repository and is separate from the automation framework's `.env` file.

Start the database and Laravel API containers:

```bash
docker compose up -d --build mariadb laravel-api
```

Install the PHP dependencies:

```bash
docker compose run --rm composer
```

Configure the Laravel directory permissions:

```bash
docker compose exec -T -u root laravel-api sh -c \
  'chown -R 1000:82 storage bootstrap/cache'
```

Verify that the required directories are writable:

```bash
docker compose exec -T laravel-api sh -c \
  'test -w storage/logs && test -w storage/framework/views && test -w bootstrap/cache && echo "Laravel directories are writable"'
```

Check that the database is ready before proceeding:

```bash
docker compose exec -T mariadb mariadb-admin ping --silent
```

If the database is not yet responding, wait briefly and repeat the command.

Execute the database migrations and seed the application with test data:

```bash
docker compose exec -T laravel-api php artisan migrate --force
docker compose exec -T laravel-api php artisan db:seed --force
```

Start the remaining application services:

```bash
docker compose up -d --build phpmyadmin web angular-ui
```

The upstream Nginx configuration references the phpMyAdmin service, so it is included in the provisioning process even though it is not directly required by the automated tests.

Allow sufficient time for the frontend to compile and the application services to become available.

### Application Readiness

Verify that the frontend and API are accessible:

| Service | URL |
| --- | --- |
| Toolshop frontend | http://localhost:4200 |
| Toolshop API | http://localhost:8091 |
| API documentation | http://localhost:8091/api/documentation |

Application readiness can also be checked from the command line:

```bash
curl --fail --silent --output /dev/null http://localhost:4200/
curl --fail --silent --output /dev/null http://localhost:8091/products
```

Both commands should complete successfully.

Check the status of the application containers:

```bash
docker compose ps
```

If the application is not responding as expected, inspect the relevant container logs:

```bash
docker compose logs --tail=50 web
docker compose logs --tail=50 angular-ui
docker compose logs --tail=50 laravel-api
docker compose logs --tail=50 mariadb
```

Once the application is available, return to the automation repository:

```bash
cd ../playwright-automation
```

Ensure the automation framework's environment variables are configured before executing the tests.

### Managing the Local Environment

The initial provisioning process does not need to be repeated before every test execution.

#### Daily Shutdown

From the Toolshop repository, stop the existing application containers:

```bash
cd ~/Projects/practice-software-testing
docker compose stop
```

Adjust the path to match your local checkout. Once the containers have stopped, Docker Desktop can be quit if it is no longer required.

#### Daily Startup

On macOS, start Docker Desktop:

```bash
open -a Docker
```

Wait for the Docker engine to become available. Verify readiness using:

```bash
docker info
```

On other platforms, start the Docker engine using the appropriate platform-specific procedure.

Restart the existing application containers:

```bash
cd ~/Projects/practice-software-testing
docker compose start
docker compose ps
```

Repeat the frontend and API readiness checks described above before running tests. Return to the automation repository when the application is ready.

`docker compose stop` preserves the existing containers and database data. Migrations and seeding do not need to be repeated during normal daily restarts. `docker compose down` removes containers and networks, while `docker compose down -v` can also remove database volumes and their data. Avoid these commands for routine shutdown when preserving the existing environment is the objective.

### Platform Compatibility

The provisioning sequence above follows the implementation validated by GitHub Actions on Ubuntu.

Local test execution has also been validated against a Docker-based Toolshop environment on macOS using Chromium and WebKit. The existing macOS environment uses a simplified Nginx configuration that does not require phpMyAdmin.

The exact initial provisioning sequence documented above has not yet been independently validated from a fresh installation on macOS. Host-specific Docker configuration and filesystem permissions may require adjustments depending on the operating system.

The automation framework does not currently start the application automatically during local test execution.

## Running Tests

Ensure the Toolshop application is running and the required environment variables are configured before executing the test suite.

All commands in this section should be executed from the automation repository.

### Execute the Complete Test Suite

```bash
npx playwright test
```

The complete suite includes all three UI browser projects and the dedicated API project.

### Execute UI Tests Only

```bash
npx playwright test --project=chromium --project=firefox --project=webkit
```

### Execute API Tests Only

```bash
npx playwright test --project=api
```

The current read-only product API tests do not require browser installation or test user credentials. The target API must be running.

### Execute Tests Against a Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Execute Tests Against Multiple Browsers

```bash
npx playwright test --project=chromium --project=webkit
```

### Execute a Specific Test File

```bash
npx playwright test tests/ui/auth.spec.ts
```

To execute a specific API spec file:

```bash
npx playwright test --project=api tests/api/products/search.spec.ts
```

### Execute Tests in Headed Mode

```bash
npx playwright test --project=chromium --headed
```

### Launch Playwright UI Mode

```bash
npx playwright test --ui
```

### Debug Tests

```bash
npx playwright test --debug
```

### Perform TypeScript Type Checking

```bash
npx tsc --noEmit
```

## Cross-Browser Testing

The framework currently supports three desktop browser projects.

| Browser Engine | Playwright Project |
| --- | --- |
| Chromium | `chromium` |
| Firefox | `firefox` |
| WebKit | `webkit` |

Each implemented UI test scenario is executed against all three browser engines by default.

This provides coverage across the major browser engines without requiring separate browser-specific test implementations.

Local browser compatibility may vary depending on the host operating system and Playwright version. Individual browser projects can be executed independently when required.

The GitHub Actions workflow is configured to execute all three UI browser projects and the browser-independent API project. API scenarios are executed once per suite rather than once per browser.

## Current Test Coverage

### Homepage

| Scenario | Validation |
| --- | --- |
| Homepage loads successfully | Expected URL and application branding are displayed. |

### Authentication

| Scenario | Validation |
| --- | --- |
| Login with invalid credentials | Login is rejected and the expected error message is displayed. |
| Login with empty required fields | Required field validation messages are displayed. |
| Login with valid credentials | The user is redirected to the account page and the expected heading is displayed. |

### Product Search

| Scenario | Validation |
| --- | --- |
| Search for products using a matching search term (`pliers`) | Four expected products are returned and the search confirmation and result count are correct. |
| Search for products using a partial search term (`ham`) | Seven expected products are returned, validating partial search functionality. |
| Search for a single matching product (`sledgehammer`) | The expected product is returned and the singular result count message is displayed. |
| Search for a nonexistent product | Zero products are returned and the expected no-results message is displayed. |

All product search scenarios also validate the search confirmation, result count and clearing of the search input following submission.

### Category Filtering

| Scenario | Validation |
| --- | --- |
| Filter products by the Pliers category | The category checkbox is selected and the five expected products are returned. |
| Filter products by the Hammer category | The category checkbox is selected and the seven expected products are returned. |

Successful search and category filtering scenarios validate both the number of returned products and the exact collection of product names, independently of their displayed order.

Expected product data is based on the seeded dataset provided by the pinned Toolshop application revision.

### REST API – Product Catalogue

| Endpoint / functional area | Spec file | Scenarios | Validation |
| --- | --- | ---: | --- |
| GET /products – Catalogue | `catalogue.spec.ts` | 7 | Response structure, pagination boundaries and unique product IDs across pages |
| GET /products – Category and brand filtering | `filtering.spec.ts` | 6 | Expected products, filter relationships and nonexistent identifiers |
| GET /products – Price filtering | `price-filtering.spec.ts` | 6 | Inclusive boundaries, complete paginated results and invalid ranges |
| GET /products – Rental filtering | `rental-filtering.spec.ts` | 6 | Rental flags, expected products and category interactions |
| GET /products – Combined filtering | `combined-filtering.spec.ts` | 3 | Category, brand and price filter intersections, including empty results |
| GET /products – Sorting | `sorting.spec.ts` | 4 | Ascending and descending name and price ordering across the complete catalogue |
| GET /products/{productId} | `details.spec.ts` | 3 | Catalogue consistency, specifications and HTTP 404 for invalid identifiers |
| GET /products/{productId}/related | `related.spec.ts` | 4 | Category relationships, source exclusion, uniqueness and invalid identifiers (two expected failures) |
| GET /products/search | `search.spec.ts` | 14 | Exact and partial matches, case, whitespace, empty results, pagination and completeness across standard and rental catalogues |
| **Total** | | **53** | |

The API suite validates status codes, JSON content types, response structures and expected seeded product data as appropriate to each scenario.

### Coverage Summary

| Metric | Current Coverage |
| --- | ---: |
| UI test scenarios | 10 |
| API test scenarios | 53 |
| Total distinct test scenarios | 63 |
| Browser engines | 3 |
| UI test executions | 30 |
| API test executions | 53 |
| Total configured test executions | 83 |

The configured execution count excludes retries. The API suite includes two expected failures associated with known defect [#12](https://github.com/AndrewDobbinsQA/playwright-automation/issues/12). The latest local API regression completed with 51 conventional passes and two expected failures, with no unexpected failures.

## Continuous Integration

The framework uses GitHub Actions to automatically execute the test suite on pushes to `main` and pull requests targeting `main`.

The CI workflow provisions a dedicated application environment rather than relying on the publicly hosted Toolshop application.

The complete workflow configuration is available in [playwright.yml](.github/workflows/playwright.yml).

### CI Workflow

1. Check out the automation repository.
2. Check out the pinned Toolshop application revision.
3. Configure the Sprint 5 application environment.
4. Start the MariaDB database and Laravel API containers.
5. Install PHP dependencies.
6. Configure and validate Laravel directory permissions.
7. Wait for database readiness.
8. Execute database migrations and seed test data.
9. Start the phpMyAdmin, frontend and web server containers.
10. Validate frontend and API readiness.
11. Configure Node.js and install automation dependencies.
12. Perform TypeScript type checking.
13. Install Playwright browsers and system dependencies.
14. Execute the UI and API test projects.
15. Upload the Playwright HTML report.

### CI Configuration

| Setting | Configuration |
| --- | --- |
| Runner | Ubuntu |
| Node.js version | 24 |
| Browser engines | Chromium, Firefox and WebKit |
| API project | `api` (browser-independent) |
| Test workers | 1 |
| Failed test retries | 2 |
| Job timeout | 60 minutes |
| Report retention | 30 days |

### Application Provisioning

The Toolshop application is provisioned from a pinned upstream revision for each CI workflow execution.

The database is migrated and seeded before the automated tests are executed, providing a consistent initial application state.

The workflow includes readiness checks for both the frontend and REST API, ensuring the application is available before test execution begins.

If application provisioning fails, diagnostic information is collected to support investigation.

Using a dedicated, seeded application environment reduces external dependencies and improves test execution repeatability.

### GitHub Actions Secrets

The workflow uses the following repository secrets to supply authentication credentials:

| Secret | Purpose |
| --- | --- |
| `TEST_USER_EMAIL` | Email address of a valid test user |
| `TEST_USER_PASSWORD` | Password of the test user |

These secrets are passed to the test execution environment without exposing credentials in the workflow configuration.

Anyone configuring CI in their own copy of the repository should create the corresponding secrets under **Settings → Secrets and variables → Actions**.

## Reporting and Failure Diagnostics

### HTML Reports

Playwright generates an HTML report containing test execution results.

To open the latest local report:

```bash
npx playwright show-report
```

CI reports are uploaded as workflow artifacts and retained for 30 days.

To access a CI report:

1. Navigate to the repository's Actions tab.
2. Select the relevant Playwright Tests workflow execution.
3. Download the `playwright-report` artifact.
4. Extract the downloaded archive.
5. Open the extracted report using Playwright's report viewer.

### Trace Collection

Playwright is configured to collect a trace on the first retry of a failed test.

Traces support failure investigation through information including:

- Test execution timelines
- Browser interactions
- DOM snapshots
- Network activity
- Console output

Retries are enabled in CI. Local execution uses zero retries by default.

### Expected Failures and Defect Traceability

The related products endpoint currently returns HTTP 500 instead of the documented HTTP 404 for nonexistent and malformed product identifiers ([#12](https://github.com/AndrewDobbinsQA/playwright-automation/issues/12)).

The two negative regression scenarios retain assertions for the documented HTTP 404 response and error body. Before applying a conditional `test.fail()` annotation, they verify the JSON content type and, for HTTP 500, the known error message. The annotation links directly to the defect in the HTML report.

This approach keeps the known failure visible without blocking unrelated regression coverage. Unexpected statuses or failures before the annotation are not treated as the known defect. If the endpoint starts returning the correct response, the conditional annotation is not applied and the test can pass normally; the annotation should then be reviewed and removed as part of defect resolution.

Expected failures are included in Playwright's successful outcome count and should not be interpreted as conventional passes.

### Application Diagnostics

If the Toolshop application fails its readiness checks during CI provisioning, the workflow collects diagnostic information including:

- Frontend and API HTTP response codes
- Nginx container logs
- Angular container logs
- Laravel container logs
- Laravel application logs
- Docker Compose service status

These diagnostics help distinguish application provisioning failures from automated test failures and reduce the effort required to investigate unsuccessful workflow executions.

## Exploratory Testing and Defect Management

Exploratory testing using Swagger UI, browser interactions and command-line HTTP requests informed the automated coverage. Findings are tracked separately from framework implementation, with documented evidence, impact, acceptance criteria and severity for bugs.

| Issue | Finding | Classification |
| --- | --- | --- |
| [#12](https://github.com/AndrewDobbinsQA/playwright-automation/issues/12) | Related products returns HTTP 500 for invalid identifiers | Bug – Medium |
| [#13](https://github.com/AndrewDobbinsQA/playwright-automation/issues/13) | Invalid sorting and price filter fields return HTTP 500 | Bug – Medium |
| [#14](https://github.com/AndrewDobbinsQA/playwright-automation/issues/14) | Missing required search parameter accepted | Bug – Low |
| [#15](https://github.com/AndrewDobbinsQA/playwright-automation/issues/15) | Hammer search excludes Sledgehammer | Bug – Medium |
| [#16](https://github.com/AndrewDobbinsQA/playwright-automation/issues/16) | Rental filtering documentation clarification | Task |
| [#17](https://github.com/AndrewDobbinsQA/playwright-automation/issues/17) | Response schema and example alignment | Task |

Regression coverage for #12 asserts the documented contract. Further regression scenarios for other findings are deferred until intended behaviour is established, avoiding assertions that encode unsupported assumptions. Documentation tasks distinguish observed response differences from confirmed formal schema violations.

## Development Workflow

Development follows a structured, issue-driven workflow:

1. Create a GitHub issue with defined scope and acceptance criteria.
2. Create a dedicated development branch.
3. Implement and locally validate the changes.
4. Commit changes using meaningful conventional commit messages.
5. Create a pull request referencing the associated issue.
6. Validate the changes through GitHub Actions.
7. Review and merge the pull request into `main`.
8. Remove completed development branches.

The project uses GitHub Issues and GitHub Projects to track development progress and planned enhancements.

## Development Roadmap

The framework is under active development.

### Implemented

- [x] Initial Playwright and TypeScript framework
- [x] Page Object Model
- [x] Environment variable configuration
- [x] Homepage smoke test
- [x] Positive and negative authentication tests
- [x] Product search and filtering tests
- [x] Parameterised UI test scenarios
- [x] Reusable assertion helpers
- [x] Order-independent product collection validation
- [x] Cross-browser test execution
- [x] Docker-based CI test environment
- [x] GitHub Actions integration
- [x] TypeScript validation
- [x] HTML reporting and trace configuration
- [x] Initial project documentation
- [x] Dedicated REST API project and environment configuration
- [x] Reusable API client, typed response models and layered assertions
- [x] Product catalogue, detail, related product and search API coverage
- [x] Cross-endpoint data consistency validation
- [x] Expected failure handling and defect traceability

### Planned

- [ ] Authentication API test coverage
- [ ] Payment API test coverage
- [ ] Combined UI and API test scenarios
- [ ] Database validation using MariaDB
- [ ] Shopping cart functionality tests
- [ ] End-to-end checkout scenarios
- [ ] Reusable fixtures and test data management
- [ ] Framework refinement and reusable components
- [ ] Enhanced reporting and failure diagnostics
- [ ] Accessibility and performance testing exploration

The roadmap prioritises meaningful test coverage and maintainability over test volume.

## Author

**Andrew Dobbins**

Senior Test Engineer | Test Automation Engineer

[GitHub Profile](https://github.com/AndrewDobbinsQA) · [LinkedIn](https://www.linkedin.com/in/andrewdobbinsqa/)