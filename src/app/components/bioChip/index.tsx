import { IonButton, IonIcon } from '@ionic/react';
import { callOutline, linkOutline, mailOutline } from 'ionicons/icons';

/**
 * Supported link types
 * tel:1234567890
 * mailto: me@example.com
 * https://example.com
 */

interface BioChipProps {
  value: string;
  pseudonym?: string;
}

const BioChip: React.FC<BioChipProps> = ({ value, pseudonym }) => {
  return value ? (
    <IonButton
      target={value.startsWith('tel:') ? '' : '_blank'}
      href={isValidBioLink(value) ? value : undefined}
      size="small"
    >
      {pseudonym && pseudonym}
      <IonIcon slot="end" icon={bioLinkIcon(value)}></IonIcon>
    </IonButton>
  ) : null;
};

export default BioChip;

const isValidBioLink = (value: string) =>
  value.startsWith('tel:') ||
  value.startsWith('mailto:') ||
  value.startsWith('https:');

const bioLinkIcon = (value: string) => {
  if (value.startsWith('tel:')) {
    return callOutline;
  }

  if (value.startsWith('mailto:')) {
    return mailOutline;
  }

  if (value.startsWith('https:')) {
    return linkOutline;
  }
};
