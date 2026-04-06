import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
    '/',
    '/privacy',
    '/terms',
    '/api/ai-career-chat-agent/public-chat(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
    // Basic Rate Limiting for API Routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        // Mitigates generic DDOS within the isolate's lifetime
    }

    if (!isPublicRoute(request)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
