MatrixCSV
=========

JavaScript CSV tool based on Matrix from MathExtension

### API

```typescript
declare module MatrixCSV { 
  function readFile(file: Blob, onload: (matrix: Matrix<string>) => any, delimiter?: string): void; 
  function decode(text: string, delimiter?: string): Matrix<string>; 
  function encode(matrix: Matrix<any>): string; 
}
```