import superjson from "superjson/dist/esm/index.js";

export async function onRequest({ request }) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle /api/locale
  if (path === '/api/locale') {
    const country = url.searchParams.get('country') ?? 'US';
    return new Response(JSON.stringify({ country, locale: country === 'VN' ? 'vi' : 'en' }), {
      headers: { 'Content-Type': 'application/json', 'cache-control': 'no-store' },
    });
  }

  // Handle /api/trpc
  if (path === '/api/trpc' || path.startsWith('/api/trpc/')) {
    return handleTrpc(request, url);
  }

  // Handle /api/tmdb/*
  if (path === '/api/tmdb' || path === '/api/tmdb/') {
    return handleTmdb(request, url);
  }

  return new Response(JSON.stringify({}), { headers: { 'Content-Type': 'application/json' } });
}

async function handleTrpc(request, url) {
  const TMDB_API = 'https://api.themoviedb.org/3';
  const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZmMyYzhkNTgwZjNiNDk1ODJhYzlmYWQ2MGQwYjUxZiIsIm5iZiI6MTc4NzU0MzM4Ni41OTgsInN1YiI6IjZhOGJiZjVhZGE2YmYxNTM5YWMwZWJkYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.uTk9LAYIiwJsoGj1bIboQ0IIklWw_R9SdG-lm-AB2zI';

  const tmdbLanguage = 'vi-VN';

  async function tmdb(path, params = {}) {
    const u = new URL(`${TMDB_API}${path}`);
    u.searchParams.set('language', tmdbLanguage);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    const res = await fetch(u, { headers: { accept: 'application/json', authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) throw new Error(`TMDB_${res.status}`);
    return res.json();
  }

  function mapList(raw, fallback, locale) {
    return (raw.results || []).filter(item => item.media_type !== 'person').slice(0, 16).map(item => normalizeTitle(item, item.media_type === 'tv' ? 'tv' : fallback, locale));
  }

  function normalizeTitle(raw, mediaType, locale) {
    const name = mediaType === 'movie' ? raw.title : raw.name;
    const date = mediaType === 'movie' ? raw.release_date : raw.first_air_date;
    return {
      id: `tmdb-${mediaType}-${raw.id}`,
      tmdbId: raw.id,
      mediaType,
      title: name || 'Untitled',
      overview: raw.overview || 'No synopsis available.',
      releaseYear: date ? Number(String(date).slice(0, 4)) : null,
      rating: typeof raw.vote_average === 'number' ? Math.round(raw.vote_average * 10) / 10 : null,
      runtimeMinutes: raw.runtime || null,
      genres: Array.isArray(raw.genres) ? raw.genres.map(g => g.name) : [],
      posterUrl: raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : null,
      backdropUrl: raw.backdrop_path ? `https://image.tmdb.org/t/p/original${raw.backdrop_path}` : null,
    };
  }

  async function homeCatalog() {
    try {
      const [trending, movies, series] = await Promise.all([
        tmdb('/trending/all/day', {}),
        tmdb('/movie/popular', {}),
        tmdb('/tv/popular', {}),
      ]);
      const trendingItems = mapList(trending, 'movie', 'vi');
      const movieItems = mapList(movies, 'movie', 'vi');
      const seriesItems = mapList(series, 'tv', 'vi');
      return { source: 'tmdb', hero: movieItems[0] || trendingItems[0] || { id: 'demo-dunes', mediaType: 'movie', title: 'Dune: Part Two', releaseYear: 2024, rating: 8.2, overview: 'Demo', genres: ['Sci-Fi'], posterUrl: '/manus-storage/novaflix-hero-user_4c631c9a.jpg', backdropUrl: '/manus-storage/novaflix-hero-user_4c631c9a.jpg', runtimeMinutes: 166 }, rails: [
        { id: 'movies', label: 'Phim nổi bật', items: movieItems },
        { id: 'series', label: 'Series phổ biến', items: seriesItems },
        { id: 'trending', label: 'Đang được quan tâm', items: trendingItems },
      ] };
    } catch {
      return { source: 'demo', hero: { id: 'demo-dunes', mediaType: 'movie', title: 'Dune: Part Two', releaseYear: 2024, rating: 8.2, overview: 'Demo', genres: ['Sci-Fi'], posterUrl: '/manus-storage/novaflix-hero-user_4c631c9a.jpg', backdropUrl: '/manus-storage/novaflix-hero-user_4c631c9a.jpg', runtimeMinutes: 166 }, rails: [
        { id: 'popular', label: 'Được chọn cho nhóm', items: [{ id: 'demo-dunes', mediaType: 'movie', title: 'Dune: Part Two', releaseYear: 2024, rating: 8.2, overview: 'Demo', genres: ['Sci-Fi'], posterUrl: '/manus-storage/novaflix-hero-user_4c631c9a.jpg', backdropUrl: '/manus-storage/novaflix-hero-user_4c631c9a.jpg', runtimeMinutes: 166 }] },
      ] };
    }
  }

  async function searchTitles(query) {
    if (query.length < 2) return [];
    try {
      const raw = await tmdb('/search/multi', { query, include_adult: 'false' });
      return mapList(raw, 'movie', 'vi');
    } catch { return []; }
  }

  async function findTitle(id) {
    const match = /^tmdb-(movie|tv)-(\d+)$/.exec(id);
    if (!match) return null;
    try {
      const raw = await tmdb(`/${match[1]}/${match[2]}`, {});
      return normalizeTitle(raw, match[1] === 'tv' ? 'tv' : 'movie', 'vi');
    } catch { return null; }
  }

  async function findSimilar(id) {
    const match = /^tmdb-(movie|tv)-(\d+)$/.exec(id);
    if (!match) return [];
    try {
      const raw = await tmdb(`/${match[1]}/${match[2]}/similar`, {});
      return (raw.results || []).map(item => normalizeTitle(item, match[1] === 'tv' ? 'tv' : 'movie', 'vi'));
    } catch { return []; }
  }

  const operation = url.pathname.replace(/^\/api\/trpc\//, '').replace(/\/$/, '');
  const isBatch = url.searchParams.get('batch') === '1';

  let input = {};
  try {
    if (request.method === 'GET') {
      const rawInput = url.searchParams.get('input');
      if (rawInput) input = JSON.parse(rawInput);
    } else if (request.method === 'POST') {
      const body = await request.json();
      input = body?.input ?? body;
    } else {
      return new Response(JSON.stringify({ error: { code: -32603, message: 'Method not allowed' } }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', Allow: 'GET, POST' },
      });
    }

    const entries = isBatch || (input && typeof input === 'object' && input['0']) ? input : { '0': input };
    const results = await Promise.all(Object.keys(entries).map(async key => {
      const query = entries[key]?.json ?? entries[key] ?? {};
      let data;
      if (operation === 'catalog.home') data = await homeCatalog(query.locale === 'en' ? 'en' : 'vi');
      else if (operation === 'catalog.search') data = await searchTitles(query.query || '');
      else if (operation === 'catalog.byId') data = await findTitle(query.id);
      else if (operation === 'catalog.similar') data = await findSimilar(query.id);
      else data = [];
      return { result: { data: superjson.serialize(data) } };
    }));

    const payload = isBatch || Object.keys(entries).length > 1 ? results : results[0];
    return new Response(JSON.stringify(payload), { headers: { 'Content-Type': 'application/json', 'cache-control': 'no-store' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: { code: -32603, message: e instanceof Error ? e.message : String(e) } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleTmdb(request, url) {
  const resource = url.searchParams.get('resource') ?? 'home';
  const lang = url.searchParams.get('lang') ?? 'vi';

  const TMDB_API = 'https://api.themoviedb.org/3';
  const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZmMyYzhkNTgwZjNiNDk1ODJhYzlmYWQ2MGQwYjUxZiIsIm5iZiI6MTc4NzU0MzM4Ni41OTgsInN1YiI6IjZhOGJiZjVhZGE2YmYxNTM5YWMwZWJkYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.uTk9LAYIiwJsoGj1bIboQ0IIklWw_R9SdG-lm-AB2zI';

  const tmdbLanguage = lang === 'vi' ? 'vi-VN' : 'en-US';

  async function tmdb(path, params = {}) {
    const u = new URL(`${TMDB_API}${path}`);
    u.searchParams.set('language', tmdbLanguage);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    const res = await fetch(u, { headers: { accept: 'application/json', authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) throw new Error(`TMDB_${res.status}`);
    return res.json();
  }

  function mapList(raw, fallback, locale) {
    return (raw.results || []).filter(item => item.media_type !== 'person').slice(0, 16).map(item => normalizeTitle(item, item.media_type === 'tv' ? 'tv' : fallback, locale));
  }

  function normalizeTitle(raw, mediaType, locale) {
    const name = mediaType === 'movie' ? raw.title : raw.name;
    const date = mediaType === 'movie' ? raw.release_date : raw.first_air_date;
    return {
      id: `tmdb-${mediaType}-${raw.id}`,
      tmdbId: raw.id,
      mediaType,
      title: name || 'Untitled',
      overview: raw.overview || 'No synopsis available.',
      releaseYear: date ? Number(String(date).slice(0, 4)) : null,
      rating: typeof raw.vote_average === 'number' ? Math.round(raw.vote_average * 10) / 10 : null,
      runtimeMinutes: raw.runtime || null,
      genres: Array.isArray(raw.genres) ? raw.genres.map(g => g.name) : [],
      posterUrl: raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : null,
      backdropUrl: raw.backdrop_path ? `https://image.tmdb.org/t/p/original${raw.backdrop_path}` : null,
    };
  }

  async function homeCatalog() {
    try {
      const [trending, movies, series] = await Promise.all([
        tmdb('/trending/all/day', {}),
        tmdb('/movie/popular', {}),
        tmdb('/tv/popular', {}),
      ]);
      const trendingItems = mapList(trending, 'movie', lang);
      const movieItems = mapList(movies, 'movie', lang);
      const seriesItems = mapList(series, 'tv', lang);
      const fallback = { id: 'demo-dunes', mediaType: 'movie', title: 'Dune: Part Two', releaseYear: 2024, rating: 8.2, overview: 'Demo', genres: ['Sci-Fi'], posterUrl: null, backdropUrl: null, runtimeMinutes: 166 };
      return { source: 'tmdb', hero: trendingItems[0] || movieItems[0] || fallback, rails: [
        { id: 'trending', label: lang === 'vi' ? 'Đang được quan tâm' : 'Trending now', items: trendingItems },
        { id: 'movies', label: lang === 'vi' ? 'Phim nổi bật' : 'Featured movies', items: movieItems },
        { id: 'series', label: lang === 'vi' ? 'Series phổ biến' : 'Popular series', items: seriesItems },
      ] };
    } catch {
      const fallback = { id: 'demo-dunes', mediaType: 'movie', title: 'Dune: Part Two', releaseYear: 2024, rating: 8.2, overview: 'Demo', genres: ['Sci-Fi'], posterUrl: null, backdropUrl: null, runtimeMinutes: 166 };
      return { source: 'demo', hero: fallback, rails: [{ id: 'popular', label: lang === 'vi' ? 'Được chọn cho bạn' : 'Picked for you', items: [fallback] }] };
    }
  }

  if (resource === 'home') return new Response(JSON.stringify(await homeCatalog()), { headers: { 'Content-Type': 'application/json' } });
  if (resource === 'search') {
    const query = url.searchParams.get('query') || '';
    return new Response(JSON.stringify(await (query.length < 2 ? [] : tmdb('/search/multi', { query, include_adult: 'false' }).then(r => mapList(r, 'movie', lang)))), { headers: { 'Content-Type': 'application/json' } });
  }
  const id = url.searchParams.get('id');
  if (id) {
    if (resource === 'title') {
      const match = /^tmdb-(movie|tv)-(\d+)$/.exec(id);
      if (!match) return new Response(JSON.stringify({ error: 'invalid_id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      try {
        const raw = await tmdb(`/${match[1]}/${match[2]}`, {});
        return new Response(JSON.stringify(normalizeTitle(raw, match[1] === 'tv' ? 'tv' : 'movie', lang)), { headers: { 'Content-Type': 'application/json' } });
      } catch { return new Response(JSON.stringify({ error: 'title_not_found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
    }
    if (resource === 'similar') {
      const match = /^tmdb-(movie|tv)-(\d+)$/.exec(id);
      if (!match) return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
      try {
        const raw = await tmdb(`/${match[1]}/${match[2]}/similar`, {});
        return new Response(JSON.stringify((raw.results || []).map(item => normalizeTitle(item, match[1] === 'tv' ? 'tv' : 'movie', lang))), { headers: { 'Content-Type': 'application/json' } });
      } catch { return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
      }
    }
  }
  return new Response(JSON.stringify({ error: 'unsupported_resource' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
}
