import { IonChip, IonIcon, IonText } from '@ionic/react';
import {
  copyOutline,
  locationOutline,
  chevronCollapseOutline,
} from 'ionicons/icons';
import { useClipboard } from '../../useCases/useClipboard';
import { useContext, useEffect } from 'react';
import { AppContext } from '../../utils/appContext';
import { shortenB64 } from '../../utils/compat';

export const KeyAbbrev = ({ value }: { value: string }) => {
  const abbrevKey = shortenB64(value);

  return <code>{abbrevKey}</code>;
};

const KeyStats = ({ value }: { value: string }) => {
  const { copyToClipboard } = useClipboard();

  const { requestProfile, profile } = useContext(AppContext);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (value) {
        requestProfile(value);
      }
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, requestProfile]);

  const pubKeyRanking = profile(value)?.ranking;
  const pubKeyPoints = profile(value)?.imbalance;
  const catchment = profile(value)?.locale;

  return (
    <>
      <span>
        <IonChip onClick={() => copyToClipboard(value)}>
          <KeyAbbrev value={value} />
          <IonIcon icon={copyOutline} color="primary"></IonIcon>
        </IonChip>
        {catchment && (
          <IonChip
            onClick={(e) => {
              window.open(`https://plus.codes/${catchment}`);
            }}
          >
            <IonIcon
              style={{
                marginLeft: '-4px',
              }}
              icon={locationOutline}
              color="primary"
            ></IonIcon>
          </IonChip>
        )}
      </span>

      {pubKeyRanking !== undefined && (
        <IonText color="primary">
          <p>
            {pubKeyPoints !== undefined && (
              <>
                <strong>Intention: </strong>
                <i>{pubKeyPoints} pts</i>
                <IonIcon icon={chevronCollapseOutline} color="primary" />
              </>
            )}
            <br />
            {pubKeyRanking !== undefined && (
              <>
                <strong>Attention: </strong>
                <i>{Number((pubKeyRanking / 1) * 100).toFixed(2)}%</i>
              </>
            )}
          </p>
        </IonText>
      )}
    </>
  );
};

export default KeyStats;
