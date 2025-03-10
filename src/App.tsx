import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatContainer from "./components/ChatContainer";
import { Toaster } from "./components/ui/toast-context";

// Using HashRouter for S3 compatibility
function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-secondary/10">
        <Header />
        <main className="flex-1 p-4">
          <div className="w-full h-full">
            <Routes>
              <Route path="/" element={<ChatContainer />} />
              {/* Add more routes as needed */}
            </Routes>
          </div>
        </main>
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
