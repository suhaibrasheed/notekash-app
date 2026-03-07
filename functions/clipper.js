// File: functions/clipper.js
import { DOMParser } from 'linkedom';
import { Readability } from '@mozilla/readability';

export async function onRequestPost(context) {
    try {
        const request = context.request;
        const { url } = await request.json();
        
        if (!url || !url.startsWith('http')) {
            return new Response(JSON.stringify({ error: 'A valid URL is required.' }), { status: 400 });
        }

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        if (!response.ok) {
            return new Response(JSON.stringify({ error: `Failed to fetch the page. Status: ${response.statusText}` }), { status: response.status });
        }

        const html = await response.text();
        
        const document = new DOMParser().parseFromString(html, 'text/html');
        
        const reader = new Readability(document);
        const article = reader.parse();

        if (!article || !article.content) {
            return new Response(JSON.stringify({ error: 'Could not parse the article content.' }), { status: 500 });
        }

        return new Response(JSON.stringify({
            title: article.title,
            content: article.content, 
            source: url
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Clipper function error:', error);
        return new Response(JSON.stringify({ error: error.message || 'An internal server error occurred.' }), { status: 500 });
    }
}
