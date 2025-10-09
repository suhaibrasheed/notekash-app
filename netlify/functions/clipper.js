// File: netlify/functions/clipper.js

// This function fetches a URL, uses professional libraries to find the main content,
// and sends back clean HTML.
const fetch = require('node-fetch'); 
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { url } = JSON.parse(event.body);
        if (!url || !url.startsWith('http')) {
            return { statusCode: 400, body: JSON.stringify({ error: 'A valid URL is required.' }) };
        }

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        if (!response.ok) {
            return { statusCode: response.status, body: JSON.stringify({ error: `Failed to fetch the page. Status: ${response.statusText}` }) };
        }

        const html = await response.text();
        const doc = new JSDOM(html, { url });
        const reader = new Readability(doc.window.document);
        const article = reader.parse();

        if (!article || !article.content) {
            return { statusCode: 500, body: JSON.stringify({ error: 'Could not parse the article content.' }) };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: article.title,
                content: article.content, // This is clean HTML
                source: url
            }),
        };

    } catch (error) {
        console.error('Clipper function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }),
        };
    }
};
