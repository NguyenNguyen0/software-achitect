# CMS — API Quick Reference

Base URL: `http://localhost:3000/api`

---

## Auth
| Method | Path | Body | Auth |
|--------|------|------|------|
| POST | `/auth/register` | `{name, email, password, role?}` | — |
| POST | `/auth/login` | `{email, password}` | — |
| GET | `/auth/me` | — | Bearer |

---

## Content
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/content` | — | `?status=published&type=article&tag=nodejs&search=query&page=1&limit=20` |
| GET | `/content/:id` | — | |
| GET | `/content/slug/:slug` | — | Increments viewCount |
| POST | `/content` | author+ | `{title, body, excerpt?, status?, type?, tags?}` |
| PATCH | `/content/:id` | author+ | Partial update |
| POST | `/content/:id/publish` | editor+ | Sets status=published |
| DELETE | `/content/:id` | editor+ | Hard delete |

---

## Users (admin only)
| Method | Path | Auth |
|--------|------|------|
| GET | `/users` | admin |
| PATCH | `/users/:id` | admin |
| DELETE | `/users/:id` | admin |

---

## Plugins
| Method | Path | Notes |
|--------|------|-------|
| GET | `/plugins` | List registered plugins |
| GET | `/search?q=query&type=article` | Full-text search (search plugin) |
| GET | `/seo/:slug` | SEO metadata for a slug (seo plugin) |

---

## File Upload
```
POST /upload
Content-Type: multipart/form-data
Authorization: Bearer <token>
Field: file
```

---

## Role Permissions
| Role | Can do |
|------|--------|
| viewer | Read public content |
| author | + Create & edit own content |
| editor | + Publish, delete any content |
| admin | + Manage users, all operations |
