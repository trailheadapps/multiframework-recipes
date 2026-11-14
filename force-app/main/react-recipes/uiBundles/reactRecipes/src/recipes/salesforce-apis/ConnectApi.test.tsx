/**
 * Connect API responses are plain JSON (no { value } wrappers like UIAPI).
 * The component fetches the org's file upload config via DataSDK.fetch and
 * renders each field. Tests mock sdk.fetch and verify the requested
 * resource, the rendered fields, that the upload token is never shown,
 * and error handling.
 */
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { axe } from 'vitest-axe';
import ConnectApi from './ConnectApi';

vi.mock('@salesforce/platform-sdk', () => ({
  createDataSDK: vi.fn(),
}));

const UPLOAD_CONFIG = {
  allowedFileExtensions: ['pdf', 'png'],
  hasCustomRecordTypes: false,
  maxFileAttachmentsOnFeed: 10,
  maxFileSize: 2048,
  token: 'secret-upload-token',
  uploadUrl: '/chatter/handlers/file/body',
};

describe('ConnectApi', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ fetch: mockFetch });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const respondWith = (body: unknown) =>
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(body) });

  it('requests the file upload config Connect resource', async () => {
    respondWith(UPLOAD_CONFIG);
    render(<ConnectApi />);
    await screen.findByText('uploadUrl');
    expect(mockFetch).toHaveBeenCalledWith(
      '/services/data/v66.0/connect/file/upload/config'
    );
  });

  it('renders the upload config fields', async () => {
    respondWith(UPLOAD_CONFIG);
    render(<ConnectApi />);
    expect(await screen.findByText('["pdf","png"]')).toBeInTheDocument();
    expect(screen.getByText('2048')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('/chatter/handlers/file/body')).toBeInTheDocument();
  });

  it('never renders the upload token', async () => {
    respondWith(UPLOAD_CONFIG);
    const { container } = render(<ConnectApi />);
    await screen.findByText('uploadUrl');
    expect(container.textContent).not.toContain('secret-upload-token');
  });

  it('renders an empty extension list as []', async () => {
    respondWith({ ...UPLOAD_CONFIG, allowedFileExtensions: [], maxFileSize: 0 });
    render(<ConnectApi />);
    expect(await screen.findByText('[]')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows error when Connect API fails', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 401 });
    render(<ConnectApi />);
    expect(
      await screen.findByText('Connect API error: 401')
    ).toBeInTheDocument();
  });

  it('is accessible', async () => {
    respondWith(UPLOAD_CONFIG);
    const { container } = render(<ConnectApi />);
    await screen.findByText('uploadUrl');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
