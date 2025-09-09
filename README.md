# TypeScript Library Starter Template

This repository provides a robust starter template for building TypeScript libraries, featuring a comprehensive development setup for building, testing, linting, and documentation. It leverages a monorepo structure for efficient management of multiple packages.

## ✨ Features

*   **TypeScript**: Strongly typed JavaScript for enhanced code quality and maintainability.
*   **Unbuild**: A powerful and flexible build system for TypeScript libraries, configured for clean builds and declaration generation.
*   **Vitest**: A fast and modern testing framework with built-in coverage reporting.
*   **Ultracite & Biome**: Integrated for lightning-fast formatting and linting, ensuring consistent code quality and adherence to best practices.
*   **Moon**: A high-performance monorepo management tool that orchestrates builds, tests, and other tasks across workspaces.
*   **Astro + Starlight**: A modern static site generator for creating beautiful, performant, and accessible documentation.

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v22 or later recommended)
*   [pnpm](https://pnpm.io/) (v8 or later recommended)

### Installation

1.  Clone the repository:
    ```bash
    pnpx giget gh:DanSnow/typescript-library-starter
    cd typescript-library-starter
    ```
2.  Install dependencies using pnpm:
    ```bash
    pnpm install
    ```

## 📦 Development

This project uses `moon` to manage tasks across the monorepo.

### Building the Library

To build the core library:

```bash
pnpm build # or moon run build
```

This command uses `unbuild` to compile the TypeScript source code into `dist/` directory.

### Running Tests

To run tests for the library:

```bash
pnpm test # or moon run test
```

This command uses `vitest` to execute tests and generate coverage reports.

### Linting and Formatting

This project uses `Biome` with `Ultracite` rules for code formatting and linting.

To check for linting issues and format the code:

```bash
pnpm biome check --write --unsafe
```

### Documentation

The documentation site is built with Astro and Starlight.

1.  To start the local development server for the documentation:
    ```bash
    cd docs
    pnpm dev
    ```
    The documentation will be available at `http://localhost:4321`.

2.  Documentation files are located in `docs/src/content/docs/`. You can add new `.md` or `.mdx` files here.

## 📂 Project Structure

```
.
├── docs/                 # Astro + Starlight documentation site
├── src/                  # Core library source code
│   ├── __tests__/        # Vitest test files
│   └── index.ts          # Main entry point for the library
├── biome.jsonc           # Biome configuration, extending Ultracite rules
├── build.confg.ts        # Unbuild configuration for library compilation
├── moon.yml              # Moon monorepo task runner configuration
├── package.json          # Root package.json with project metadata and scripts
├── pnpm-lock.yaml        # pnpm lockfile
├── pnpm-workspace.yaml   # pnpm workspace configuration for monorepo
├── tsconfig.json         # TypeScript configuration for the root project
└── vitest.config.ts      # Vitest configuration for testing
```

## 📄 License

This project is licensed under the [MIT License](LICENSE).
