export type TestType = 'DISC' | 'PAEI';

export interface ITestQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index: 0, 1, 2, 3
  type: TestType;
  createdAt: string;
}

export interface TestFormData {
  question: string;
  options: string[];
  correctAnswer: number;
  type: TestType;
}
