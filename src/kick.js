/* Live Kick data hydration (client-side, CORS permitting).
   kick.com/api/v2 is unofficial, so every call degrades gracefully back to the
   mock data in data.js — a channel that fails keeps its mock roll.
   Verified response shapes (probed 06/2026):
   · clips:    { id, title, duration(s), views, created_at, thumbnail_url, clip_url(.m3u8) }
   · videos:   { id, session_title, start_time, duration(ms), views, thumbnail.src,
                 source(.m3u8), video.uuid }   (Kick retains ~30 most recent)
   · channel:  { livestream|null, user.profile_pic }
   Official OAuth (id.kick.com, PKCE) needs a server-side token exchange — see README. */
import D from './data.js';

const { fmt, dayNum, cityOn } = D._helpers;

const api = async (path) => {
  const r = await fetch(`https://kick.com/api/v2/${path}`, { mode: 'cors' });
  if (!r.ok) throw new Error(`kick api ${r.status}`);
  return r.json();
};

const two = (n) => String(n).padStart(2, '0');
const secToClip = (s) => `${Math.floor(s / 60)}:${two(Math.round(s % 60))}`;
const msToHMS = (ms) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 3600)}:${two(Math.floor((s % 3600) / 60))}:${two(s % 60)}`;
};

/* Kick sends either ISO strings or 'YYYY-MM-DD HH:MM:SS' (UTC). */
const stamp = (raw) => {
  const d = new Date(raw.includes('T') ? raw : `${raw.replace(' ', 'T')}Z`);
  return { date: fmt(d), time: `${two(d.getHours())}:${two(d.getMinutes())}`, day: dayNum(d), cityId: cityOn(d).id };
};

const hueFrom = (key) => 30 + (Math.abs([...String(key)].reduce((a, ch) => a + ch.charCodeAt(0), 0)) % 60);

/* Channel emote set — lives at kick.com/emotes/<slug> (a different base than
   /api/v2). The response is [channelSet, Global, Emoji]; the channel's own set
   is the one whose id is the numeric channel_id. Image: files.kick.com/emotes/<id>/fullsize. */
async function fetchEmotes(slug) {
  const r = await fetch(`https://kick.com/emotes/${slug}`, { mode: 'cors' });
  if (!r.ok) throw new Error(`kick emotes ${r.status}`);
  const sets = await r.json();
  const own = Array.isArray(sets) ? sets.find((s) => typeof s.id === 'number') : null;
  return (own?.emotes || []).map((e) => ({
    id: e.id,
    name: e.name,
    subOnly: !!e.subscribers_only,
    src: `https://files.kick.com/emotes/${e.id}/fullsize`,
  }));
}

/* Subscriber badges ride along in the channel object (no extra request). */
const mapBadges = (chan) => (chan?.subscriber_badges || [])
  .map((b) => ({ months: b.months, src: b.badge_image?.src || null }))
  .filter((b) => b.src)
  .sort((a, b) => a.months - b.months);

const mapClip = (c, slug) => ({
  id: c.id,
  kind: 'clip',
  url: `https://kick.com/${slug}/clips/${c.id}`,
  title: c.title,
  channel: slug,
  duration: secToClip(c.duration || 0),
  views: c.views ?? c.view_count ?? 0,
  thumbnail: c.thumbnail_url || null,
  playbackUrl: c.clip_url || c.video_url || null,
  thumbHue: hueFrom(c.id),
  ...stamp(c.created_at),
});

const mapVideo = (v, slug) => ({
  id: `vod_live_${v.id}`,
  kind: 'vod',
  source: 'kick',
  url: v.video?.uuid ? `https://kick.com/video/${v.video.uuid}` : `https://kick.com/${slug}/videos`,
  title: v.session_title || `VOD ${v.id}`,
  channel: slug,
  duration: msToHMS(v.duration || 0),
  views: v.views ?? v.video?.views ?? 0,
  thumbnail: v.thumbnail?.src || null,
  playbackUrl: v.source || null,
  thumbHue: hueFrom(v.id),
  ...stamp(v.start_time || v.created_at),
});

const replaceChannelItems = (arr, slug, items) => {
  for (let i = arr.length - 1; i >= 0; i--) if (arr[i].channel === slug) arr.splice(i, 1);
  arr.push(...items);
  arr.sort((a, b) => a.day - b.day || a.channel.localeCompare(b.channel));
};

/* Builds a member's social row from the real Kick profile fields
   (instagram/twitter/youtube/tiktok/discord live on the user object). */
const socialLinks = (u, slug) => {
  const clean = (v) => String(v || '').trim().replace(/^@/, '');
  const links = [{ platform: 'kick', href: `https://kick.com/${slug}` }];
  if (u.instagram) links.push({ platform: 'instagram', href: `https://instagram.com/${clean(u.instagram)}` });
  if (u.twitter) links.push({ platform: 'x', href: `https://x.com/${clean(u.twitter)}` });
  if (u.youtube) links.push({ platform: 'youtube', href: `https://youtube.com/@${clean(u.youtube)}` });
  if (u.tiktok) links.push({ platform: 'tiktok', href: `https://tiktok.com/@${clean(u.tiktok)}` });
  if (u.discord) links.push({ platform: 'discord', href: `https://discord.gg/${clean(u.discord)}` });
  return links;
};

/* Walks the clips cursor back through a channel's full history
   ({clips, nextCursor} pages of 20, verified live). onBatch fires with the
   accumulated list so the UI can grow as pages land. */
async function fetchClipHistory(slug, { maxPages = 40, firstCursor = null, seed = [], notifyEvery = 4, onBatch } = {}) {
  const all = [...seed];
  let cursor = firstCursor;
  for (let p = 0; p < maxPages; p++) {
    const qs = `sort=date&time=all${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
    let j;
    try { j = await api(`channels/${slug}/clips?${qs}`); } catch (e) { break; }
    const clips = j?.clips || [];
    if (!clips.length) break;
    all.push(...clips.map((c) => mapClip(c, slug)));
    cursor = j.nextCursor;
    if (onBatch && (p + 1) % notifyEvery === 0) onBatch(all);
    if (!cursor) break;
  }
  if (onBatch) onBatch(all);
  return all;
}

/* Pulls real clips, VODs, avatars, socials and live status for the whole crew.
   Phase 1 (awaited): identity, live status, VODs and the newest clip page per
   channel — enough to paint. Phase 2 (background): the FULL clip history pages
   in, calling onProgress as batches land so rolls keep growing.
   Mutates D in place; mock data stays wherever a channel fails. */
export async function hydrateKick(onProgress) {
  const out = { clips: 0, vods: 0, live: [], failed: [] };
  const deep = []; // phase-2 jobs

  await Promise.all(D.CAST.filter((c) => c.slug).map(async (m) => {
    const slug = m.slug;
    try {
      const [chan, clipsR, vids] = await Promise.all([
        api(`channels/${slug}`),
        api(`channels/${slug}/clips?sort=date&time=all`),
        api(`channels/${slug}/videos`),
      ]);
      const u = chan?.user || {};
      if (u.profile_pic) m.photo = u.profile_pic;
      m.socials = socialLinks(u, slug);
      if (slug === 'chickenandy') m.socials.push({ platform: 'powerchat', href: D.LINKS.powerchat });
      m.live = !!chan?.livestream;
      if (m.live) out.live.push(slug);

      /* ChickenAndy's real sub badges (sync, from chan) + channel emotes
         (async, non-blocking — refreshes the UI when the set lands). */
      if (slug === 'chickenandy') {
        const badges = mapBadges(chan);
        if (badges.length) D.SUB.badges = badges;
        fetchEmotes(slug)
          .then((em) => { if (em.length) { D.SUB.emotes = em; if (onProgress) onProgress({ emotes: em.length }); } })
          .catch(() => { /* CORS/offline — emote rail stays hidden */ });
      }

      const firstPage = (clipsR?.clips || []).map((c) => mapClip(c, slug));
      const vods = (Array.isArray(vids) ? vids : []).map((v) => mapVideo(v, slug));
      if (firstPage.length) { replaceChannelItems(D.CLIPS, slug, firstPage); out.clips += firstPage.length; }
      if (vods.length) { replaceChannelItems(D.VODS, slug, vods); out.vods += vods.length; }

      if (clipsR?.nextCursor) {
        deep.push(() => fetchClipHistory(slug, {
          maxPages: slug === 'chickenandy' ? 400 : 5,
          firstCursor: clipsR.nextCursor,
          seed: firstPage,
          onBatch: (all) => {
            replaceChannelItems(D.CLIPS, slug, all);
            D.rebuildDays();
            if (onProgress) onProgress({ slug, clips: all.length });
          },
        }));
      }
    } catch (e) {
      out.failed.push(slug); /* CORS, offline or Cloudflare — mock roll stays */
    }
  }));
  if (out.clips || out.vods) D.rebuildDays();
  console.info('[rvx] kick hydration:', JSON.stringify(out));

  /* phase 2 — fire and keep paging in the background */
  Promise.all(deep.map((job) => job())).then(() => {
    console.info(`[rvx] full clip history loaded: ${D.CLIPS.length} clips`);
    if (onProgress) onProgress({ done: true, clips: D.CLIPS.length });
  });

  return out;
}
