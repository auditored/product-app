import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../store/redux/cartSlice';

export const store = configureStore({
    reducer: {
        cart: cartReducer,
    },
});