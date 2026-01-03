import { createContext, useReducer } from "react";
import { addDays } from "date-fns";

const INITIAL_STATE = {
  city: undefined,
  dates: [ // هنا التعديل
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 1), // تاريخ اليوم التالي
      key: "selection",
    },
  ],
  options: {
    adult: undefined, // ممكن تحطي قيمة افتراضية هنا برضه لو عايزة، مثلاً 1
    children: undefined, // أو 0
    room: undefined,     // أو 1
    type:undefined
  }
};

export const SearchContext = createContext(INITIAL_STATE);

const SearchReducer = (state, action) => {
  switch (action.type) {
    case "NEW_SEARCH":
      return action.payload;
    case "RESET_SEARCH":
      return INITIAL_STATE;
    default:
      return state;
  }
};

export const SearchContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(SearchReducer, INITIAL_STATE);

  return (
    <SearchContext.Provider
      value={{
        city: state.city,
        dates: state.dates,
        options: state.options,
        type: state.type,
        dispatch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};



















