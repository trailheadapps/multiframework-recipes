/**
 * Connect API
 *
 * Calls the Chatter Connect API via DataSDK.fetch to fetch the current user's
 * news feed. Unlike UIAPI GraphQL, Connect API responses are plain JSON with
 * no { value } wrappers.
 *
 * LWC equivalent: equivalent wire adapters exist for some Connect API
 * resources, but many require imperative Apex callouts to access.
 *
 * @see ApexRest — calling custom Apex REST endpoints
 */
import { useEffect, useState } from 'react';
import { createDataSDK } from '@salesforce/sdk-data';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Minimal shape of a Chatter feed-elements response
type FeedActor = {
  displayName: string;
  photo?: { smallPhotoUrl?: string | null } | null;
};

type FeedElement = {
  id: string;
  type: string;
  createdDate: string;
  actor: FeedActor;
  body?: { text?: string | null } | null;
};

type FeedResponse = {
  elements: FeedElement[];
  currentPageUrl: string;
};

export default function ConnectApi() {
  const [feed, setFeed] = useState<FeedElement[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetchChatterFeed()
      .then(setFeed)
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Request failed');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm">Loading…</p>;

  if (error) return <p className="text-xs text-destructive">{error}</p>;

  if (!feed || feed.length === 0)
    return (
      <p className="text-muted-foreground text-sm">
        No Chatter feed items found. Make sure Chatter is enabled in your org.
      </p>
    );

  return (
    <ul className="divide-y">
      {feed.map(item => (
        <li
          key={item.id}
          className="py-2 -mx-2 px-2 rounded-md transition-colors hover:bg-accent/50"
        >
          <div className="flex items-start gap-3">
            {item.actor.photo?.smallPhotoUrl ? (
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={item.actor.photo.smallPhotoUrl}
                  alt={item.actor.displayName}
                />
              </Avatar>
            ) : (
              <Avatar className="h-8 w-8">
                <AvatarFallback />
              </Avatar>
            )}
            <div className="min-w-0">
              <p className="text-xs">
                <strong>{item.actor.displayName}</strong>
                <span className="text-muted-foreground ml-1">
                  · {timeAgo(item.createdDate)}
                </span>
              </p>
              {item.body?.text && (
                <p className="text-sm mt-1">{item.body.text}</p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

async function fetchChatterFeed(): Promise<FeedElement[]> {
  const sdk = await createDataSDK();
  const res = await sdk.fetch?.(
    '/services/data/v66.0/chatter/feeds/news/me/feed-elements?pageSize=5'
  );
  if (!res?.ok) throw new Error(`Connect API error: ${res?.status}`);
  const data: FeedResponse = await res.json();
  return data.elements ?? [];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
