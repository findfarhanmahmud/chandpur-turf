# Student Nexus BD

**Building a connected ecosystem where students discover teammates, collaborate on projects, and find opportunities to turn their ideas into reality.**

Student Nexus BD is an ongoing student-led software project designed to connect ambitious students in Bangladesh through collaboration, skill discovery, projects, and opportunities. The long-term vision is to grow beyond a conventional student networking platform into an ecosystem where students can find collaborators, build meaningful projects, participate in competitions, and grow together.

> **Project status: Under active development.** Features, database availability, and overall functionality may change as development continues.

## About the Project

Finding the right people to work with can be difficult, especially for students interested in programming, artificial intelligence, cybersecurity, research, entrepreneurship, and competitions.

Student Nexus BD aims to bridge this gap by providing a shared platform where students can discover people with complementary skills, connect with potential teammates, collaborate on projects, and explore opportunities.

The project initially focuses on students in Bangladesh, with a long-term vision of supporting a broader international student community.

## Key Features

The platform includes or is being developed around the following features:

- **Find Teammates** — Discover students based on their profiles, skills, interests, and backgrounds.
- **Profiles** — Showcase personal information, skills, interests, and achievements.
- **Connections** — Connect with other students and build a collaboration network.
- **Teams** — Organize students around shared goals and projects.
- **Projects** — Create projects, discover collaborators, and recruit team members.
- **Applications** — Apply to join projects and manage application statuses.
- **Opportunities** — Discover internships, competitions, scholarships, fellowships, jobs, workshops, and more.
- **Community** — Participate in discussions around shared interests and technical fields.
- **Messaging** — Communicate with other users for collaboration.
- **Notifications** — Receive updates about relevant activity, applications, and interactions.
- **Resources** — Access useful learning and development resources.
- **Achievements** — Showcase accomplishments and milestones.
- **Analytics** — Explore activity and progress through a dedicated dashboard.
- **Authentication** — Account access and protected application features using Supabase Auth.

Feature availability and completeness may vary while development and testing continue.

## Technology Stack

The project uses the following technologies:

| Technology | Purpose |
|---|---|
| Next.js | Application framework |
| React | User interface |
| TypeScript | Type safety and maintainability |
| Supabase | Backend services and database |
| PostgreSQL | Relational data storage |
| Supabase Auth | Authentication |
| Supabase Storage | File and avatar storage |
| Supabase Realtime | Live updates and notifications |
| Git & GitHub | Version control and collaboration |

## Development Status

Student Nexus BD is an active work in progress. Development focuses on improving the user experience, strengthening backend functionality, fixing bugs, improving database consistency, and making the platform more reliable and secure.

Current development priorities include:

- Improving profile navigation and user identity handling.
- Strengthening opportunity deadline and application validation.
- Refining project application and notification workflows.
- Improving database reliability and access control.
- Testing application behavior across different user accounts.
- Preparing the application for a more reliable public release.

Some features may be incomplete, change during development, or behave unexpectedly.

## Live Database Availability

**Please note:** The application uses Supabase for its backend and database. The database or associated backend services may occasionally be unavailable because the hosted project may be paused or turned off during development, maintenance, or periods of inactivity.

When this happens, some features may fail to load or work correctly, including login, profiles, projects, opportunities, and notifications.

If the application appears broken or data does not load, the issue may be temporary backend unavailability rather than a problem with the user interface itself.

I am continuing to improve the application's reliability as development progresses. Thank you for your patience.

## Running Locally

You can explore the project locally if you have the required development tools and access to a configured Supabase project.

### Prerequisites

- Node.js and npm
- Git
- A Supabase project
- Supabase project URL and appropriate API keys

### Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd startup
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the application root and configure the environment variables required by the project.

For example, a typical Supabase configuration may look like:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** Check the project's actual environment-variable names before running the application. The example above is illustrative and may need to be adjusted to match the current codebase.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

For a production build, run:

```bash
npm run build
```

### Database Configuration

A working Supabase backend is required for database-dependent features. Depending on the current project setup, you may also need to apply the database migrations and configure authentication, storage buckets, and Row Level Security (RLS) policies.

Never commit private service-role keys, passwords, or other secrets to GitHub.

## Project Vision

The long-term goal is to make student collaboration easier and more accessible.

Imagine a student preparing for a hackathon who needs a developer, a designer, and someone with business skills. Or a cybersecurity enthusiast looking for teammates for a Capture the Flag competition. Or an aspiring researcher searching for people who share the same interests.

Student Nexus BD aims to help these people find one another and turn individual ambitions into collaborative achievements.

The vision extends beyond profiles and connections: **discover people, form teams, build projects, pursue opportunities, and grow together.**

## Contributions and Feedback

Student Nexus BD is still evolving. Feedback, bug reports, feature suggestions, and constructive technical discussion are welcome.

If you encounter a problem, please include:
- What you were trying to do.
- The steps needed to reproduce the issue.
- Any relevant error message.
- Whether the issue appears related to database availability.

Please avoid sharing passwords, API secrets, or private user information in issues.

## Disclaimer

This repository represents an ongoing development project. It is not yet a guarantee of production-level availability or reliability. Features, architecture, and documentation may evolve as the project develops.

---

**Student Nexus BD**  
*Connecting students. Building teams. Creating possibilities.*
