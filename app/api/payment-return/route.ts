import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Cashfree often returns via POST, which Next.js App Router pages reject with 405.
  // This route intercepts the POST, extracts the query params, and redirects via GET 303.
  const { searchParams, origin } = new URL(request.url);
  
  // Get the target path from searchParams, or default to /buy/success
  const targetPath = searchParams.get('path') || '/buy/success';
  searchParams.delete('path'); // Remove internal routing param

  // Reconstruct the redirect URL
  const redirectUrl = new URL(targetPath, origin);
  searchParams.forEach((value, key) => {
    redirectUrl.searchParams.append(key, value);
  });

  // 303 'See Other' forces the browser to convert the POST into a GET
  return NextResponse.redirect(redirectUrl, 303);
}
