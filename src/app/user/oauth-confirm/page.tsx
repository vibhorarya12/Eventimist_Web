import UserOauthConfirm from '@/components/UserOauthConfirmClient';
import { Suspense } from 'react';

export default function UserOAuthConfirmPage() {
  return (
    <Suspense fallback={null}>
      <UserOauthConfirm />
    </Suspense>
  );
}