**# ScholarMatch: Project Plan**



A platform that reads a student's CV, transcript and goals, checks them against real professor and scholarship requirements, tells the student exactly what to change, recommends the best professors and universities for that student, finds matching funded opportunities through public APIs, and runs personalised outreach campaigns from the student's own inbox.



Status: planning only. No code yet. Last revised 2026-11-12 (revision 4: outreach campaigns added, plan re-checked, weak features cut).



\---



**## 1. The problem**



Students lose scholarships and PhD/Master's positions for reasons that have nothing to do with talent:



\- They do not know what a specific professor or program actually requires (GPA floor, IELTS band, publications, specific skills, research-area fit).

\- They apply to opportunities they cannot win and miss ones they could win.

\- Their CV describes what they did, not what the reviewer is looking for.

\- Opportunity information is scattered across hundreds of university pages, PDFs and portals, and most of it expires quietly.

\- Contacting professors is slow and manual, and generic template emails get ignored.



**## 2. The product in one sentence**



Upload your CV and goals once. ScholarMatch scores you against each opportunity, shows the gap, tells you what to fix, recommends who to apply to, and sends and tracks personalised emails to them from your own inbox.



**## 3. Target users**



\| User | Need |

\|---|---|

\| Final-year undergraduate | Find funded Master's/PhD positions and scholarships abroad |

\| Master's student | Find a supervisor whose research matches their thesis and who is accepting students |

\| Student with a weak profile | Know exactly which 2 or 3 changes would unlock the most opportunities |

\| University career office (later) | Track a cohort of students and their application pipeline |



**## 4. Core features**



**### 4.1 Profile builder**



\- Upload CV (PDF/DOCX), transcript, test scores (IELTS/TOEFL/GRE), publications. Optional GitHub username (public API) to pull repositories and languages.

\- An LLM extracts a structured profile: education, GPA (normalised to a 4.0 and percentage scale), skills, research interests, publications, work experience, languages, nationality, degree level sought, funding needed, target countries.

\- The student reviews and corrects the extraction before anything is scored.

\- Profile page with editable sections, CV version history, profile strength meter and completeness checklist.

\- Settings: notification preferences, connected email account, data export, delete account (removes CV files, profile and campaign history).



Removed in revision 4: LinkedIn import. LinkedIn has no public API for profile data and scraping it violates their terms. The CV already carries the same information.



**### 4.2 Requirement checker ("will this professor accept me?")**



\- Input: a professor's name, lab page or email text, or a program/scholarship URL.

\- The system pulls the professor's recent papers, research topics, co-authors and lab page, and the program's stated admission requirements.

\- Output: a requirement-by-requirement table: Met / Partially met / Not met / Unknown, with evidence from the student's profile.

\- Research-fit score: semantic similarity between the student's interests and projects and the professor's last 3 to 5 years of publications.



**### 4.3 Gap analysis and change plan ("what should I change?")**



\- For every unmet requirement, a concrete action with estimated effort and impact, for example:

  - "Your IELTS is 6.0; this program needs 6.5. Retake: 4 to 8 weeks. Unlocks 23 more opportunities in your list."

  - "No publication. A workshop paper or preprint from your thesis would raise your match score for 14 of your top 30 professors."

\- A prioritised list: which single change opens the most doors.

\- CV rewrite suggestions: tailored bullet points that map the student's experience to the professor's keywords (the student edits and approves; the system never fabricates experience).

\- Statement of Purpose (SOP) review: the student pastes a draft; the system checks it against the program's stated criteria and the professor's research, and returns specific edits. Promoted from stretch in revision 4 because the SOP is the document that most often decides an application.



**### 4.4 Opportunity discovery**



\- Continuous ingestion of scholarships, funded PhD/Master's positions and research assistantships from APIs and structured sources (section 6).

\- Deduplication, deadline extraction, eligibility extraction (nationality, degree level, field, age, GPA).

\- Hard filters first (eligibility), then ranked by match score.

\- Alerts when a new opportunity above a threshold appears, or when a deadline is 14/7/2 days away.

\- Deadline calendar with export to Google Calendar or ICS file. Added in revision 4: cheap to build and the most requested thing in any application tracker.



**### 4.5 Match score**



A transparent score from 0 to 100 with a visible breakdown:



\| Component | Weight | How it is computed |

\|---|---|---|

\| Hard eligibility | gate | Nationality, degree level, field, deadline not passed. Fail = score 0 and hidden by default |

\| Academic fit | 35 | GPA vs stated or inferred floor, test scores vs requirement |

\| Research fit | 30 | Embedding similarity: student interests and projects vs professor publications or program description |

\| Skills fit | 15 | Required skills and tools vs student skills |

\| Experience fit | 20 | Publications, internships, research assistant roles, relevant projects |



Every component shows its evidence so the student can dispute it.



Removed in revision 4: the "Competitiveness" component (estimated applicant pool). There is no reliable data source for applicant pool size, so it was a guess dressed as a number. Selectivity now lives only in the Reach / Match / Safe tiering (section 4.7), where it is shown with its proxy (professor citation level, program funding size) instead of hidden inside the score.



**### 4.6 Application tracker**



\- Kanban: Discovered, Interested, Preparing, Applied, Interview, Result.

\- Required-documents checklist per opportunity (SOP, LoR count, transcripts, portfolio).

\- Document vault: upload SOP versions, transcripts, recommendation letters and certificates once, attach them to any application. Added in revision 4.

\- Every outreach email and reply (section 4.9) is linked to the professor's or opportunity's card, so the tracker shows the full history in one place.



**### 4.7 AI recommendations: "which university and professor is best for me?"**



The student does not have to know any names. The system proposes them, based on the student's own results: GPA, transcript, test scores, skills, projects, publications and experience taken from the verified profile. A student with a 3.9 GPA and a paper gets a different list than a student with a 3.1 GPA and no paper, and both lists are realistic for that student.



How it works, in four steps:



1\. Candidate generation. From the student's field, interests and target countries, pull professors from OpenAlex and Semantic Scholar who published in those topics in the last 5 years, are affiliated with a university in a target country, and (where known) are accepting students. Pull universities by aggregating those professors plus the scholarships attached to each university.

2\. Scoring. Every candidate gets the match score from section 4.5. Universities get an aggregate: number of matching professors, number of eligible scholarships, strength of the best professor match, and a cost signal (tuition and living cost band for the country).

3\. Tiering. Candidates are grouped into Reach, Match and Safe based on the student's score and a visible selectivity proxy, so the student builds a balanced list instead of only dream schools.

4\. Explanation. The AI writes a short "why this fits you" paragraph per recommendation, citing concrete evidence: the student's project X matches the professor's 2025 paper Y; the university offers scholarship Z the student is eligible for; the professor's lab lists skill W which the student has.



What the student sees:



\- Top 10 professors and top 10 universities, each with score, tier, the why-paragraph, matching papers, available funding, and one-click "add to tracker" and "add to campaign".

\- Filters: country, funding type, degree level, language of instruction, deadline window.

\- "Compare" view: pick 2 or 3 and see side-by-side requirements, funding, deadlines and gaps.

\- "Improve my list": what single change would move the most Reach items into Match.

\- An AI advisor chat that answers questions over the student's own data: "Should I pick A or B for machine learning in Germany?", "Which of these has funding for my nationality?", "What would Professor X expect in my email?" Answers cite the profile, the professor data and the opportunity records; the model is not allowed to invent professors, deadlines or funding that are not in the database.



Freshness and honesty rules:



\- Every recommendation shows the date the professor and opportunity data were last fetched.

\- "Accepting students" is shown as Yes, No or Unknown, never guessed.

\- Rankings are not used as a hidden factor. If the student wants rank, it is shown as a visible filter with its source.



**### 4.8 Dashboard**



\- Profile strength meter and top 3 recommended changes.

\- Opportunities: count by match band, upcoming deadlines.

\- Outreach: emails sent this week, replies, follow-ups due.

\- Progress over time: how the student's reachable-opportunity count changed after each improvement.

\- Weekly digest email: new matches, deadlines in the next 14 days, replies received, follow-ups due.



Removed in revision 4: "map by country" widget. Decorative, and the country filter already answers the question.



**### 4.9 Outreach campaigns: one click, many personalised emails, all tracked (added 2026-11-12)**



Goal: the student selects professors or universities, the system writes a different email for each one, the student approves the batch, one click sends them all from the student's own inbox, and every reply and follow-up is tracked automatically.



Design principle: this is personalised outreach, not mass mailing. Professors delete template emails and remember senders who spam a department. Every guardrail below exists to protect the student's reputation and deliverability.



Step 1. Connect the student's own mailbox.

\- Gmail via the Gmail API, or Outlook / university Microsoft 365 via Microsoft Graph, with OAuth. The student grants send and read permission for their own account.

\- Emails are sent from the student's real address. Replies land in the student's normal inbox. The platform never sends from its own domain on the student's behalf, which is what triggers spam filters and looks fake to professors.

\- The university email address is preferred when the student has one; professors reply to .edu / .ac addresses more often.



Step 2. Build a campaign.

\- Pick recipients from Recommendations, the tracker, or a manual list. A campaign can mix professors and program or admissions contacts.

\- Contact discovery: the professor's email is taken from the lab page, the university directory, or the corresponding-author field of their papers (Crossref and OpenAlex expose this for many papers). Each address gets a syntax and mail-server check. If no address is found, the card says so and the student can add one manually. Nothing is guessed from name patterns.

\- Per-recipient drafting: the AI writes a unique email for each recipient using the professor's specific recent paper, the student's matching project or result, the funding the student is asking about, and a clear ask (meeting, PhD opening, supervision). The student's CV is attached. Subject lines are varied per recipient.

\- A uniqueness check rejects any two drafts that are near-identical, so the "personalised" promise is enforced, not hoped for.



Step 3. Review and one-click send.

\- Batch review screen: each draft shown with the recipient, the evidence the AI used, and Edit / Approve / Remove. "Approve all" is available only after the student has opened every draft once.

\- One click "Send campaign". Sending is staggered over the day in a natural pattern rather than all at once, and never more than the daily cap (default 10 per day, adjustable to a maximum of 20) to stay under Gmail and Microsoft sending limits and avoid spam-pattern detection.

\- Rule: no more than 2 professors in the same department per campaign per week, because departments talk to each other.

\- A do-not-contact list: anyone who replied "not accepting" or asked not to be contacted is blocked platform-wide for that student.



Step 4. Track everything automatically.

\- Status per recipient: Drafted, Approved, Scheduled, Sent, Bounced, Replied, Interested, Declined, No response.

\- Reply detection by reading the thread in the student's mailbox (Gmail push notifications via Pub/Sub, or Graph change notifications, with polling as fallback). The AI classifies each reply: interested, asks for more information, not accepting, referral to another person, auto-reply / out of office. Referrals create a suggested new recipient.

\- No tracking pixels and no link tracking. They are blocked by most university mail systems, professors dislike them, and reply status is the signal that matters.

\- Bounces mark the address invalid and prompt the student to find another.



Step 5. Follow-ups.

\- If there is no reply after 10 to 14 days, the system drafts one short polite follow-up referencing the first email. The student can pre-approve follow-ups at campaign creation or approve them one by one. Maximum one follow-up per recipient, ever.

\- Out-of-office replies pause the follow-up timer until the stated return date.



Campaign analytics:

\- Reply rate per campaign, time to reply, which evidence types (paper reference, shared skill, funding question) correlate with replies, and the best sending days. Used to improve future drafts.



Privacy and compliance:

\- Mailbox tokens are encrypted and the student can disconnect at any time, which also deletes synced reply content.

\- The platform reads only threads it started, not the whole inbox, by filtering on message IDs it sent.

\- Gmail send scope is a sensitive scope: a public app needs Google's OAuth verification. During development and the demo, the app runs in testing mode, which allows up to 100 named test users. Microsoft Graph has the equivalent admin-consent step for university tenants. Both are scheduled in Phase 3.



**## 5. User flow**



1\. Sign up, upload CV and transcript, answer 6 short questions (degree sought, field, countries, funding need, start term, nationality).

2\. Review the extracted profile and fix mistakes.

3\. See the dashboard: profile strength, top matches, top 3 changes.

4\. Open Recommendations: professors and universities proposed from the student's results, tiered Reach / Match / Safe.

5\. Open an opportunity or professor: requirement table, score breakdown, missing documents, gap actions.

6\. Select 8 professors, build a campaign, review the 8 drafts, send with one click.

7\. Track applications and replies; receive deadline, reply and follow-up alerts.



**## 6. Data sources and APIs**



**### Professors and research (free, well documented)**



\| Source | What we get | Notes |

\|---|---|---|

\| OpenAlex API | Authors, institutions, papers, topics, citation counts, corresponding-author data | Primary source for professor research profile. Free, no key needed for polite use |

\| Semantic Scholar API | Papers, abstracts, author details, embeddings | Backup and richer abstracts. Free key |

\| ORCID public API | Verified author identity, affiliations, funding | Identity resolution |

\| Crossref API | DOI metadata, funders, corresponding-author emails where present | Funding, affiliation and contact enrichment |

\| University lab and directory pages | "Accepting students", required skills, contact email, how to apply | Fetched and parsed by LLM; cached with a timestamp |



**### Scholarships and funded positions**



\| Source | How | Notes |

\|---|---|---|

\| EURAXESS (EU research jobs) | RSS and structured listing pages | PhD and postdoc positions across Europe |

\| DAAD scholarship database | Structured pages | Germany |

\| FindAPhD, jobs.ac.uk, AcademicPositions | Listing pages with structured fields | Must respect robots.txt and terms; cache, do not republish full text |

\| Government portals (Chevening, Fulbright, Erasmus Mundus, MEXT, CSC, Australia Awards, Swedish Institute) | Annual pages | Parsed once per cycle; deadlines are stable year to year |

\| Partner universities / career office uploads | CSV or form | Lets a university add its own opportunities |



Moved to stretch in revision 4: community submissions with moderation. Moderation is a staffing cost a student project cannot carry, and unverified listings damage trust faster than they add coverage.



**### Email**



\| Need | Choice |

\|---|---|

\| Gmail send and read | Gmail API with OAuth, Pub/Sub push for replies |

\| Outlook / Microsoft 365 send and read | Microsoft Graph with OAuth, change notifications for replies |

\| Address validation | Syntax check plus mail-server (MX) lookup |



**### Scoring and extraction**



\| Need | Choice |

\|---|---|

\| CV and transcript extraction, requirement parsing, gap explanations, SOP review, email drafts, reply classification | Claude API, model \`claude-opus-5\` by default |

\| Cheap high-volume classification (is this listing a scholarship? which field? deadline?) | Claude API, model \`claude-haiku-4-5\` |

\| Research-fit similarity | Text embeddings stored in a vector index (pgvector) |

\| PDF text | Sent to the model directly as a document; OCR fallback for scanned transcripts |



Rule: the LLM extracts, drafts and explains. It never decides eligibility alone and never sends anything. Hard eligibility is rule-based from structured fields so the result is auditable; every email is approved by the student.



**## 7. Architecture**



\`\`\`

Browser (Next.js app)

   |

   v

Next.js route handlers + Server Actions

   |        |         \\

   |        |          --> AI service (provider adapters, section 7.1)

   |        |          --> Embedding service + pgvector (research fit)

   |        |          --> Gmail API / Microsoft Graph (send, read replies)

   |        v

   |   PostgreSQL (profiles, opportunities, scores, applications, campaigns, messages)

   |

   v

Scheduled jobs (Vercel Cron / Inngest; NestJS worker only if needed)

   - Ingestion crawlers per source

   - Normaliser + deduplicator

   - Re-scoring job when a profile or an opportunity changes

   - Campaign sender (staggered, daily cap) and follow-up scheduler

   - Reply sync and classification

   - Alert and weekly digest sender

   |

   v

Object storage (uploaded CVs and documents, encrypted at rest)

\`\`\`



Chosen stack (decided 2026-11-12):



\- Full-stack Next.js (App Router, TypeScript, Tailwind, shadcn/ui, Recharts). API routes and Server Actions are the backend. No separate backend service for the MVP.

\- NestJS is reserved for Phase 2 only if the crawlers or the campaign sender need a long-running worker process. Start with Vercel Cron or Inngest calling Next.js route handlers; move to a NestJS worker only if jobs exceed the serverless time limit.

\- Database: PostgreSQL with pgvector via Prisma. Free tier on Neon or Supabase.

\- Storage: Supabase Storage or an S3-compatible bucket for uploaded CVs and documents.

\- Auth: Auth.js with email magic link plus Google sign-in. The Google sign-in can request the Gmail scopes later, in the same consent flow.

\- AI: Claude API through the official TypeScript SDK behind the plug-and-play layer (7.1). Main model \`claude-opus-5\`; \`claude-haiku-4-5\` for bulk listing classification. PDFs are sent to Claude directly as document blocks, so no separate PDF parser is needed.

\- Embeddings for research fit: Voyage AI (has a free tier) stored in pgvector. For the MVP, research fit can be scored by the model directly and embeddings added in Phase 2.

\- Hosting: Vercel for the app, Neon/Supabase for the database.



**### 7.1 Plug-and-play AI layer (decided 2026-11-12)**



The app never calls a vendor SDK directly from feature code. All AI goes through one internal "AI service" with named tasks:



1\. extractProfile(cv file or text) -> structured profile JSON

2\. parseRequirements(page text) -> structured requirements JSON with confidence per field

3\. scoreResearchFit(student statement, professor papers) -> 0 to 1 plus top 3 matching papers

4\. explainGap(profile, unmet requirement) -> action text, effort, impact

5\. draftOutreach(profile, professor, campaign goal) -> subject and body

6\. classifyReply(thread) -> interested / more info / not accepting / referral / auto-reply

7\. reviewSOP(draft, program criteria, professor topics) -> edits

8\. classifyListing(text) -> type, field, deadline, eligibility



Each task has a fixed JSON schema for its output. Providers are adapters behind that interface:



\| Provider | How it connects | Notes |

\|---|---|---|

\| Anthropic Claude | Official SDK | Default. Native PDF input, strict JSON output |

\| OpenAI | Official SDK | PDF must be converted to text first |

\| Google Gemini | Official SDK | Native PDF input, free tier available |

\| Groq, Together, OpenRouter, Ollama (local) | OpenAI-compatible endpoint | One adapter covers all of these; OpenRouter gives one key for many models |



Implementation choice: Vercel AI SDK, which already ships adapters for every provider above and a common structured-output call. The adapter for each provider is a few lines; the prompts and schemas are shared.



Configuration:



\- Environment variables select the provider and model per task, for example AI_PROVIDER_EXTRACT and AI_MODEL_EXTRACT. Cheap tasks and expensive tasks can use different providers.

\- An admin settings page lets you switch provider and model without redeploying, and shows cost and latency per task.

\- A fallback chain: if the primary provider errors or rate-limits, retry on the next one.

\- A capability check: if the chosen provider cannot read PDFs, the app runs a text extraction step first; if it cannot do strict JSON, the app validates the output and retries once.



Limits of plug-and-play, stated honestly:



\- Prompts tuned for one model may do worse on another. The hand-built test set (Phase 0) is what you re-run after switching, and quality is accepted only if the extraction accuracy target still holds.

\- Features differ (PDF input, JSON mode, context size, rate limits). The adapter hides this but cannot make a weak model strong.

\- Embeddings are a separate interface with its own adapters (Voyage, OpenAI, Gemini, local). Switching embedding provider means re-embedding all stored papers.

\- Costs and privacy terms differ per vendor; the privacy page must name whichever provider is live.



**## 8. Data model (main tables)**



\- \`users\` (id, email, nationality, created_at)

\- \`profiles\` (user_id, degree_level, gpa_raw, gpa_scale, gpa_normalised, test_scores JSON, skills[], interests[], target_countries[], funding_need, start_term, raw_cv_text, extracted_json, verified_at)

\- \`publications\` (profile_id, title, venue, year, doi, role)

\- \`documents\` (profile_id, kind[cv|sop|transcript|lor|certificate], version, file_url, uploaded_at)

\- \`professors\` (id, openalex_id, orcid, name, institution, department, topics[], accepting_students, lab_url, email, email_source, email_verified, last_checked)

\- \`professor_papers\` (professor_id, title, abstract, year, embedding)

\- \`universities\` (id, openalex_id, name, country, cost_band, scholarships_count)

\- \`opportunities\` (id, type[scholarship|phd|masters|ra], title, provider, university_id, country, field, degree_level, deadline, eligibility JSON, requirements JSON, url, source, first_seen, last_seen, verified)

\- \`scores\` (profile_id, target_type, target_id, total, breakdown JSON, tier, computed_at)

\- \`gap_actions\` (profile_id, action, effort_weeks, impact_count, status)

\- \`applications\` (profile_id, opportunity_id or professor_id, stage, notes, documents JSON, updated_at)

\- \`mailboxes\` (user_id, provider[gmail|graph], address, encrypted_tokens, connected_at, status)

\- \`campaigns\` (user_id, name, goal, daily_cap, followup_days, followup_preapproved, status, created_at)

\- \`campaign_recipients\` (campaign_id, professor_id or contact JSON, status, scheduled_at, sent_at, thread_id, reply_class, followup_sent_at)

\- \`messages\` (recipient_id, direction[out|in], subject, body, provider_message_id, sent_at)

\- \`do_not_contact\` (user_id, email, reason, created_at)

\- \`alerts\` (user_id, kind, payload, sent_at)



**## 9. Scoring and matching logic (detail)**



1\. Normalise the profile: GPA to 4.0 and percent; map degree names to levels; map skills to a controlled vocabulary with synonyms.

2\. Parse each opportunity's requirements into structured fields with the LLM, with a confidence per field. Low confidence stays "Unknown" rather than guessing.

3\. Apply hard gates.

4\. Compute each soft component on a 0 to 1 scale, multiply by weights, sum.

5\. Research fit: embed the student's "research statement" (interests plus project descriptions) and compare with the mean embedding of the professor's last 5 years of papers, plus the best single-paper similarity.

6\. Explain: for each component, generate a one-line evidence string from structured data (not free-form LLM guesses).

7\. Gap actions: for each unmet or weak component, simulate the profile with the fix applied, re-score all opportunities, and report how many cross the "strong match" threshold. That number is the "unlocks N opportunities" figure.

8\. Tiering: compare the student's score with a visible selectivity proxy (professor citation band, program funding size) to assign Reach / Match / Safe.



**## 10. Privacy, ethics and safety**



\- CVs and emails contain personal data. Encrypt at rest, delete on request, never train on user data, never share profiles with third parties.

\- Clear statement that scores are estimates, not admission decisions, and that professors and committees make the final call.

\- No fabricated CV, SOP or email content. Drafts reuse only facts the student provided.

\- No email is ever sent without the student approving that specific draft. Daily caps, department limits, one follow-up maximum and the do-not-contact list are not configurable above their maximums.

\- Respect source terms: robots.txt, rate limits, store summaries and links rather than republishing full listings.

\- Bias check: make sure nationality and gender never enter soft scores, only official eligibility rules.



**## 11. Development phases**



**### Phase 0: Research and design (1 week)**



\- Collect 30 real opportunities and 20 real professor pages by hand. Write down their requirements and contact emails. This becomes the test set.

\- Interview 5 to 10 students about what they actually struggle with, including how they currently email professors.

\- Finalise the scoring weights and the controlled skill vocabulary.

\- Wireframes for the 6 main screens (dashboard, profile, recommendations, opportunity detail, campaign review, tracker).



**### Phase 1: MVP (3 to 4 weeks)**



\- Auth, CV upload, LLM extraction, profile review screen.

\- Manual opportunity entry plus OpenAlex professor lookup.

\- Match score with breakdown; requirement table; gap actions.

\- Professor recommendations from the student's results: top 10 professors with tier and why-paragraph.

\- Single-professor outreach draft (no sending yet; copy to clipboard).

\- Simple dashboard.

\- Goal: a student can upload a CV, see who fits them, pick a professor, and get a believable, explainable report and a draft email.



**### Phase 2: Discovery engine (3 weeks)**



\- Ingestion workers for EURAXESS, DAAD and 2 or 3 listing sites.

\- Deduplication, deadline and eligibility extraction, re-scoring job.

\- University recommendations and the Compare view.

\- Alerts for new matches and deadlines; deadline calendar export.

\- Application tracker and document vault.



**### Phase 3: Outreach campaigns and polish (3 weeks)**



\- Gmail and Microsoft mailbox connection (OAuth, testing mode).

\- Campaign builder, contact discovery, per-recipient drafting, uniqueness check, batch review, staggered sending with caps.

\- Reply sync and classification, follow-up scheduler, do-not-contact list, campaign analytics.

\- SOP review and CV rewrite suggestions.

\- AI advisor chat over the student's own data, with the no-invention rule.

\- Accuracy evaluation against the hand-built test set; fix the worst extraction errors.

\- Responsive UI, empty states, onboarding, error handling, weekly digest.

\- Demo video and pitch.



**### Phase 4: Stretch**



\- Career-office cohort view.

\- Interview preparation: likely questions generated from the professor's recent papers and the student's own CV, with model answers the student edits. Added in revision 4.

\- Browser extension: open any professor page and get the fit report and a draft email instantly.

\- Community-submitted opportunities with moderation.

\- Funding calculator: stipend vs living cost per city.



**## 12. Success metrics**



\- Extraction accuracy: at least 90 percent of GPA, degree, test score fields correct on the test set.

\- Requirement parsing: at least 85 percent of fields correctly labelled Met / Not met on the test set.

\- Research-fit sanity: a student's own supervisor ranks in the top 10 percent of professors for that student.

\- Outreach: reply rate on campaign emails at least 2x the rate students report for their own manual emails in the Phase 0 interviews; zero bounces from guessed addresses because none are guessed.

\- Usefulness: in a pilot of 20 students, at least 70 percent say the gap actions were specific and actionable.

\- Freshness: no opportunity shown with a deadline already passed.



**## 13. Risks and mitigations**



\| Risk | Mitigation |

\|---|---|

\| Scraped listings change format and break | One small parser per source, monitored; LLM fallback parsing; sources marked stale after 30 days |

\| LLM hallucinates a requirement | Confidence scores, "Unknown" by default, link to the source sentence, student can flag errors |

\| Students over-trust the score | Visible breakdown, explicit disclaimer, show evidence |

\| Campaign emails read as spam and damage the student's reputation | Per-recipient uniqueness check, daily cap, department limit, one follow-up maximum, sent from the student's own address, student approves every draft |

\| Mailbox provider blocks sending | Stay well under provider limits, stagger sends, surface provider errors to the student immediately |

\| Google OAuth verification delays a public launch | Run in testing mode for the demo and pilot (up to 100 test users); start verification in Phase 3 |

\| API rate limits and cost | Cache professor profiles for 30 days, use the cheaper model for classification, batch jobs at night |

\| Legal issues with scraping | Prefer official APIs and RSS; store links and summaries only; honour robots.txt |

\| Scope creep | Each phase ships before the next starts |



**## 14. Demo story for a presentation**



1\. Upload a real-looking CV with a 3.2 GPA and IELTS 6.0.

2\. Show the dashboard: 41 opportunities found, 9 strong matches, top change: "Raise IELTS to 6.5 unlocks 17 more".

3\. Open Recommendations: the system proposes 10 professors and 5 universities from this student's results, tiered Reach / Match / Safe, each with a why-paragraph.

4\. Open one professor. Show the requirement table and the research-fit score with the three most similar papers.

5\. Click the gap action, mark IELTS as 6.5, watch the match count jump live and two Reach professors move to Match.

6\. Select 6 professors, click "Build campaign". Show 6 different drafts, each citing a different paper. Approve and send with one click; show the staggered schedule.

7\. Switch to a prepared account where replies have arrived: two Interested, one Not accepting (now on the do-not-contact list), three No response with follow-ups scheduled.

8\. Move an Interested professor to "Interview" in the tracker and show the deadline alert.



**## 15. Revision 4 re-check summary**



Added: outreach campaigns with tracking (4.9), SOP review (4.3), deadline calendar export (4.4), document vault (4.6), weekly digest (4.8), interview preparation (stretch), funding calculator (stretch), email and campaign tables (8), outreach metric (12).



Removed or demoted: LinkedIn import (no API), Competitiveness score component (no data), map-by-country widget (decorative), community submissions moved to stretch (moderation cost).



Changed: score weights rebalanced to 35 / 30 / 15 / 20 after removing Competitiveness; Phase 3 renamed and extended to 3 weeks for campaigns; demo story extended with the campaign flow.



**## 16. Open decisions**



\- Default daily send cap: 10 is recommended; the student can raise it to 20.

\- Should follow-ups be pre-approved by default? Recommendation: off by default, on by a checkbox at campaign creation.

\- Which 3 listing sources for Phase 2? Recommendation: EURAXESS, DAAD, jobs.ac.uk.

\- Free tier vs paid: the demo is free; a career-office licence is the obvious later revenue path.



**## 17. Immediate next steps**



1\. Confirm the scope above and the tech stack.

2\. Build the hand-curated test set of 30 opportunities and 20 professors with contact emails.

3\. Draw the 6 wireframes.

4\. Start Phase 1.



**## 18. Timeline: how many days (added 2026-11-12)**



Assumptions:



\- One developer (you) building with Claude Code, about 5 to 6 focused hours a day, 6 days a week.

\- Responsive from day one: phone first, then tablet (two columns), then desktop (sidebar plus content). Built once with Tailwind breakpoints, not three separate designs.

\- "Mobile app feel" is delivered as a Progressive Web App (PWA): installable icon on the home screen, full-screen, offline shell, push notifications for deadlines and replies. No native iOS or Android app in this timeline; a native wrapper (Capacitor) is a stretch item of about 5 extra days.

\- Days below are working days. Calendar time is about 1.2x.



\| Block | Working days | Calendar |

\|---|---|---|

\| Phase 0: research, test set, wireframes | 5 | Week 1 |

\| Phase 1: MVP | 18 | Weeks 2 to 4 |

\| Phase 2: discovery engine | 15 | Weeks 5 to 7 |

\| Phase 3: outreach campaigns and polish | 18 | Weeks 8 to 10 |

\| Buffer for bugs, OAuth setup, demo rehearsal | 4 | Week 11 |

\| Total | 60 | About 11 weeks |



Faster or slower:



\- Full-time, 8 hours a day: about 42 working days, 8 to 9 weeks.

\- Part-time, 2 to 3 hours a day: about 110 working days, 5 to 6 months.

\- Two developers splitting frontend and backend: about 7 weeks.



**### Day-by-day**



Phase 0 (days 1 to 5)

\- Day 1: write the 6 wireframes on paper or Figma: dashboard, profile, recommendations, opportunity detail, campaign review, tracker. Phone layout first.

\- Day 2: design system: colours, type scale, spacing, components list (card, score ring, tier badge, requirement row, kanban column, draft review card).

\- Day 3 to 4: hand-collect 30 opportunities and 20 professors with requirements and contact emails. Save as JSON. This is the test set.

\- Day 5: finalise scoring weights and skill vocabulary; write the AI task schemas (section 7.1).



Phase 1 MVP (days 6 to 23)

\- Day 6: scaffold Next.js, Tailwind, shadcn/ui, Prisma, Neon database, Auth.js. Responsive app shell: bottom tab bar on phone, sidebar on tablet and desktop. PWA manifest and icons.

\- Day 7: database schema for users, profiles, documents, professors, papers, scores, gap actions.

\- Day 8 to 9: AI service layer with provider adapters and the extractProfile task. CV upload to storage.

\- Day 10 to 11: profile review and edit screens, all breakpoints. Profile strength meter.

\- Day 12 to 13: OpenAlex and Semantic Scholar integration: professor search, papers, topics. Caching.

\- Day 14 to 15: match score engine, requirement parsing, requirement table screen.

\- Day 16 to 17: gap analysis, "unlocks N" simulation, gap action cards.

\- Day 18 to 19: professor recommendations: candidate generation, tiering, why-paragraphs, recommendation list and detail screens.

\- Day 20: single-professor outreach draft with copy-to-clipboard.

\- Day 21: dashboard.

\- Day 22 to 23: test on real phones and a tablet, fix layout bugs, run the test set, fix extraction errors.



Phase 2 Discovery engine (days 24 to 38)

\- Day 24 to 25: job runner (Vercel Cron or Inngest), ingestion framework, source parser interface.

\- Day 26 to 28: parsers for EURAXESS, DAAD, and one listing site. Listing classification with the cheap model.

\- Day 29 to 30: deduplication, deadline and eligibility extraction, nightly re-scoring job.

\- Day 31 to 32: opportunity list and detail screens with filters; university recommendations and Compare view.

\- Day 33 to 34: application tracker kanban (drag on desktop, tap-to-move on phone) and document vault.

\- Day 35 to 36: alerts: in-app, email, PWA push; deadline calendar with ICS and Google Calendar export.

\- Day 37 to 38: embeddings via Voyage and pgvector for research fit; test and tune.



Phase 3 Outreach campaigns and polish (days 39 to 56)

\- Day 39 to 40: Google and Microsoft OAuth for mailbox connection, encrypted token storage, testing-mode setup.

\- Day 41 to 42: contact discovery (lab page, directory, corresponding author) and address validation.

\- Day 43 to 44: campaign builder, per-recipient drafting, uniqueness check.

\- Day 45 to 46: batch review screen (swipe through drafts on phone, grid on desktop), approve flow, one-click send.

\- Day 47 to 48: staggered sender with daily cap, department rule, do-not-contact list.

\- Day 49 to 50: reply sync (push notifications plus polling), reply classification, status updates, follow-up scheduler.

\- Day 51: campaign analytics screen.

\- Day 52: SOP review and CV rewrite suggestions.

\- Day 53: AI advisor chat.

\- Day 54: weekly digest, onboarding flow, empty states, error states.

\- Day 55: accessibility and performance pass: keyboard, contrast, Lighthouse on mobile, offline shell.

\- Day 56: run the full test set again; fix the worst errors.



Buffer and demo (days 57 to 60)

\- Day 57 to 58: bugs found in a 5-student pilot.

\- Day 59: seed a demo account with prepared replies; record the demo video.

\- Day 60: pitch deck and rehearsal.



**### What "all devices" means in practice**



\| Screen | Phone (under 640px) | Tablet (640 to 1024px) | Desktop (over 1024px) |

\|---|---|---|---|

\| Navigation | Bottom tab bar, 5 tabs | Collapsible side rail | Full sidebar |

\| Dashboard | Stacked cards | Two-column grid | Three-column grid |

\| Recommendations | Card list, swipe to compare | Two-column cards | Table with inline why-paragraph |

\| Requirement table | Accordion rows | Full table | Full table with evidence column |

\| Campaign review | One draft per screen, swipe next | Two drafts side by side | Grid of drafts |

\| Tracker | Column picker with tap-to-move | Horizontal scroll kanban | Full kanban with drag |



The PWA adds: install prompt, splash screen, offline access to the profile and tracker, and push notifications for deadlines and replies.



**## 19. The one-week version (added 2026-11-12, overrides section 18 if the deadline is 7 days)**



Reality: the full plan is 60 working days. In 7 days you can ship a convincing, working demo of the core loop if you cut hard and work 10 to 12 hours a day with Claude Code generating most of the code. This section is that cut.



**### What ships in 7 days**



\| Feature | 7-day version |

\|---|---|

\| Profile | CV upload, Claude extraction, review and edit screen, strength meter |

\| Requirement checker | Professor lookup via OpenAlex, requirement table, match score with breakdown |

\| Gap analysis | Unmet requirements with actions and "unlocks N" count |

\| Recommendations | Top 10 professors from the student's results, Reach / Match / Safe, why-paragraph |

\| Opportunities | 40 to 60 real opportunities hand-seeded into the database with eligibility and deadlines; list, filters, detail, match score. No crawlers |

\| Outreach campaign | Pick professors, one unique draft each, batch review, one-click send through the student's Gmail, daily cap, status tracking, reply polling with AI classification, one scheduled follow-up |

\| Tracker | Kanban with tap-to-move on phone, drag on desktop, linked to campaign status |

\| Dashboard | Strength, top 3 changes, matches by band, deadlines, replies |

\| Devices | Responsive phone, tablet, desktop from day 1; PWA installable with icon and splash |

\| AI | Claude only, behind the adapter interface so other providers can be added later |



**### What is cut or faked, and what to say about it in the presentation**



\| Cut | Why | What to say |

\|---|---|---|

\| Crawlers for EURAXESS, DAAD, listing sites | 2 weeks of work on their own | "Data is seeded from real listings; ingestion is the next sprint" |

\| Embeddings and pgvector | Research fit is scored directly by the model for now | "Vector search replaces this at scale" |

\| Microsoft / Outlook mailbox | Gmail only | "Outlook is the same adapter pattern" |

\| University recommendations, Compare view | Professors cover the demo | Roadmap |

\| SOP review, CV rewrite, advisor chat | Nice AI features, not the core loop | Roadmap |

\| Document vault, calendar export, weekly digest, analytics | Polish | Roadmap |

\| Contact discovery from directories | Emails are entered by hand for the demo professors, or taken from the corresponding-author field | "Automated discovery is next" |

\| Google OAuth verification | App runs in testing mode with named test accounts | Explain testing mode if asked |