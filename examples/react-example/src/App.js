import "./App.css";
import "block-clock";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div style={{ width: 200, height: 200 }}>
          <block-clock
            rpcUser="<YOUR_RPC_USER>"
            rpcPassword="<YOUR_RPC_PASSWORD>"
            rpcEndpoint="<YOUR_RPC_ENDPOINT>"
            darkMode
          ></block-clock>
        </div>
      </header>
    </div>
  );
}

export default App;
