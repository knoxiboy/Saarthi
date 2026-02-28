import { google } from 'googleapis';

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
});

export async function searchYoutubeVideos(query: string) {
    if (!process.env.YOUTUBE_API_KEY) {
        console.warn("YOUTUBE_API_KEY is missing. Skipping video search.");
        return [];
    }

    try {
        const response = await youtube.search.list({
            part: ['snippet'],
            q: query,
            maxResults: 3,
            type: ['video'],
            relevanceLanguage: 'en',
            safeSearch: 'moderate'
        });

        return response.data.items?.map((item: any) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.high?.url
        })) || [];
    } catch (error) {
        console.error("YouTube Search Error:", error);
        return [];
    }
}
