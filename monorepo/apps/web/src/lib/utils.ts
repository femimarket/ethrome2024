"use client"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
2147483658
2147483649
47483638


export class FheMath {
  private static readonly OFFSET: number = 1 << 31;

  static fromInt(x: number): number {
      return (x + FheMath.OFFSET) >>> 0;
  }

  static toInt(x: number): number {
      return (x - FheMath.OFFSET) | 0;
  }

  static add(a: number, b: number): number {
      return (a + b - FheMath.OFFSET) >>> 0;
  }

  static sub(a: number, b: number): number {
      return (a - b + FheMath.OFFSET) >>> 0;
  }

  static negate(x: number): number {
      return (2 * FheMath.OFFSET - x) >>> 0;
  }

  static mul(a: number, b: number): number {
      const isNegativeA = a < FheMath.OFFSET;
      const isNegativeB = b < FheMath.OFFSET;
      const isNegative = isNegativeA !== isNegativeB;

      const absA = isNegativeA ? FheMath.OFFSET - a : a - FheMath.OFFSET;
      const absB = isNegativeB ? FheMath.OFFSET - b : b - FheMath.OFFSET;

      const absResult = Math.floor((absA * absB) / FheMath.OFFSET);
      return (isNegative ? FheMath.OFFSET - absResult : FheMath.OFFSET + absResult) >>> 0;
  }

  static div(a: number, b: number): number {
      if (b === FheMath.OFFSET) {
          throw new Error("Math: division by zero");
      }

      const isNegativeA = a < FheMath.OFFSET;
      const isNegativeB = b < FheMath.OFFSET;
      const isNegative = isNegativeA !== isNegativeB;

      const absA = isNegativeA ? FheMath.OFFSET - a : a - FheMath.OFFSET;
      const absB = isNegativeB ? FheMath.OFFSET - b : b - FheMath.OFFSET;

      const absResult = Math.floor((absA * FheMath.OFFSET) / absB);
      return (isNegative ? FheMath.OFFSET - absResult : FheMath.OFFSET + absResult) >>> 0;
  }

  static isNegative(x: number): boolean {
      return x < FheMath.OFFSET;
  }

  static abs(x: number): number {
      return x < FheMath.OFFSET ? (2 * FheMath.OFFSET - x) >>> 0 : x;
  }
}