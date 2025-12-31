import React, { Suspense } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import Header from "./components/Header";
import Popups from "./components/Popups";
import Web3ReactManager from "./components/Web3ReactManager";

import Pool from "./pages/Pool";

import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
} from "./pages/AddLiquidity/redirects";

import AddLiquidity from "./pages/AddLiquidity";
import CreateLiquidity from "./pages/AddLiquidity/Create";
import RemoveLiquidity from "./pages/RemoveLiquidity";
import { RedirectOldRemoveLiquidityPathStructure } from "./pages/RemoveLiquidity/redirects";
import Swap from "./pages/Swap";
import { RedirectPathToSwapOnly, RedirectToSwap } from "./pages/Swap/redirects";
import "inter-ui";
import { Provider } from "react-redux";
import "./i18n";
import store from "./state";
import ApplicationUpdater from "./state/application/updater";
import ListsUpdater from "./state/lists/updater";
import MulticallUpdater from "./state/multicall/updater";
import TransactionUpdater from "./state/transactions/updater";
import UserUpdater from "./state/user/updater";
import GlobalDataContextProvider from "./context/GlobalData";
import PairDataContextProvider, { Updater as PairDataContextUpdater } from "./context/PairData";

import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from "./theme";
import { Web3ReactHooks, Web3ReactProvider } from "@web3-react/core";
import { Connector } from "@web3-react/types";
import {
  metamaskConnection,
  coinbaseWalletConnection,
  okxWalletConnection,
  trustWalletConnection,
} from "./connectors";
import MobileSorry from "./components/MobileSorry";

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;

  // ipad air media
  @media (max-width: 819px) {
    display: none;
  }
`;

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`;

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 136px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      padding: 16px;
  `};

  z-index: 1;
`;

const Marginer = styled.div`
  margin-top: 5rem;
`;

function Updaters() {
  return (
    <>
      <ListsUpdater />
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
      <PairDataContextUpdater />
    </>
  );
}

const connectors: [Connector, Web3ReactHooks][] = [
  [metamaskConnection.connector, metamaskConnection.hooks],
  [coinbaseWalletConnection.connector, coinbaseWalletConnection.hooks],
  [okxWalletConnection.connector, okxWalletConnection.hooks],
  [trustWalletConnection.connector, trustWalletConnection.hooks],
];

export default function App() {
  return (
    <>
      <FixedGlobalStyle />
      <Web3ReactProvider connectors={connectors}>
        <Provider store={store}>
          <GlobalDataContextProvider>
            <PairDataContextProvider>
              <Updaters />
              <Web3ReactManager>
                <ThemeProvider>
                  <ThemedGlobalStyle />
                  <Suspense fallback={null}>
                    <BrowserRouter>
                      <MobileSorry />
                      <AppWrapper>
                        <Header />
                        <BodyWrapper>
                          <Popups />
                          <Switch>
                            <Route exact strict path="/swap" component={Swap} />
                            <Route
                              exact
                              strict
                              path="/swap/:outputCurrency"
                              component={RedirectToSwap}
                            />
                            <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
                            <Route exact strict path="/pool" component={Pool} />
                            <Route exact path="/create" component={CreateLiquidity} />
                            <Route exact path="/create/:currencyIdA" component={CreateLiquidity} />
                            <Route
                              exact
                              path="/create/:currencyIdA/:currencyIdB"
                              component={CreateLiquidity}
                            />
                            <Route exact path="/add" component={AddLiquidity} />
                            <Route
                              exact
                              path="/add/:currencyIdA"
                              component={RedirectOldAddLiquidityPathStructure}
                            />
                            <Route
                              exact
                              path="/add/:currencyIdA/:currencyIdB"
                              component={RedirectDuplicateTokenIds}
                            />
                            <Route
                              exact
                              strict
                              path="/remove/:tokens"
                              component={RedirectOldRemoveLiquidityPathStructure}
                            />
                            <Route
                              exact
                              strict
                              path="/remove/:currencyIdA/:currencyIdB"
                              component={RemoveLiquidity}
                            />
                            <Route component={RedirectPathToSwapOnly} />
                          </Switch>
                          <Marginer />
                        </BodyWrapper>
                      </AppWrapper>
                    </BrowserRouter>
                  </Suspense>
                </ThemeProvider>
              </Web3ReactManager>
            </PairDataContextProvider>
          </GlobalDataContextProvider>
        </Provider>
      </Web3ReactProvider>
    </>
  );
}
