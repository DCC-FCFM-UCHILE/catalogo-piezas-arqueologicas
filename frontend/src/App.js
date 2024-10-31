import Layout from "./components/Layout";
import { TokenProvider } from "./hooks/components/TokenProvider";
import { SnackbarProvider } from "./hooks/components/SnackbarProvider";
import { SelectionProvider } from './selectionContext'; 
import theme from "./styles";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <TokenProvider>
        <SnackbarProvider>
          <SelectionProvider> 
            <Router>
              <Layout />
            </Router>
          </SelectionProvider>
        </SnackbarProvider>
      </TokenProvider>
    </ThemeProvider>
  );
}

export default App;
