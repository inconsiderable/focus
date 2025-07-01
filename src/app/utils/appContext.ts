import { createContext } from 'react';
import {
  View,
  ViewIdHeaderPair,
  Consideration,
  Profile,
  GraphNode,
  GraphLink,
} from '../utils/appTypes';

interface AppState {
  publicKeys: string[][];
  setPublicKeys: (keys: string[][]) => void;
  selectedKeyIndex: [number, number];
  setSelectedKeyIndex: (index: [number, number]) => void;
  requestTipHeader: () => void;
  tipHeader?: ViewIdHeaderPair;
  setTipHeader: (tipHeader: ViewIdHeaderPair) => void;
  requestViewByHeight: (height: number) => void;
  requestViewById: (view_id: string) => void;
  currentView?: View | null;
  setCurrentView: (currentView: View) => void;
  genesisView?: View | null;
  setGenesisView: (genesisView: View) => void;
  requestProfile: (
    publicKeyB64: string,
    resultHandler: (profile: Profile) => void,
  ) => (() => void) | undefined;
  requestGraph: (publicKeyB64: string) => void;
  graph: {
    nodes: GraphNode[];
    links: GraphLink[];
  } | null;
  rankingFilter: number;
  setRankingFilter: (rankingFilter: number) => void;
  requestConsideration: (
    consideration_id: string,
    resultHandler: (consideration: Consideration) => void,
  ) => (() => void) | undefined;
  requestPkConsiderations: (
    publicKeyB64: string,
    resultHandler: (considerations: Consideration[]) => void,
  ) => (() => void) | undefined;
  pushConsideration: (
    to: string,
    memo: string,
    passphrase: string,
    selectedKeyIndex: [number, number],
    resultHandler: (data: { consideration_id: string; error: string }) => void,
  ) => Promise<(() => void) | undefined>;

  requestPendingConsiderations: (
    publicKeyB64: string,
    resultHandler: (considerations: Consideration[]) => void,
  ) => (() => void) | undefined;
  selectedNode: string;
  setSelectedNode: (node: string) => void;
  colorScheme: 'light' | 'dark';
}

export const AppContext = createContext<AppState>({
  publicKeys: [],
  setPublicKeys: () => {},
  selectedKeyIndex: [0, 0],
  setSelectedKeyIndex: (index: [number, number]) => {},
  tipHeader: undefined,
  requestTipHeader: () => {},
  setTipHeader: () => {},
  requestViewById: (view_id: string) => {},
  requestViewByHeight: (height: number) => {},
  currentView: undefined,
  setCurrentView: (currentView: View) => {},
  genesisView: undefined,
  setGenesisView: (genesisView: View) => {},
  requestProfile:
    (publicKeyB64: string, resultHandler: (profile: Profile) => void) =>
    () => {},
  requestGraph: (publicKeyB64: string) => {},
  graph: null,
  rankingFilter: 0,
  setRankingFilter: () => {},
  requestConsideration:
    (
      consideration_id: string,
      resultHandler: (consideration: Consideration) => void,
    ) =>
    () => {},
  requestPkConsiderations:
    (
      publicKeyB64: string,
      resultHandler: (considerations: Consideration[]) => void,
    ) =>
    () => {},
  requestPendingConsiderations:
    (
      publicKeyB64: string,
      resultHandler: (considerations: Consideration[]) => void,
    ) =>
    () => {},
  selectedNode: '',
  setSelectedNode: () => {},
  colorScheme: 'light',
  pushConsideration: (
    to: string,
    memo: string,
    passphrase: string,
    selectedKeyIndex: [number, number],
    resultHandler: (data: { consideration_id: string; error: string }) => void,
  ) => Promise.resolve(undefined),
});
