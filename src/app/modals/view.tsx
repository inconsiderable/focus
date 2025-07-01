import { ConsiderationList } from '../components/consideration';
import { PageShell } from '../components/pageShell';
import { useContext, useEffect } from 'react';
import { AppContext } from '../utils/appContext';

const View = ({ onDismiss }: { onDismiss?: () => void }) => {
  const { tipHeader, requestViewByHeight, currentView, genesisView } =
    useContext(AppContext);

  const tipHeight = tipHeader?.header.height ?? 0;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      requestViewByHeight(tipHeight);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [tipHeight, requestViewByHeight]);

  return (
    <PageShell
      onDismissModal={onDismiss}
      renderBody={() => (
        <>
          <ConsiderationList
            heading="First View"
            considerations={genesisView?.considerations ?? []}
          />
          {!!tipHeight && (
            <ConsiderationList
              heading={`Current View: #${tipHeight}`}
              considerations={currentView?.considerations ?? []}
            />
          )}
        </>
      )}
    />
  );
};

export default View;
