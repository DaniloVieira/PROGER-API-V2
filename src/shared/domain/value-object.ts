export abstract class ValueObject {
  protected abstract getEqualityComponents(): unknown[];

  public equals(other: ValueObject): boolean {
    if (this.constructor !== other.constructor) return false;
    return JSON.stringify(this.getEqualityComponents()) ===
      JSON.stringify(other.getEqualityComponents());
  }
}
