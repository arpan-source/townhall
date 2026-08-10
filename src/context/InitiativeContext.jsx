import { createContext, useContext, useState } from "react";

const InitiativeContext = createContext();

export function InitiativeProvider({ children }) {
  const [selectedInitiative, setSelectedInitiative] = useState(null);

  return (
    <InitiativeContext.Provider
      value={{
        selectedInitiative,
        setSelectedInitiative,
      }}
    >
      {children}
    </InitiativeContext.Provider>
  );
}

export function useInitiative() {
  return useContext(InitiativeContext);
}