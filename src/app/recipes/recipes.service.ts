import { Injectable } from '@angular/core';
import { Recipe } from './recipes.model';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private recipes: Recipe[] = [
    {
      id: 'r1',
      title: 'Schnitzel',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Schnitzel.JPG/1024px-Schnitzel.JPG',
      ingredients: ['French Fries', 'Porl Meat', 'Salad']
    },
    {
      id: 'r2',
      title: 'Schnitzel',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Schnitzel.JPG/1024px-Schnitzel.JPG',
      ingredients: ['Spaghetti', 'Meat', 'Tomatoes']
    },
  ]
  constructor() { }

  getAllRecipes() {
    return [...this.recipes];
  }

  getrecipe(recipeId: string){
    return {
      ...this.recipes.find(recipe => {
        return recipe.id === recipeId;
      })
    }
  }
}
