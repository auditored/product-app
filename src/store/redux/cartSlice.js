import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [], // { id, name, price, quantity }
    totalPrice: 0,
    totalQuantity: 0,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const product = action.payload;
            const existing = state.items.find((item) => item.id === product.id);

            if (existing) {
                existing.quantity += 1;
            } else {
                state.items.push({ ...product, quantity: 1 });
            }

            state.totalQuantity += 1;
            state.totalPrice += product.price;
        },
        removeFromCart: (state, action) => {
            const id = action.payload;
            const item = state.items.find((item) => item.id === id);

            if (item) {
                state.totalQuantity -= item.quantity;
                state.totalPrice -= item.price * item.quantity;
                state.items = state.items.filter((i) => i.id !== id);
            }
        },
        decreaseQuantity: (state, action) => {
            const id = action.payload;
            const item = state.items.find((item) => item.id === id);

            if (item && item.quantity > 1) {
                item.quantity -= 1;
                state.totalQuantity -= 1;
                state.totalPrice -= item.price;
            }
        },
        clearCart: (state) => {
            state.items = [];
            state.totalPrice = 0;
            state.totalQuantity = 0;
        },
    },
});

export const { addToCart, removeFromCart, decreaseQuantity, clearCart } =
    cartSlice.actions;
export default cartSlice.reducer;
