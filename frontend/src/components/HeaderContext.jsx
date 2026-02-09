import { createContext, useContext, useState } from "react";

const HeaderContext = createContext({
  header: null,
  setHeader: () => { },
});

export function HeaderProvider({ children }) {
  const [header, setHeader] = useState(null);

  return (
    <HeaderContext.Provider value={{ header, setHeader }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  return useContext(HeaderContext);
}
