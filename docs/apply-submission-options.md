# Apply form: where submissions go

Research notes, 12 October 2026. Status: undecided. Nothing here is built.

## The problem

The Apply form (`src/components/apply/apply-form.tsx`) validates every field in the browser and then stops. Nothing is sent; the user sees "We can't take applications right now."

A solution has to cover four steps:

1. **Submit**: receive name, email, date of birth, event ID, a face photo, a shirtless photo and consent.
2. **Store**: keep the photos private and record the application somewhere the manager can read.
3. **Review**: let the manager look at the photos and mark each application approved or denied.
4. **Notify**: email the applicant. The page copy already promises an email once the application is processed.

Constraints:

- Keep the custom form built to the Figma guide.
- The repo has no dedicated backend and may never get one. It does have Next.js route handlers (`src/app/api/contentful/health/route.ts` is one), so small server-side steps are possible.
- The data is sensitive: face and shirtless photos, date of birth, name and email.

## Options

All four keep the custom form. Items marked "verify" are from memory and need checking against current docs or pricing before they go in a proposal.

### A. Google Apps Script, Sheet and Drive (current front-runner)

The browser posts to an Apps Script web app deployed to run as the manager. The script saves the photos to a private Drive folder and appends a row to a Sheet with a Status column. The manager changes Status; a trigger on that column sends the decision email.

- **Cost**: free.
- **Data lives in**: the manager's Google account.
- **Review experience**: a Sheet with links to the photos. No inline thumbnails, because `=IMAGE()` only works with public URLs.
- **Build effort**: low.
- **Things to know**:
  - Photos must be sent as base64 inside the request body; `doPost` does not reliably parse file uploads.
  - The request must use a `text/plain` content type; Apps Script cannot answer a CORS preflight.
  - A failed script still returns HTTP 200, so the script must return its own success flag and the form must check it.
  - Limits: about 30 simultaneous runs and 6 minutes per run (verify). Request body limit about 50 MB (verify).
  - Email from a consumer Gmail account is capped at about 100 recipients a day, about 1,500 on Workspace (verify).
  - The web app URL is public. See "Needed whichever option wins".
- **Variant A2**: send the emails from a Next route through a transactional email service such as Resend. This removes the Gmail cap and improves deliverability.
- **Variant A3**: post to a Next route first, which re-runs `src/lib/apply-validation.ts`, adds a shared secret and forwards to the script. This hides the script URL. On Vercel the request body is capped at about 4.5 MB (verify), so photos must be compressed in the browser first.

### B. Next.js writes straight to Google Sheets and Drive

A Next route calls the Sheets and Drive APIs itself, with no Apps Script.

- **Cost**: free, unless a Workspace shared drive is needed.
- **Data lives in**: the manager's Google account.
- **Review experience**: same Sheet as option A.
- **Build effort**: medium.
- **Things to know**:
  - Sheets is easy: share the Sheet with a service account and append rows.
  - Drive is the obstacle: a service account has no storage of its own, so uploads into a personal Drive folder fail without a Workspace shared drive (verify).
  - The workaround is storing the manager's OAuth token on the server. Submissions break if the token expires or is revoked.
  - Still subject to the host's request body cap.
- **Assessment**: more setup than A for the same result. Only worth it if Apps Script proves unreliable.

### C. Object storage, database and an admin page

Photos upload straight from the browser to private storage (Vercel Blob, Cloudflare R2 or Supabase Storage) using a short-lived upload URL. The application row goes into a database. A password-protected `/admin` page in this repo shows each applicant as a card with photos and approve/deny buttons.

- **Cost**: free tiers likely cover this volume (verify per provider).
- **Data lives in**: the storage and database provider.
- **Review experience**: the best of the four. Photos inline, one click to decide.
- **Build effort**: high. It is a real backend: auth for the admin page, a database and storage rules to maintain.
- **Things to know**:
  - No request size cap, because photos skip the Next server.
  - Deleting an applicant's data is one clean operation.
  - Decision emails need a transactional email service.

### D. Airtable as the back office

A Next route sends each application to Airtable. The manager reviews in a gallery view with photos shown inline. An Airtable automation emails the applicant when the status changes.

- **Cost**: free tier has record and attachment limits; paid per seat beyond that (verify).
- **Data lives in**: Airtable.
- **Review experience**: good, with no admin page to build.
- **Build effort**: low to medium.
- **Things to know**:
  - Attachment upload through the API has a small per-file limit, about 5 MB (verify), so photos must be compressed.
  - Sensitive photos sit with another vendor, which the privacy policy must name.

### E. Form backend service (Formspree, Basin, Getform and similar)

Not discussed earlier; added because it keeps the custom form. The form posts to the service's endpoint. The service stores the submission, emails the manager and can sync to a Sheet.

- **Cost**: file uploads are usually a paid tier (verify).
- **Data lives in**: the service, plus the Sheet if synced.
- **Review experience**: the service's dashboard or the synced Sheet.
- **Build effort**: lowest.
- **Things to know**:
  - Spam protection is built in.
  - Check file size limits, how long files are kept and whether uploaded photos are private.
  - Approve/deny emails to the applicant are not part of these services and would still need building.

### Ruled out

- **Google Forms**: file upload forces applicants to sign in to Google.
- **Hosted form builders (Tally, Jotform, Fillout)**: they replace the custom form.

## Comparison

| | A. Apps Script | B. Direct Google APIs | C. Storage + admin page | D. Airtable | E. Form backend |
|---|---|---|---|---|---|
| Cost | Free | Free, or Workspace | Free tiers | Free tier, then paid | Paid for uploads |
| Build effort | Low | Medium | High | Low to medium | Lowest |
| Review experience | Sheet with links | Sheet with links | Photo cards | Photo gallery | Dashboard or Sheet |
| Manager owns the data | Yes | Yes | No | No | No |
| Decision emails | Trigger, Gmail cap | Must build | Must build | Built-in automation | Must build |
| Ongoing maintenance | Low | Token upkeep | Highest | Low | Low |

## Needed whichever option wins

- **Compress photos in the browser.** Resize to roughly 2000 px and re-encode as JPEG. This fits every size limit above, speeds up mobile uploads, strips location data from the photo and lets the form accept any image format the phone can display.
- **Photo formats today.** The form accepts JPEG and PNG only. iPhone library photos are converted to JPEG automatically; HEIC picked from the Files app, and WebP or HEIF on Android, are rejected. Compression removes this limitation.
- **Spam protection.** Any endpoint is public. Add a hidden honeypot field, a Turnstile or reCAPTCHA check verified server-side, and a duplicate check on email plus event.
- **Server-side validation.** `src/lib/apply-validation.ts` is written to run on a server as well as in the browser. Browser checks alone can be bypassed.
- **Submitting state.** The submit button has no pending or disabled state. Uploads take several seconds, which invites double submissions.
- **Separate marketing consent.** `src/app/apply/page.tsx` says sharing an email means accepting promotional emails. The repo rules (`AGENTS.md`) require marketing consent to be separate and never preselected. Add an optional checkbox and store the answer.
- **Data handling.** Use an account the business owns, not a personal one. Keep photos private, never link-shared. Set a deletion schedule; the consent text promises applicants can withdraw. Consider storing "age verified" instead of the full date of birth. Name every vendor that holds the data in the privacy policy.
- **Door list.** A view of approved applicants per event gives door staff a check-in list at no extra cost in options A, B and D.

## Questions for the owner

1. How many applications are expected per event? Tens to a few hundred suits a Sheet; more than that makes one-by-one photo links slow.
2. Who reviews, and on what device? Reviewing on a phone favours C or D.
3. Is there a Google Workspace account, or only the consumer Gmail address?
4. Is there any monthly budget for tools?
5. Where will the site be hosted? This decides the request size cap.
6. Minimum age: 18 or 21? `MIN_AGE` in `apply-validation.ts` is still marked to confirm.
7. How long are photos kept after an event, and for denied applicants?
8. Should applicants get a receipt email on submission, or only the decision?

## Next steps

1. Check every "verify" item against current documentation and pricing.
2. Get answers to the owner questions, starting with volume and budget.
3. Prototype option A end to end with compressed photos: one submission, one row, two files, one decision email.
4. If the Sheet review feels too slow in that prototype, compare C and D for the review step only.
