# Admin CMS — Planning Notes

## Purpose

Provide Bethany with a secure, easy-to-use content management area so she can update the public website without editing source code or using GitHub.

## Proposed architecture

- Public website and admin interface: Cloudflare Pages.
- Authentication, content database, image storage, and authorization: Supabase.
- Keep the public site lightweight and mobile-first.
- Do not treat an obscure admin URL as security. Every privileged operation must be authenticated and authorized by backend policies.
- Use Supabase Row Level Security (RLS) for database access and appropriate Storage policies for media.
- Keep service-role credentials out of browser code. The admin browser client must use only the public/anon key with RLS.

## Planned admin sections

1. Dashboard — recent updates, drafts, publishing status, and shortcuts.
2. Galleries — create galleries, upload images, captions, ordering, visibility.
3. Dogs — profiles, photos, bios, milestones, and updates.
4. Blog / Latest Things — posts, drafts, categories, cover images, publish dates.
5. Events — title, description, start/end dates, location or online details, images, status.
6. Challenges — featured puzzle, weekly challenge details, schedule, and links.
7. Episodes — TikTok/video links, descriptions, thumbnails, and publish dates.
8. Media Library — reusable image and media assets with alt text and organization.
9. Site Settings — selected homepage text, featured items, and announcements.

## Publishing workflow

- Draft content is private to authorized administrators.
- Preview before publishing.
- Publish and unpublish actions are explicit.
- Store timestamps and the administrator responsible for changes where appropriate.
- Validate and sanitize user-entered content before displaying it publicly.
- Confirm deletion for destructive actions; prefer archive/soft-delete where practical.

## Initial data model candidates

- profiles / admin roles
- galleries
- media_assets
- gallery_items
- dog_profiles
- blog_posts
- events
- challenges
- episodes
- site_settings

Finalize fields and relationships before creating database tables. Avoid building a generic page builder unless a real need emerges.

## Security and privacy

- Start with Bethany as the sole administrator.
- Use Supabase Auth and RLS; no public write access to content tables.
- Restrict Storage uploads and deletes to authorized administrators.
- Keep secrets and privileged keys server-side only.
- Add file type/size validation and safe image processing.
- Public read access should expose only published content and fields intended for visitors.

## Cost and performance

- Check current Cloudflare and Supabase free-tier limits before launch; do not assume free tiers are unlimited.
- Optimize uploaded images into web-friendly formats and sizes.
- Generate responsive image variants and lazy-load gallery images.
- Keep admin scripts and styles separate from the public site so visitors do not download admin functionality unnecessarily.

## Implementation order

1. Build and test the Train Track game prototype.
2. Establish the public website foundations and shared components.
3. Implement Supabase authentication and authorization.
4. Build the admin shell and dashboard.
5. Add media library and galleries.
6. Add dog profiles, blog posts, events, episodes, and challenges.
7. Connect public pages to published content.
8. Test permissions, mobile usability, backups, and recovery before launch.

## Open decisions

- Whether to support more than one administrator.
- Whether any public submissions (comments, personal-best entries, etc.) need moderation tools.
- Whether galleries and blog posts need scheduled publishing.
- Retention and backup policy for uploaded originals.
