import { Category } from 'src/app/models/category';

export interface CategoryFilterNode {
  category: Category;
  count: number;
  children: CategoryFilterNode[];
}
