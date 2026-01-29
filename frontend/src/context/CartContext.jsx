import React, { createContext, useContext, useReducer } from "react";

// Estado inicial del carrito
const initialState = {
  items: [], // { id, nombre, precio, cantidad, imagen }
};

// Acciones posibles
const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) {
        // Si ya existe, suma cantidad
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, cantidad: item.cantidad + action.payload.cantidad }
              : item
          ),
        };
      }
      // Si no existe, agrega
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, cantidad: action.payload.cantidad }
            : item
        ),
      };
    case "CLEAR_CART":
      return initialState;
    default:
      return state;
  }
};

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Métodos para manipular el carrito
  const addItem = (item) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };
  const removeItem = (id) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };
  const updateQuantity = (id, cantidad) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, cantidad } });
  };
  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook para usar el carrito
export const useCart = () => useContext(CartContext);