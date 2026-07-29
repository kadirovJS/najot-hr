export type TestType = 'DISC' | 'PAEI';

export interface ITestQuestion {
  _id: string;
  question: string;
  options: string[];
  type: TestType;
  createdAt: string;
}

export interface TestFormData {
  question: string;
  options: string[];
  type: TestType;
}
