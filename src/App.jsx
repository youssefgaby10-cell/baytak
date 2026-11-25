import AppRoutes from "./routes/AppRoutes";
import PushTokenSync from "./components/common/PushTokenSync";
import "./styles/DarkMode.css";

// ThemeProvider موجود بالفعل في main.jsx
function App() {
  return (
    <>
      <PushTokenSync />
      <AppRoutes />
    </>
  );
}

export default App;
