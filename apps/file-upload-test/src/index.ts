import { R2Bucket } from '@cloudflare/workers-types';

interface Env {
  UPLOAD_BUCKET: R2Bucket;
}

const BASE_RESPONSE_HEADERS = {
  'Access-Control-Allow-Origin': '*',
};

const OPTIONS_HEADERS = {
  ...BASE_RESPONSE_HEADERS,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const JSON_HEADERS = {
  ...BASE_RESPONSE_HEADERS,
  'Content-Type': 'application/json;charset=UTF-8',
};

function randomHex(bytes = 8): string {
  const buf = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(buf)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function jsonResponse(payload: unknown, status = 200, headers = JSON_HEADERS): Response {
  return new Response(JSON.stringify(payload), {
    headers,
    status,
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status, JSON_HEADERS);
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === 'GET' && pathname === '/health') {
      return jsonResponse({
        status: 'ok',
        service: 'file-upload-test',
        version: '0.0.1',
      });
    }

    if (request.method === 'OPTIONS' && pathname === '/upload') {
      return new Response(null, { status: 204, headers: OPTIONS_HEADERS });
    }

    if (request.method === 'POST' && pathname === '/upload') {
      try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!(file instanceof File)) {
          return errorResponse('file field required', 400);
        }

        const arrayBuffer = await file.arrayBuffer();
        const key = `${Date.now()}-${randomHex(8)}-${sanitizeFileName(file.name)}`;

        await env.UPLOAD_BUCKET.put(key, arrayBuffer, {
          httpMetadata: {
            contentType: file.type || 'application/octet-stream',
          },
        });

        return jsonResponse(
          {
            status: 'uploaded',
            key,
            size: arrayBuffer.byteLength,
          },
          200,
          JSON_HEADERS,
        );
      } catch (error) {
        console.error('Upload failed', error);
        return errorResponse('failed to process upload', 500);
      }
    }

    return new Response('Not found', { status: 404 });
  },
};
