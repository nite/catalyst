import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import DatasetBrowser from "./components/DatasetBrowser";
import DatasetViewer from "./components/DatasetViewer";
import { HeaderProvider } from "./components/HeaderContext";
import Home from "./components/Home";
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <HeaderProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/datasets" element={<DatasetBrowser />} />
            <Route path="/datasets/:datasetId" element={<DatasetViewer />} />
          </Routes>
        </Layout>
      </HeaderProvider>
    </Router>
  );
}

export default App;
