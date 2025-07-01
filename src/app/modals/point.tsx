import { useContext } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonIcon,
  IonInput,
  IonItem,
  IonItemDivider,
  IonList,
  IonText,
  IonTextarea,
  useIonActionSheet,
  useIonModal,
  useIonToast,
} from '@ionic/react';
import {
  ellipsisHorizontal,
  ellipsisVertical,
  qrCodeOutline,
  chevronCollapseOutline,
  duplicateOutline,
} from 'ionicons/icons';
import type { OverlayEventDetail } from '@ionic/core';
import { PageShell } from '../components/pageShell';
import { Html5QrcodePlugin } from '../utils/qr-scanner';
import { useInputValidationProps } from '../useCases/useInputValidation';
import KeyBriefer from '../components/keyBriefer';
import Mind from '../components/mind';
import { useMind } from '../useCases/useMind';
import { AppContext } from '../utils/appContext';
import { considerationID, shortenHex } from '../utils/compat';
import { SetupMind } from '../components/mindSetup';
import { ConsiderationList } from '../components/consideration';
import { usePendingConsiderations } from '../useCases/usePendingCxs';
import { useProfile } from '../useCases/useProfile';

const Point = ({ onDismiss }: { onDismiss?: () => void }) => {
  const { genesisView, pushConsideration } = useContext(AppContext);

  const {
    value: identifier,
    onBlur: onBlurIdentifier,
    isValid: isIdentifierValid,
    isTouched: isIdentifierTouched,
    onInputChange: setIdentifier,
  } = useInputValidationProps((identifier: string) =>
    new RegExp('[A-Za-z0-9/+]{43}=').test(identifier),
  );

  const {
    value: feedback,
    onBlur: onBlurFeedback,
    isValid: isFeedbackValid,
    isTouched: isFeedbackTouched,
    onInputChange: setFeedback,
  } = useInputValidationProps(
    (feedback: string) => feedback.length > 0 || feedback.length <= 150,
  );

  const [presentToast] = useIonToast();

  const execute = (passphrase: string, selectedKeyIndex: [number, number]) => {
    if (!isIdentifierValid || !isFeedbackValid) {
      return;
    }
    pushConsideration(
      identifier,
      feedback,
      passphrase,
      selectedKeyIndex,
      (data: any) => {
        presentToast({
          message:
            data.error ||
            `Consideration: ${shortenHex(data.consideration_id)} was executed`,
          duration: 5000,
          position: 'bottom',
        });

        if (!data.error) {
          setIdentifier('');
          setFeedback('');
        }
      },
    );
  };

  const [presentScanner, dismissScanner] = useIonModal(ScanQR, {
    onDismiss: (data?: string) => dismissScanner(data),
  });

  const [presentModal, dismiss] = useIonModal(AuthorizeConsideration, {
    onDismiss: () => dismiss(),
    onAuthorize: (passphrase: string, selectedKeyIndex: [number, number]) => {
      execute(passphrase, selectedKeyIndex);
      dismiss();
    },
    identifier,
    feedback,
  });

  const {
    publicKeys,
    selectedKeyIndex,
    setSelectedKeyIndex,
    importMind,
    deleteMind,
  } = useMind();

  const selectedKey = publicKeys[selectedKeyIndex[0]][selectedKeyIndex[1]];

  const keyProfile = useProfile(selectedKey);

  const pubKeyPoints = keyProfile?.imbalance;
  const pubKeyRanking = keyProfile?.ranking;

  const [presentActionSheet] = useIonActionSheet();

  const handleActionSheet = ({ data, role }: OverlayEventDetail) => {
    if (data?.['action'] === 'delete') {
      deleteMind();
    }
  };

  const pendingConsiderations = usePendingConsiderations(selectedKey);

  return (
    <PageShell
      onDismissModal={onDismiss}
      tools={
        !!selectedKey
          ? [
              {
                label: 'action sheet',
                renderIcon: () => (
                  <IonIcon
                    slot="icon-only"
                    ios={ellipsisHorizontal}
                    md={ellipsisVertical}
                  ></IonIcon>
                ),
                action: () =>
                  presentActionSheet({
                    onDidDismiss: ({ detail }) => handleActionSheet(detail),
                    header: 'Actions',
                    buttons: [
                      {
                        text: 'Delete mind',
                        role: 'destructive',
                        data: {
                          action: 'delete',
                        },
                      },
                      {
                        text: 'Cancel',
                        role: 'cancel',
                        data: {
                          action: 'cancel',
                        },
                      },
                    ],
                  }),
              },
            ]
          : []
      }
      renderBody={() => (
        <>
          {!selectedKey ? (
            <SetupMind importKeys={importMind} />
          ) : (
            <>
              <section className="ion-padding-top ion-padding-start ion-padding-end">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    <KeyBriefer value={selectedKey} />
                    {selectedKey && (
                      <Mind
                        hideLabel={true}
                        setSelectedKeyIndex={(key) => {
                          setSelectedKeyIndex(key);
                        }}
                        selectedKeyIndex={selectedKeyIndex}
                        publicKeys={publicKeys}
                      />
                    )}
                  </span>
                </div>
                <>
                  {pubKeyPoints !== undefined && (
                    <IonText color="primary">
                      <p>
                        <strong>Intention: </strong>
                        <i>{pubKeyPoints} pts</i>
                        <IonIcon
                          icon={chevronCollapseOutline}
                          color="primary"
                        />
                      </p>
                    </IonText>
                  )}
                  {pubKeyRanking !== undefined && (
                    <IonText color="primary">
                      <p>
                        <strong>Attention: </strong>
                        <i>{Number((pubKeyRanking / 1) * 100).toFixed(2)}%</i>
                      </p>
                    </IonText>
                  )}
                </>
              </section>
              <IonList>
                <IonItem lines="none">
                  <IonButton
                    fill="clear"
                    slot="end"
                    onClick={() => {
                      presentScanner({
                        onWillDismiss: (
                          ev: CustomEvent<OverlayEventDetail>,
                        ) => {
                          if (typeof ev.detail.data === 'string') {
                            setIdentifier(ev.detail.data);
                          }
                        },
                      });
                    }}
                  >
                    Scan
                    <IonIcon slot="end" icon={qrCodeOutline}></IonIcon>
                  </IonButton>
                </IonItem>
                <IonItem lines="none">
                  <IonInput
                    className={`${isIdentifierValid && 'ion-valid'} ${
                      isIdentifierValid === false && 'ion-invalid'
                    } ${isIdentifierTouched && 'ion-touched'}`}
                    label="Ideal"
                    labelPlacement="stacked"
                    clearInput={true}
                    errorText="Invalid ideal"
                    value={
                      identifier.substring(40) === '000='
                        ? identifier.replace(/0+=?$/g, '')
                        : identifier
                    }
                    onIonBlur={() => {
                      if (!new RegExp('[A-Za-z0-9/+]{43}=').test(identifier)) {
                        setIdentifier(
                          `${identifier
                            .replace(/[^A-Za-z0-9/+]/gi, '')
                            .padEnd(43, '0')}=`,
                        );
                      }
                      onBlurIdentifier();
                    }}
                    onIonInput={(event) =>
                      setIdentifier(event.target.value?.toString() ?? '')
                    }
                  />
                </IonItem>

                <IonItem lines="none">
                  <IonButton
                    fill="clear"
                    slot="end"
                    onClick={() => {
                      const genesisConsideration =
                        genesisView?.considerations[0];
                      const genesisRef = genesisConsideration
                        ? `ref/${considerationID(genesisConsideration)}/`
                        : '';
                      setFeedback(genesisRef);
                    }}
                  >
                    Genesis Ref
                    <IonIcon slot="end" icon={duplicateOutline}></IonIcon>
                  </IonButton>
                </IonItem>

                <IonItem lines="none">
                  <IonTextarea
                    className={`${isFeedbackValid && 'ion-valid'} ${
                      isFeedbackValid === false && 'ion-invalid'
                    } ${isFeedbackTouched && 'ion-touched'}`}
                    label="Memo"
                    placeholder=""
                    labelPlacement="stacked"
                    counter={true}
                    maxlength={150}
                    value={feedback}
                    onIonBlur={onBlurFeedback}
                    onIonInput={(event) =>
                      setFeedback(event.target.value ?? '')
                    }
                  />
                </IonItem>
              </IonList>
              <IonButton
                disabled={!isIdentifierValid || !isFeedbackValid}
                expand="block"
                className="ion-padding ion-no-margin"
                strong={true}
                onClick={() =>
                  presentModal({
                    initialBreakpoint: 0.75,
                    breakpoints: [0, 0.75],
                  })
                }
              >
                Pinpoint
              </IonButton>
              <IonItemDivider />
              {!!pendingConsiderations && !!pendingConsiderations.length && (
                <ConsiderationList
                  heading="Pending"
                  considerations={pendingConsiderations}
                />
              )}
            </>
          )}
        </>
      )}
    />
  );
};

export default Point;

export const ScanQR = ({
  onDismiss,
}: {
  onDismiss: (decodedText?: string) => void;
}) => {
  const onNewScanResult = (decodedText: string, decodedResult: any) => {
    onDismiss(decodedText ?? '');
  };
  return (
    <PageShell
      tools={[{ label: 'Cancel', action: onDismiss }]}
      renderBody={() => (
        <IonCard>
          <IonCardSubtitle>Scan QR</IonCardSubtitle>
          <IonCardContent>
            <Html5QrcodePlugin
              fps={10}
              qrbox={250}
              disableFlip={false}
              qrCodeSuccessCallback={onNewScanResult}
            />
          </IonCardContent>
        </IonCard>
      )}
    />
  );
};

const AuthorizeConsideration = ({
  onDismiss,
  onAuthorize,
  identifier,
  feedback,
}: {
  onDismiss: () => void;
  onAuthorize: (passphrase: string, selectedKeyIndex: [number, number]) => void;
  identifier: string;
  feedback: string;
}) => {
  const {
    value: passphrase,
    onBlur: onBlurPassphrase,
    isValid: isPassphraseValid,
    isTouched: isPassphraseTouched,
    onInputChange: setPassphrase,
  } = useInputValidationProps((input: string) => input.length > 0);

  const { publicKeys, selectedKeyIndex, setSelectedKeyIndex } = useMind();

  return (
    <div>
      <IonCard>
        <IonCardHeader>
          <IonCardSubtitle>
            Considered by:
            <Mind
              publicKeys={publicKeys}
              selectedKeyIndex={selectedKeyIndex}
              setSelectedKeyIndex={setSelectedKeyIndex}
            />
          </IonCardSubtitle>
          <IonCardSubtitle>Confirm consideration</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <IonTextarea
            aria-label="feedback"
            className="ion-margin-top"
            readonly
            value={feedback}
          />
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-evenly',
            }}
          >
            <KeyBriefer value={identifier} />
          </span>
        </IonCardContent>
      </IonCard>
      <IonCard>
        <IonCardContent>
          <IonInput
            className={`${isPassphraseValid && 'ion-valid'} ${
              isPassphraseValid === false && 'ion-invalid'
            } ${isPassphraseTouched && 'ion-touched'}`}
            label="Enter Passphrase"
            labelPlacement="stacked"
            clearInput={true}
            errorText="Invalid passphrase"
            value={passphrase}
            type="password"
            onIonBlur={onBlurPassphrase}
            onIonInput={(event) =>
              setPassphrase(event.target.value?.toString() ?? '')
            }
          />
          <IonButton
            className="ion-margin-top"
            fill="solid"
            expand="block"
            strong={true}
            disabled={!isPassphraseValid}
            onClick={() => onAuthorize(passphrase, selectedKeyIndex)}
          >
            Confirm
          </IonButton>
          <IonButton
            fill="outline"
            expand="block"
            strong={true}
            onClick={() => onDismiss()}
          >
            Cancel
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  );
};
