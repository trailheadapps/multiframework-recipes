/**
 * Connect API
 *
 * Calls a Connect REST API resource via DataSDK.fetch: the org's file upload
 * configuration (`connect/file/upload/config`). Unlike UIAPI GraphQL,
 * Connect API responses are plain JSON with no { value } wrappers.
 *
 * A deployed UI Bundle can only reach specific Connect/Chatter resources.
 * See the docs for a comprehensive list:
 * https://developer.salesforce.com/docs/platform/multiframework/guide/data-sdk-connect.html
 *
 * LWC equivalent: wire adapters exist for some Connect API resources;
 * others need imperative Apex.
 *
 * @see DisplayCurrentUser — another Connect resource, chatter/users/me
 * @see ApexRest — calling custom Apex REST endpoints
 */
import { useEffect, useState } from 'react';
import { createDataSDK } from '@salesforce/platform-sdk';

// The fields of the upload-config response this recipe renders. The response
// also carries a short-lived upload `token`; treat it like a credential and
// never render or log it.
type FileUploadConfig = {
  allowedFileExtensions: string[];
  maxFileSize: number;
  maxFileAttachmentsOnFeed: number;
  uploadUrl: string;
};

export default function ConnectApi() {
  const [config, setConfig] = useState<FileUploadConfig>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchUploadConfig = async () => {
      const sdk = await createDataSDK();
      const res = await sdk.fetch?.(
        '/services/data/v66.0/connect/file/upload/config'
      );
      if (!res?.ok) throw new Error(`Connect API error: ${res?.status}`);
      const data: FileUploadConfig = await res.json();
      setConfig(data);
    };
    fetchUploadConfig()
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Request failed');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm">Loading…</p>;

  if (error) return <p className="text-xs text-destructive">{error}</p>;

  if (!config) return null;

  // Plain JSON: values are read directly, no { value } unwrapping.
  const rows: [string, string][] = [
    ['allowedFileExtensions', JSON.stringify(config.allowedFileExtensions)],
    ['maxFileSize', String(config.maxFileSize)],
    ['maxFileAttachmentsOnFeed', String(config.maxFileAttachmentsOnFeed)],
    ['uploadUrl', config.uploadUrl],
  ];

  return (
    <dl className="divide-y text-sm">
      {rows.map(([key, value]) => (
        <div key={key} className="flex justify-between gap-4 py-2">
          <dt className="font-mono text-xs text-muted-foreground">{key}</dt>
          <dd className="font-medium text-right break-all">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
