// viewmodels/CategoryViewModel.ts
import type { Category } from '../CategoryModel';

export interface CategoryViewModel {
  name: string;
  displayName: string;
}

export const toCategoryViewModel = (category: Category): CategoryViewModel => ({
  name: category.name,
  displayName: category.name.charAt(0).toUpperCase() + category.name.slice(1),
});

export const toCategoryViewModelList = (categories: Category[]): CategoryViewModel[] =>
  categories.map(toCategoryViewModel);
