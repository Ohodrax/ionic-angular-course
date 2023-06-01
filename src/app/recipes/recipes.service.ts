import { Injectable } from '@angular/core';
import { Recipe } from './recipes.model';
import { Observable } from 'rxjs';

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
      title: 'Spaguett',
      imageUrl: 'https://img.freepik.com/fotos-gratis/uma-tigela-de-espaguete-com-frango-parmesao-e-manjericao_188544-17940.jpg?w=2000',
      ingredients: ['Spaghetti', 'Meat', 'Tomatoes']
    },
  ]
  constructor() { }

  getAllRecipes(){
    return [...this.recipes];
  }

  getRecipe(recipeId: string){
    return {
      ...this.recipes.find(recipe => {
        return recipe.id === recipeId;
      })
    }
  }

  deleteRecipe(recipeId: string){
    this.recipes = this.recipes.filter(recipe => {
      return recipe.id !== recipeId;
    })
  }
}
