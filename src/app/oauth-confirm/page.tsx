
import OauthConfirm from '@/components/OauthConfirmClient';
import {Suspense} from 'react';



export default function OAuthConfirmPage() {
  return (
    <Suspense fallback={null}>
      <OauthConfirm/>
    </Suspense>
  );
}