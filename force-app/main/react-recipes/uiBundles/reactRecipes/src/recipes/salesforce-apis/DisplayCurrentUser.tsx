/**
 * Display Current User
 *
 * Fetches the current user via the Chatter REST endpoint /users/me
 * using DataSDK.fetch. Returns plain JSON with displayName and email.
 *
 * LWC equivalent: import userId from '@salesforce/user/Id' to get the
 * current user's ID, then @wire(getRecord) on the User object to fetch
 * fields like Name and Email.
 *
 * @see ConnectApi — fetching Chatter feed data via Connect API
 */
import { useEffect, useState } from 'react';
import { createDataSDK } from '@salesforce/sdk-data';

interface ChatterUser {
  displayName: string;
  email: string;
}

export default function DisplayCurrentUser() {
  const [user, setUser] = useState<ChatterUser>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchUser = async () => {
      const sdk = await createDataSDK();
      const res = await sdk.fetch?.('/services/data/v66.0/chatter/users/me');
      if (!res?.ok) throw new Error(`Failed to fetch current user (${res?.status})`);
      const data: ChatterUser = await res.json();
      setUser(data);
    };

    fetchUser().catch(err => {
      setError(err instanceof Error ? err.message : 'Request failed');
    });
  }, []);

  if (error) return <p className="text-destructive">{error}</p>;
  if (!user) return <p className="text-sm">Loading…</p>;

  return (
    <div>
      <p className="text-lg font-semibold">{user.displayName}</p>
      <p className="text-xs text-muted-foreground">{user.email}</p>
    </div>
  );
}
