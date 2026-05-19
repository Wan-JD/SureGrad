import { ValueTransformer } from 'typeorm';

export const numericTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | number | null) => {
    if (value === null || value === undefined) {
      return null;
    }

    return typeof value === 'number' ? value : Number(value);
  },
};
