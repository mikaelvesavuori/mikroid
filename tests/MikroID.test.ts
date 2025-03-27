import { beforeEach, describe, expect, test } from 'vitest';

import { MikroID } from '../src/MikroID';

let id: MikroID;

beforeEach(() => {
  id = new MikroID();
});

describe('Initialization', () => {
  test('It should create an instance with default options', () => {
    const id = new MikroID();
    expect(id).toBeInstanceOf(MikroID);
  });

  test('It should create an instance with provided options', () => {
    const options = {
      'test-config': {
        name: 'test-config',
        length: 8,
        onlyLowerCase: true
      }
    };

    const id = new MikroID(options);
    expect(id).toBeInstanceOf(MikroID);

    const result = id.custom('test-config');
    expect(result).toHaveLength(8);
    expect(result).toMatch(/^[a-z0-9\-._~]+$/);
  });
});

describe('Add a configuration', () => {
  test('It should add a valid configuration', () => {
    id.add({ name: 'test-config', length: 10, onlyLowerCase: true });
    const result = id.custom('test-config');
    expect(result).toHaveLength(10);
    expect(result).toMatch(/^[a-z0-9\-._~]+$/);
  });

  test('It should throw when adding a configuration without a name', () => {
    expect(() => id.add({ length: 10 })).toThrow(
      'Missing name for the ID configuration'
    );
  });

  test('It should override an existing configuration', () => {
    id.add({ name: 'test-config', length: 10, onlyLowerCase: true });
    id.add({ name: 'test-config', length: 20, onlyLowerCase: false });
    const result = id.custom('test-config');
    expect(result).toHaveLength(20);
    expect(result).toMatch(/^[A-Za-z0-9\-._~]+$/);
  });

  test('It should use default values for missing properties', () => {
    id.add({ name: 'minimal-config' });
    const result = id.custom('minimal-config');
    expect(result).toHaveLength(16);
    expect(result).toMatch(/^[A-Za-z0-9\-._~]+$/);
  });

  test('It should respect false values for onlyLowerCase', () => {
    id.add({ name: 'false-config', onlyLowerCase: false });
    const uppercase = /[A-Z]/;
    id.custom('false-config');

    let hasUppercase = false;

    for (let i = 0; i < 10; i++) {
      if (uppercase.test(id.custom('false-config'))) {
        hasUppercase = true;
        break;
      }
    }

    expect(hasUppercase).toBe(true);
  });

  test('It should retain configurations across method calls', () => {
    const id = new MikroID();
    id.add({ name: 'config1', length: 8 });
    id.add({ name: 'config2', length: 12 });

    // Check both configs work
    expect(id.custom('config1')).toHaveLength(8);
    expect(id.custom('config2')).toHaveLength(12);

    // Remove one config
    id.remove({ name: 'config1', length: 8, onlyLowerCase: false });

    // Check config2 still works and config1 is gone
    expect(() => id.custom('config1')).toThrow();
    expect(id.custom('config2')).toHaveLength(12);
  });
});

describe('Remove a configuration', () => {
  let id: MikroID;

  beforeEach(() => {
    id = new MikroID();
    id.add({ name: 'test-config' });
  });

  test('It should remove an existing configuration', () => {
    id.remove({ name: 'test-config', length: 16, onlyLowerCase: false });
    expect(() => id.custom('test-config')).toThrow(
      'No configuration found with name: test-config'
    );
  });

  test('It should throw when removing a configuration without a name', () => {
    // @ts-expect-error Testing invalid input
    expect(() => id.remove({ length: 10 })).toThrow(
      'Missing name for the ID configuration'
    );
  });

  test('It should not throw when removing a non-existent configuration', () => {
    expect(() =>
      id.remove({ name: 'non-existent', length: 16, onlyLowerCase: false })
    ).not.toThrow();
  });
});

describe('Create an ID', () => {
  test('It should create an ID with default parameters', () => {
    const result = id.create();
    expect(result).toHaveLength(16);
    expect(result).toMatch(/^[A-Za-z0-9\-._~]+$/);
  });

  test('It should create an ID with custom length', () => {
    const result = id.create(8);
    expect(result).toHaveLength(8);
  });

  test('It should create an alphanumeric ID', () => {
    const result = id.create(16, 'alphanumeric');
    expect(result).toMatch(/^[A-Za-z0-9]+$/);
  });

  test('It should create a hex ID', () => {
    const result = id.create(16, 'hex');
    expect(result).toMatch(/^[a-fA-F0-9]+$/);
  });

  test('It should create an extended ID', () => {
    const result = id.create(16, 'extended');
    expect(result).toMatch(/^[A-Za-z0-9\-._~]+$/);
  });

  test('It should create a lowercase-only alphanumeric ID', () => {
    const result = id.create(16, 'extended', true);
    expect(result).toMatch(/^[a-z0-9\-._~]+$/);
    expect(result).not.toMatch(/[A-Z]/);
  });

  test('It should create a lowercase-only hex ID', () => {
    const result = id.create(16, 'hex', true);
    expect(result).toMatch(/^[a-f0-9]+$/);
    expect(result).not.toMatch(/[A-F]/);
  });

  test('It should create an extended ID with URL-safe characters', () => {
    const result = id.create(16, 'extended', true, false);
    expect(result).toMatch(/^[a-z0-9\-._~!$'()*+,;=:]+$/);
  });

  test('It should create a non-URL-safe ID when specified', () => {
    id.create(100, 'extended', false, false);

    let foundSpecialChar = false;

    for (let i = 0; i < 10; i++) {
      const _id: any = id.create(100, 'extended', false, false);
      if (/[!$'()*+,;=:]/.test(_id)) {
        foundSpecialChar = true;
        break;
      }
    }

    expect(foundSpecialChar).toBe(true);
  });

  test('It should create a URL-safe ID', () => {
    const result = id.create(1000, 'extended', false, true);
    expect(result).not.toMatch(/[!$'()*+,;=:]/);
  });

  test('It should throw an error if using a negative ID length', () => {
    expect(() => id.create(-10)).toThrowError();
  });

  test('It should throw an error if using an unknown ID style', () => {
    // @ts-ignore
    expect(() => id.create(10, 'does_not_exist')).toThrowError();
  });
});

describe('Create a custom ID', () => {
  let id: MikroID;

  beforeEach(() => {
    id = new MikroID();
    id.add({ name: 'test-config', length: 12, style: 'alphanumeric' });
    id.add({ name: 'extended-config', style: 'extended', urlSafe: false });
    id.add({ name: 'lowercase-config', onlyLowerCase: true });
  });

  test('It should create an ID using an existing configuration', () => {
    const result = id.custom('test-config');
    expect(result).toHaveLength(12);
    expect(result).toMatch(/^[A-Za-z0-9]+$/);
  });

  test('It should throw when using a non-existent configuration', () => {
    expect(() => id.custom('non-existent')).toThrow(
      'No configuration found with name: non-existent'
    );
  });

  test('It should create an ID with non-URL-safe characters when specified', () => {
    let foundSpecialChar = false;

    for (let i = 0; i < 10; i++) {
      const result = id.custom('extended-config');
      if (/[!$'()*+,;=:]/.test(result)) {
        foundSpecialChar = true;
        break;
      }
    }

    expect(foundSpecialChar).toBe(true);
  });

  test('It should create a lowercase-only ID when specified', () => {
    const result = id.custom('lowercase-config');
    expect(result).not.toMatch(/[A-Z]/);
  });
});

describe('Character sets', () => {
  test('It should only include alphanumeric characters in alphanumeric style', () => {
    const result = id.create(1000, 'alphanumeric');
    expect(result).toMatch(/^[A-Za-z0-9]+$/);
  });

  test('It should only include lowercase and numeric characters when onlyLowerCase is true', () => {
    const result = id.create(1000, 'alphanumeric', true);
    expect(result).toMatch(/^[a-z0-9]+$/);
    expect(result).not.toMatch(/[A-Z]/);
  });

  test('It should include URL-safe special characters in extended style with urlSafe true', () => {
    // Run several tests to increase chance of getting special chars
    let hasSpecialChars = false;
    for (let i = 0; i < 10; i++) {
      const result = id.create(100, 'extended', false, true);
      if (/[\-._~]/.test(result)) {
        hasSpecialChars = true;
        break;
      }
    }
    expect(hasSpecialChars).toBe(true);
  });

  test('It should include non-URL-safe special characters in extended style with urlSafe false', () => {
    // Run several tests to increase chance of getting special chars
    let hasNonUrlSafeChars = false;
    for (let i = 0; i < 10; i++) {
      const result = id.create(100, 'extended', false, false);
      if (/[!$'()*+,;=:]/.test(result)) {
        hasNonUrlSafeChars = true;
        break;
      }
    }
    expect(hasNonUrlSafeChars).toBe(true);
  });
});

describe('Edge cases', () => {
  test('It should handle zero length', () => {
    const result = id.create(0);
    expect(result).toHaveLength(16);
  });

  test('It should handle very large lengths', () => {
    const length = 1000;
    const result = id.create(length);
    expect(result).toHaveLength(length);
  });

  test('It should generate unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 1000; i++) {
      ids.add(id.create(16));
    }
    expect(ids.size).toBe(1000);
  });

  test('It should allow creating configurations with only required parameters', () => {
    id.add({ name: 'minimal' });
    expect(() => id.custom('minimal')).not.toThrow();
  });

  test('It should have a reasonably uniform distribution of characters', () => {
    // Generate a large sample ID
    const sample = id.create(10000);

    // Count character frequencies
    const charCount: Record<string, number> = {};
    for (const char of sample) {
      charCount[char] = (charCount[char] || 0) + 1;
    }

    // Get min and max frequencies
    const counts = Object.values(charCount);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);

    // Calculate ratio between max and min frequency
    // For reasonably uniform distribution, this shouldn't be too high
    const ratio = maxCount / minCount;
    expect(ratio).toBeLessThan(2); // Allowing for some variance
  });
});
