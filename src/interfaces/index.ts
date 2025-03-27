export type MikroIDOptions = {
  [name: string]: IdConfiguration;
};

export type IdConfiguration = {
  name: string;
  length: number;
  onlyLowerCase: boolean;
  style?: IdStyle;
  urlSafe?: boolean;
};

export type IdConfigurationOptions = Partial<IdConfiguration>;

export type IdStyle = 'alphanumeric' | 'extended' | 'hex';
