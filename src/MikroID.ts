import { getRandomValues } from 'node:crypto';

import type {
  IdConfiguration,
  IdConfigurationOptions,
  IdStyle,
  MikroIDOptions
} from './interfaces';

/**
 * @description MikroID generates unique, customizable identifiers
 * for your applications with cryptographically secure randomness.
 * It's tiny (< 1KB minified and gzipped), has zero dependencies,
 * and supports a more random (and more economical format)
 * than UUID v4 and NanoID.
 */
export class MikroID {
  private options: MikroIDOptions;
  private readonly defaultLength = 16;
  private readonly defaultOnlyLowerCase = false;
  private readonly defaultStyle: IdStyle = 'extended';
  private readonly defaultUrlSafe = true;

  constructor(options?: MikroIDOptions) {
    this.options = {};

    if (options) {
      for (const [name, config] of Object.entries(options)) {
        this.options[name] = this.generateConfig(config);
      }
    }
  }

  /**
   * @description Adds a new ID configuration to the options collection.
   * This allows for reusable ID configurations with custom settings.
   */
  public add(config: IdConfigurationOptions) {
    if (!config?.name) throw new Error('Missing name for the ID configuration');

    const cleanConfig = this.generateConfig(config);

    this.options[config.name] = cleanConfig;
  }

  /**
   * @description Removes an existing ID configuration from the options collection.
   * Use this to clean up configurations that are no longer needed.
   */
  public remove(config: IdConfiguration) {
    if (!config?.name) throw new Error('Missing name for the ID configuration');
    delete this.options[config.name];
  }

  /**
   * @description Creates a new ID.
   *
   * You may set an explicit `length` for the ID, or use the defaults provided.
   *
   * Optionally, `style` may be passed to specify the ID style (default is 'extended').
   * - 'extended': includes safe special characters for more unique combinations
   * - 'alphanumeric': uses only letters and numbers
   * - 'hex': uses only 0-9 and a-f (A-F)
   *
   * Optionally, `onlyLowerCase` may be passed which for alphanumeric
   * IDs will return a string that only uses numbers and lower-case letters.
   *
   * Optionally, `urlSafe` may be passed which determines whether to use
   * URL-safe characters only.
   *
   * @example
   * const mikroid = new MikroID();
   * const id = mikroid.create(16, 'alphanumeric'); // 16-character alphanumeric ID
   * const shortId = mikroid.create(8); // 8-character extended ID
   * const longId = mikroid.create(12); // 12-character extended ID
   */
  public create(
    length?: number,
    style?: IdStyle,
    onlyLowerCase?: boolean,
    urlSafe?: boolean
  ): string {
    const config = this.generateConfig({
      length,
      style,
      onlyLowerCase,
      urlSafe
    });

    return this.generateId(config);
  }

  /**
   * @description Creates a new ID using your custom ID configuration.
   *
   * @example
   * const id = new MikroID().custom('my-custom-id'); // ID created using 'my-custom-id' configuration
   */
  public custom(name: string): string {
    if (this.options[name]) return this.generateId(this.options[name]);
    throw new Error(`No configuration found with name: ${name}`);
  }

  /**
   * @description Generate a cleaned, ready-to-use configuration.
   */
  private generateConfig(options: Record<string, any>) {
    return {
      name: options?.name || '',
      length: options?.length || this.defaultLength,
      onlyLowerCase: options?.onlyLowerCase ?? this.defaultOnlyLowerCase,
      style: options?.style || this.defaultStyle,
      urlSafe: options?.urlSafe ?? this.defaultUrlSafe
    };
  }

  /**
   * @description Gets the appropriate character set based on style and options
   */
  private getCharacterSet(
    style: IdStyle,
    onlyLowerCase: boolean,
    urlSafe: boolean
  ): string {
    if (style === 'hex')
      return onlyLowerCase ? '0123456789abcdef' : '0123456789ABCDEFabcdef';

    if (style === 'alphanumeric')
      return onlyLowerCase
        ? 'abcdefghijklmnopqrstuvwxyz0123456789'
        : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    if (style === 'extended') {
      if (urlSafe)
        return onlyLowerCase
          ? 'abcdefghijklmnopqrstuvwxyz0123456789-._~'
          : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

      return onlyLowerCase
        ? 'abcdefghijklmnopqrstuvwxyz0123456789-._~!$()*+,;=:'
        : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~!$()*+,;=:';
    }

    throw new Error(
      `Unknown ID style "${style} provided. Must be one of "extended" (default), "alphanumeric", or "hex".`
    );
  }

  /**
   * @description Generates an ID using the specified configuration.
   * Uses cryptographically secure random generation.
   */
  private generateId(options: IdConfiguration): string {
    const { length, onlyLowerCase, style, urlSafe } = options;

    if (length < 0 || length === 0)
      throw new Error('ID length cannot be negative');

    const characters = this.getCharacterSet(style!, onlyLowerCase, urlSafe!);

    const mask = (2 << (Math.log(characters.length - 1) / Math.LN2)) - 1;
    const step = Math.ceil((1.6 * mask * length) / characters.length);

    let id = '';

    while (id.length < length) {
      const bytes = new Uint8Array(step);
      getRandomValues(bytes);

      for (let i = 0; i < step; i++) {
        const byte = bytes[i] & mask;
        if (byte < characters.length) {
          id += characters[byte];
          if (id.length === length) break;
        }
      }
    }

    return id;
  }
}
