import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import './styles/animations.css'
import './styles/utilities.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { antdTheme } from './theme/themeConfig'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          ...antdTheme,
          algorithm: theme.darkAlgorithm,
        }}
      >
        <App />
      </ConfigProvider>
    </QueryClientProvider>
  </BrowserRouter>
)
