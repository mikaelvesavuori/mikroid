# MikroID

**A lightweight, customizable ID generator with zero dependencies**.

[![npm version](https://img.shields.io/npm/v/mikroid.svg)](https://www.npmjs.com/package/mikroid)

[![bundle size](https://img.shields.io/bundlephobia/minzip/mikroid)](https://bundlephobia.com/package/mikroid)

![Build Status](https://github.com/mikaelvesavuori/mikroid/workflows/main/badge.svg)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

MikroID generates unique, customizable identifiers for your applications with cryptographically secure randomness. It's tiny (< 1KB minified and gzipped), has zero dependencies, and supports a more random (and more economical format) than UUID v4 and NanoID (using `extended` character set). Also includes box-ready alphanumeric and hex formats for such use-cases.

- **Secure**: Uses crypto-secure randomness
- **Lightweight**: Less than 1KB minified and gzipped
- **Zero dependencies**: No external libraries required
- **Customizable**: Multiple ID styles and configurations
- **URL-safe option**: Generate IDs safe for URLs
- **TypeScript support**: Full type definitions included
- **Reusable configurations**: Create and reuse custom ID formats

## Installation

```bash
npm install mikroid -S
```

## Usage

### Quick Start

```typescript
import { MikroID } from 'mikroid';

// Create a new instance
const mikroid = new MikroID();

// Generate a default ID (16 chars, extended character set style with URL-safe chars)
const id = mikroid.create();
// => "FgH5_xT~1b3wK.7p"

// Generate a shorter ID
const shortId = mikroid.create(8);
// => "j4Kw~m1."

// Generate an alphanumeric ID
const alphaId = mikroid.create(12, 'alphanumeric');
// => "a7Bz9X3KpL2q"

// Generate a hex ID in lowercase
const alphaId = mikroid.create(16, 'hex', true);
// => "69ae1f9de761cebf"

// Generate a lowercase-only ID
const lowerId = mikroid.create(10, 'extended', true);
// => "b3k_p7~r9w"

// Generate a non-URL-safe ID with special characters
const specialId = mikroid.create(12, 'extended', false, false);
// => "Ab3$K~p+r9w:"
```

### Custom configurations

```typescript
import { MikroID } from 'mikroid';

const mikroid = new MikroID();

// Add a custom configuration
mikroid.add({
  name: 'user-id',
  length: 10,
  style: 'alphanumeric',
  onlyLowerCase: true
});

// Generate IDs using this configuration
const userId = mikroid.custom('user-id');
// => "a7b3k9p7r9"

// Add another configuration
mikroid.add({
  name: 'session-id',
  length: 32,
  style: 'extended',
  urlSafe: true
});

// Generate session IDs
const sessionId = mikroid.custom('session-id');
// => "KwM1p3Tx_r.7B~gL5fZ9jH2qN8vD6-yA"
```

### Pre-configured instance

```typescript
import { MikroID } from 'mikroid';

// Create with pre-configured options
const mikroid = new MikroID({
  'short-id': {
    name: 'short-id',
    length: 8,
    style: 'alphanumeric',
    onlyLowerCase: false
  },
  'api-key': {
    name: 'api-key',
    length: 24,
    style: 'extended',
    urlSafe: true
  }
});

// Use pre-configured options
const shortId = mikroid.custom('short-id');
const apiKey = mikroid.custom('api-key');
```

## Character sets

MikroID uses the following character sets based on the configuration:

### Alphanumeric

- `onlyLowerCase: false`: A-Z, a-z, 0-9
- `onlyLowerCase: true`: a-z, 0-9

### Extended

- `urlSafe: true`, `onlyLowerCase: false`: A-Z, a-z, 0-9, -._~
- `urlSafe: true`, `onlyLowerCase: true`: a-z, 0-9, -._~
- `urlSafe: false`, `onlyLowerCase: false`: A-Z, a-z, 0-9, -._~!$()*+,;=:
- `urlSafe: false`, `onlyLowerCase: true`: a-z, 0-9, -._~!$()*+,;=:

### Hex

- `onlyLowerCase: false`: A-F, a-f, 0-9
- `onlyLowerCase: true`: a-f, 0-9

## API Reference

### MikroID Class

#### Constructor

```typescript
constructor(options?: MikroIDOptions)
```

Creates a new MikroID instance with optional pre-configured options.

#### Methods

##### create

```typescript
create(length?: number, style?: IdStyle, onlyLowerCase?: boolean, urlSafe?: boolean): string
```

Generates a new ID with the specified parameters.

- `length` (optional): Length of the generated ID. Default: 16
- `style` (optional): Style of the ID ('alphanumeric', 'hex', or 'extended'). Default: 'extended'
- `onlyLowerCase` (optional): Whether to use only lowercase letters. Default: false
- `urlSafe` (optional): Whether to use only URL-safe characters. Default: true

##### add

```typescript
add(config: IdConfigurationOptions): void
```

Adds a new ID configuration to the options collection.

- `config`: Configuration object with at least the `name` property

##### remove

```typescript
remove(config: IdConfiguration): void
```

Removes an existing ID configuration from the options collection.

- `config`: Configuration object with at least the `name` property

##### custom

```typescript
custom(name: string): string
```

Creates a new ID using a named configuration.

- `name`: Name of the configuration to use

### Types

All types are exported.

```typescript
type IdStyle = 'alphanumeric' | 'extended';

type IdConfiguration = {
  name: string;
  length: number;
  onlyLowerCase: boolean;
  style?: IdStyle;
  urlSafe?: boolean;
};

type IdConfigurationOptions = Partial<IdConfiguration>;

type MikroIDOptions = {
  [name: string]: IdConfiguration;
};
```

## Security

MikroID uses cryptographically secure random generation via the Node.js `crypto` module.

## Comparison with similar libraries

| Feature                        | MikroID | nanoid | uuid (v4) |
|--------------------------------|---------|--------|-----------|
| Size (gzip)                    | <1KB    | <1KB   | <1KB      |
| Dependencies                   | 0       | 0      | 0         |
| Secure                         | ✓       | ✓      | ✓         |
| URL-safe (default or optional) | ✓       | ✓      | ✓         |
| Alphabet options               | ✓       | ✓      | ✗         |
| Named configs                  | ✓       | ✗      | ✗         |

## License

MIT. See the `LICENSE` file.
