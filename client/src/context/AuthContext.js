import { createContext, useEffect, useReducer } from "react";

const INITIAL_STATE = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  loading: false,
  errorR: null,
  errorL: null,
};

export const AuthContext = createContext(INITIAL_STATE);

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "REGISTER_START":
      return {
        user: null,
        loading: true,
        errorR: null,
      };
    case "LOGIN_START":
      return {
        user: null,
        loading: true,
        errorL: null,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload,
        loading: false,
        errorL: null,
      };
    case "REGISTER_SUCCESS":
      return {
        user: action.payload,
        loading: false,
        errorR: null,
      };
    case "LOGIN_FAILURE":
      return {
        user: null,
        loading: false,
        errorL: action.payload,
      };
    case "REGISTER_FAILURE":
      return {
        user: null,
        loading: false,
        errorR: action.payload,
      };
    case "LOGOUT":
      return {
        user: null,
        loading: false,
        errorL: null,
      };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        errorR: state.errorR,
        errorL: state.errorL,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
