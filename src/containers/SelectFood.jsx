import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { createGlobalStyle } from 'styled-components';
import Data from '../db/Data';
import SliderFoods from '../components/SliderFoods';
import Combo from '../components/Combo';
import Flavors from "../components/Flavors";

const data = new Data();

const GlobalStyle = createGlobalStyle`
    body{
        font-family: 'Inter', sans-serif;
        margin: 0;
        padding: 20px;
        background: #F2F2F2;
    }
`;

class SelectFood extends Component {
  constructor(props) {
    super(props);
    this.food = this.props.match.params.food;
    const categoryId = this.props.match.params.category;
    this.state = {
      categoryId,
      foods: [],
      foodOppositeCategory: [],
      oppositeCategory: this.getOppositeCategory(categoryId),
      oppositeFoodSelected: {},
      temporalCart: {}
    };
  }

  componentDidMount() {
    this.getFoods().then(() => {
      const food = this.state.foods[0];
      const value = {
        item: food,
        quantity: 1,  
        subtotal: 1 * food.price,
        additions: {}
      }
      this.setTemporalCart(value);
    })
  }

  //Function for order array
  moveArray(array, old_index, new_index) { 
    if (new_index >= array.length) { 
        let k = new_index - array.length; 
        while ((k--) + 1) { 
          array.push(undefined); 
        } 
    } 
    array.splice(new_index, 0, array.splice(old_index, 1)[0]); 
    return array; 
  };

  getFoods = async () => {
    const listFoods = await data.getFoodsByCategory(this.state.categoryId);
    const listfoodOppositeCategory = await data.getFoodsByCategory(this.state.oppositeCategory);

    //Order array for selected food first
    const [foodElement] = await listFoods.filter((food) => food.flavor === this.food);
    const index = await listFoods.indexOf(foodElement);
    await this.moveArray(listFoods, index, 0);

    this.setState({ foods: listFoods, foodOppositeCategory: listfoodOppositeCategory })
  };

  getOppositeCategory = (categoryId) => {
    const oppositeCategories = {
      1: 2,
      2: 1,
      3: 2,
    };
    return oppositeCategories[categoryId];
  };
  getComboSelected = (param) => {
    this.setState({
      oppositeFoodSelected: param,
    })
  }

  setTemporalCart = (value) => {
    this.setState({temporalCart: value}, () => {console.log(this.state.temporalCart)});
  }
  
  
  render() {
    const foodOppositeCategory = this.state.foodOppositeCategory;
    const isLoaded = foodOppositeCategory.length > 0;
    const flavorsLoaded = this.state.foods.length > 0;
    console.log(this.state.oppositeFoodSelected);
    console.log(this.state.temporalCart);
    return (
      <>
        <GlobalStyle />
        <SliderFoods 
          foods={this.state.foods}
          temporalCart= {this.state.temporalCart}
          setTemporalCart = {this.setTemporalCart}
        />
        <Flavors 
          foods={this.state.foods} 
          selectFood={this.food}
          isLoaded={flavorsLoaded}
        />
        {!isLoaded && (
          <span>Cargando...</span>
        )}
        {isLoaded &&
          <Combo 
            food={foodOppositeCategory} 
            isLoaded={isLoaded} 
            handler={this.getComboSelected} />
        }
      </>
    )
  }
}

export default withRouter(SelectFood);
