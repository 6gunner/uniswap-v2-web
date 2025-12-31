import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';

import { Global, theme } from './config/theme';
import Home from './pages/Home';

function App() {
  return (
    <>
      <Global />
      <ConfigProvider prefixCls="sugar" theme={theme}>
        <StyleProvider layer>
          <BrowserRouter>
            <ScrollToTop>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </ScrollToTop>
          </BrowserRouter>
        </StyleProvider>
      </ConfigProvider>
    </>
  );
}

export default App;
