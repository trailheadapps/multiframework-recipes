import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BasicEmbed from './recipes/BasicEmbed';
import ReceiveData from './recipes/ReceiveData';
import SendEvent from './recipes/SendEvent';
import AutoResize from './recipes/AutoResize';
import ThemeTokens from './recipes/ThemeTokens';
import DirtyState from './recipes/DirtyState';
import GraphQLBridge from './recipes/GraphQLBridge';

function Home() {
    return (
        <div className="recipe-container">
            <h1 className="recipe-title">MFE App</h1>
            <p className="recipe-description">
                External MFE application for multiframework-recipes. Each route demonstrates one
                bridge pattern. Open this app embedded inside a Salesforce Lightning component.
            </p>
            <div className="recipe-card">
                <p className="recipe-label">Available routes</p>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                    <li>/basic-embed</li>
                    <li>/receive-data</li>
                    <li>/send-event</li>
                    <li>/auto-resize</li>
                    <li>/theme-tokens</li>
                    <li>/dirty-state</li>
                    <li>/graphql-bridge</li>
                </ul>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/basic-embed" element={<BasicEmbed />} />
                <Route path="/receive-data" element={<ReceiveData />} />
                <Route path="/send-event" element={<SendEvent />} />
                <Route path="/auto-resize" element={<AutoResize />} />
                <Route path="/theme-tokens" element={<ThemeTokens />} />
                <Route path="/dirty-state" element={<DirtyState />} />
                <Route path="/graphql-bridge" element={<GraphQLBridge />} />
                <Route path="*" element={<Home />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
